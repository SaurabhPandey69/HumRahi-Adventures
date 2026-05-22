// lib/agents/TravelAgent.ts
import { BaseAgent, Tool } from "./BaseAgent";
import { prisma } from "@/lib/prisma";
import { matchVendors } from "@/lib/vendorMatcher";

interface TravelPlan {
  destination: string;
  dates: { start: Date; end: Date };
  budget: number;
  groupSize: number;
  interests: string[];
  accommodation: string;
}

export class TravelAgent extends BaseAgent {
  
  registerTools() {
    // Tool 1: Search Vendors
    this.tools.set("search_vendors", {
      name: "search_vendors",
      description: "Search for available vendors near a location",
      parameters: {
        location: "string",
        category: "string",
        date: "string"
      },
      execute: async ({ location, category, date }) => {
        return await prisma.vendor.findMany({
          where: {
            city: { contains: location, mode: "insensitive" },
            category: category,
            isActive: true,
            isApproved: true
          }
        });
      }
    });
    
    // Tool 2: Check Availability
    this.tools.set("check_availability", {
      name: "check_availability",
      description: "Check if a vendor is available on a specific date",
      parameters: {
        vendorId: "string",
        date: "string"
      },
      execute: async ({ vendorId, date }) => {
        const blocked = await prisma.vendorAvailability.findFirst({
          where: { vendorId, date, available: false }
        });
        return { available: !blocked };
      }
    });
    
    // Tool 3: Calculate Price
    this.tools.set("calculate_price", {
      name: "calculate_price",
      description: "Calculate total package price",
      parameters: {
        vendors: "array",
        groupSize: "number",
        duration: "number"
      },
      execute: async ({ vendors, groupSize, duration }) => {
        let total = 0;
        for (const vendor of vendors) {
          total += vendor.basePrice * duration;
        }
        // Apply group discount
        if (groupSize > 4) total *= 0.9;
        return { total, perPerson: total / groupSize };
      }
    });
    
    // Tool 4: Get Weather
    this.tools.set("get_weather", {
      name: "get_weather",
      description: "Get weather forecast for a location",
      parameters: { location: "string", date: "string" },
      execute: async ({ location, date }) => {
        // Integrate with weather API
        const response = await fetch(
          `https://api.openweathermap.org/data/2.5/forecast?q=${location}&appid=${process.env.WEATHER_API_KEY}`
        );
        return await response.json();
      }
    });
    
    // Tool 5: Find Alternatives
    this.tools.set("find_alternatives", {
      name: "find_alternatives",
      description: "Find alternative vendors if primary choice is unavailable",
      parameters: {
        location: "string",
        category: "string",
        excludeVendorId: "string"
      },
      execute: async ({ location, category, excludeVendorId }) => {
        return await prisma.vendor.findMany({
          where: {
            city: { contains: location, mode: "insensitive" },
            category: category,
            id: { not: excludeVendorId },
            isActive: true
          },
          take: 3
        });
      }
    });
    
    // Tool 6: Create Booking Draft
    this.tools.set("create_booking_draft", {
      name: "create_booking_draft",
      description: "Create a draft booking in the database",
      parameters: {
        packageName: "string",
        totalPrice: "number",
        durationDays: "number",
        bookingDate: "string"
      },
      execute: async ({ packageName, totalPrice, durationDays, bookingDate }) => {
        return await prisma.bookingDraft.create({
          data: {
            packageName,
            totalPrice,
            pricePerPerson: totalPrice / (this.memory.preferences.get("groupSize") || 1),
            durationDays,
            bookingDate: new Date(bookingDate),
            breakdown: []
          }
        });
      }
    });
  }
  
  getSystemPrompt(): string {
    return `You are an autonomous travel planning agent for HumRahi Adventures.

Your capabilities:
- Search for vendors in any location
- Check real-time availability
- Calculate dynamic pricing
- Find alternatives when vendors are unavailable
- Create booking drafts

Your decision process:
1. First, understand user preferences from memory
2. Search for vendors matching criteria
3. Check availability for requested dates
4. If unavailable, find alternatives automatically
5. Calculate best price combination
6. Create booking draft
7. Present recommendation with reasoning

You have access to these tools: search_vendors, check_availability, calculate_price, get_weather, find_alternatives, create_booking_draft

Always think step by step. If a vendor is unavailable, automatically find alternatives.`;
  }
  
