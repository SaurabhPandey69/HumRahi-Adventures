// lib/agents/BaseAgent.ts
import OpenAI from "openai";

export interface Tool {
  name: string;
  description: string;
  parameters: any;
  execute: (params: any) => Promise<any>;
}

export interface AgentMemory {
  userId: string;
  preferences: Map<string, any>;
  previousRecommendations: any[];
  failedAttempts: string[];
  context: Record<string, any>;
}

export abstract class BaseAgent {
  protected openai: OpenAI;
  protected memory: AgentMemory;
  protected tools: Map<string, Tool>;
  
  constructor(userId: string) {
    this.openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    this.memory = {
      userId,
      preferences: new Map(),
      previousRecommendations: [],
      failedAttempts: [],
      context: {}
    };
    this.tools = new Map();
    this.registerTools();
  }
  
  abstract registerTools(): void;
  
  async think(prompt: string): Promise<string> {
    const response = await this.openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        { role: "system", content: this.getSystemPrompt() },
        { role: "user", content: prompt }
      ],
      temperature: 0.7,
    });
    return response.choices[0].message.content || "";
  }
  
  abstract getSystemPrompt(): string;
  
  async useTool(toolName: string, params: any): Promise<any> {
    const tool = this.tools.get(toolName);
    if (!tool) throw new Error(`Tool ${toolName} not found`);
    return await tool.execute(params);
  }
  
  async reflect(outcome: any): Promise<void> {
    // Learn from outcomes
    if (outcome.error) {
      this.memory.failedAttempts.push(outcome.error);
    }
  }
}