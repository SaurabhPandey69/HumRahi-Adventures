// app/api/agent/recommend/route.ts
import { AgentOrchestrator } from "@/lib/agents/Orchestrator";

const orchestrator = new AgentOrchestrator();

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { userId, location, budget, groupSize, startDate, endDate, interests } = body;
    
    // Let the agent work autonomously
    const result = await orchestrator.handleRequest(userId, {
      userId,
      location,
      budget,
      groupSize,
      startDate,
      endDate,
      interests
    });
    
    return Response.json(result);
    
  } catch (error: any) {

  console.error("Agent error:", error);

  return Response.json(
    {
      error: error?.message || "Internal Server Error",
    },
    {
      status: 500,
    }
  );
}
}