  async planTrip(userRequest: {
    location: string;
    budget: number;
    groupSize: number;
    startDate: string;
    endDate: string;
    interests: string[];
  }): Promise<any> {
    
    // Store in memory
    this.memory.preferences.set("location", userRequest.location);
    this.memory.preferences.set("budget", userRequest.budget);
    this.memory.preferences.set("groupSize", userRequest.groupSize);
    this.memory.preferences.set("interests", userRequest.interests);
    
    const duration = Math.ceil(
      (new Date(userRequest.endDate).getTime() - new Date(userRequest.startDate).getTime()) /
      (1000 * 60 * 60 * 24)
    );
    
    console.log("🤖 Agent thinking: Planning trip to", userRequest.location);
    
    // Step 1: Determine required categories based on interests
    const categories = this.determineCategories(userRequest.interests);
    
    // Step 2: Search for vendors (parallel execution)
    const vendorPromises = categories.map(async (category) => {
      const vendors = await this.useTool("search_vendors", {
        location: userRequest.location,
        category: category,
        date: userRequest.startDate
      });
      return { category, vendors };
    });
    
    const categoryVendors = await Promise.all(vendorPromises);
    
    // Step 3: Check availability for each vendor
    const availableVendors = [];
    for (const { category, vendors } of categoryVendors) {
      for (const vendor of vendors) {
        const { available } = await this.useTool("check_availability", {
          vendorId: vendor.id,
          date: userRequest.startDate
        });
        
        if (available) {
          availableVendors.push({ ...vendor, category });
        } else {
          // Step 4: Auto-find alternatives for unavailable vendors
          console.log(`🔄 Vendor ${vendor.name} unavailable, finding alternatives...`);
          const alternatives = await this.useTool("find_alternatives", {
            location: userRequest.location,
            category: category,
            excludeVendorId: vendor.id
          });
          
          for (const alt of alternatives) {
            const altAvailable = await this.useTool("check_availability", {
              vendorId: alt.id,
              date: userRequest.startDate
            });
            if (altAvailable.available) {
              availableVendors.push({ ...alt, category });
              break;
            }
          }
        }
      }
    }
    
    // Step 5: Calculate pricing
    const pricing = await this.useTool("calculate_price", {
      vendors: availableVendors,
      groupSize: userRequest.groupSize,
      duration: duration
    });
    
    // Step 6: Check if within budget
    let finalVendors = availableVendors;
    if (pricing.total > userRequest.budget) {
      console.log("💰 Over budget! Finding cheaper alternatives...");
      finalVendors = await this.optimizeForBudget(
        availableVendors,
        userRequest.budget,
        duration,
        userRequest.groupSize
      );
      
      const newPricing = await this.useTool("calculate_price", {
        vendors: finalVendors,
        groupSize: userRequest.groupSize,
        duration: duration
      });
      pricing.total = newPricing.total;
      pricing.perPerson = newPricing.perPerson;
    }
    
    // Step 7: Get weather information (optional enhancement)
    const weather = await this.useTool("get_weather", {
      location: userRequest.location,
      date: userRequest.startDate
    });
    
    // Step 8: Create booking draft
    const draft = await this.useTool("create_booking_draft", {
      packageName: `${userRequest.location} Adventure Package`,
      totalPrice: pricing.total,
      durationDays: duration,
      bookingDate: userRequest.startDate
    });
    
    // Step 9: Generate AI explanation
    const explanation = await this.think(`
      I found a package for ${userRequest.location}:
      - Duration: ${duration} days
      - Total cost: ₹${pricing.total}
      - Per person: ₹${pricing.perPerson}
      - Vendors: ${finalVendors.map(v => v.name).join(", ")}
      
      The weather forecast shows: ${JSON.stringify(weather)}
      
      Explain this recommendation to the user in a friendly, exciting way.
      Mention why these vendors were chosen and any alternatives considered.
    `);
    
    return {
      success: true,
      package: {
        name: `${userRequest.location} Adventure`,
        durationDays: duration,
        totalPrice: pricing.total,
        pricePerPerson: pricing.perPerson,
        vendors: finalVendors,
        weather: weather,
        draftId: draft.id
      },
      explanation: explanation,
      alternativesConsidered: this.memory.failedAttempts
    };
  }
  
  private determineCategories(interests: string[]): string[] {
    const categories = new Set<string>();
    
    if (interests.some(i => ["adventure", "river", "water"].includes(i))) {
      categories.add("rafting");
    }
    if (interests.some(i => ["trek", "hike", "mountain"].includes(i))) {
      categories.add("trekking");
    }
    if (interests.some(i => ["hotel", "stay", "luxury"].includes(i))) {
      categories.add("hotel");
    }
    
    categories.add("transport"); // Always needed
    
    return Array.from(categories);
  }
  
  private async optimizeForBudget(
    vendors: any[],
    budget: number,
    duration: number,
    groupSize: number
  ): Promise<any[]> {
    // Sort by price
    const sorted = [...vendors].sort((a, b) => a.basePrice - b.basePrice);
    
    // Take cheapest options
    let selected = [];
    let currentTotal = 0;
    
    for (const vendor of sorted) {
      const cost = vendor.basePrice * duration;
      if (currentTotal + cost <= budget) {
        selected.push(vendor);
        currentTotal += cost;
      }
    }
    
    return selected;
  }
}