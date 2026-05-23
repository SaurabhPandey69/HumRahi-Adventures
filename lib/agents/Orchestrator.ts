// lib/agents/Orchestrator.ts
import { TravelAgent } from "./TravelAgent";

interface AgentTask {
  id: string;
  type: "plan" | "book" | "modify" | "cancel";
  priority: number;
  data: any;
}

export class AgentOrchestrator {
  private agents: Map<string, TravelAgent>;
  private taskQueue: AgentTask[];
  private isProcessing: boolean;
  
  constructor() {
    this.agents = new Map();
    this.taskQueue = [];
    this.isProcessing = false;
  }
  
  async handleRequest(userId: string, request: any): Promise<any> {
    // Get or create agent for user
    let agent = this.agents.get(userId);
    if (!agent) {
      agent = new TravelAgent(userId);
      this.agents.set(userId, agent);
    }
    
    // Add task to queue
    const task: AgentTask = {
      id: crypto.randomUUID(),
      type: "plan",
      priority: 1,
      data: request
    };
    
    this.taskQueue.push(task);
    this.processQueue();
    
    // Wait for result
    return new Promise((resolve) => {
      const checkInterval = setInterval(() => {
        const completed = this.getCompletedTask(task.id);
        if (completed) {
          clearInterval(checkInterval);
          resolve(completed);
        }
      }, 100);
    });
  }
  
  private async processQueue() {
    if (this.isProcessing) return;
    this.isProcessing = true;
    
    // Sort by priority
    this.taskQueue.sort((a, b) => a.priority - b.priority);
    
    while (this.taskQueue.length > 0) {
      const task = this.taskQueue.shift();
      if (task) {
        await this.executeTask(task);
      }
    }
    
    this.isProcessing = false;
  }
  
  private async executeTask(task: AgentTask) {
    console.log(`🤖 Executing task ${task.id} of type ${task.type}`);
    
    const agent = this.agents.get(task.data.userId);
    if (!agent) return;
    
    try {
      const result = await agent.planTrip(task.data);
      this.storeResult(task.id, result);
    
    } catch (error) {
  console.error(`Task ${task.id} failed:`, error);

  const message =
    error instanceof Error
      ? error.message
      : "Unknown error";

  this.storeResult(task.id, {
    error: message,
  });
}
  }
  
  private completedTasks: Map<string, any> = new Map();
  
  private storeResult(taskId: string, result: any) {
    this.completedTasks.set(taskId, result);
  }
  
  private getCompletedTask(taskId: string): any {
    return this.completedTasks.get(taskId);
  }
}