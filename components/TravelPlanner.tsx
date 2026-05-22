// components/TravelPlanner.tsx
import { useState } from "react";

export function TravelPlanner() {
  const [isPlanning, setIsPlanning] = useState(false);
  const [recommendation, setRecommendation] = useState(null);
  const [agentThoughts, setAgentThoughts] = useState<string[]>([]);
  
  const planTrip = async () => {
    setIsPlanning(true);
    setAgentThoughts(["🤖 Agent activated: Planning your trip..."]);
    
    // Simulate agent thinking in real-time
    const eventSource = new EventSource("/api/agent/stream");
    
    eventSource.onmessage = (event) => {
      const data = JSON.parse(event.data);
      setAgentThoughts(prev => [...prev, data.message]);
      
      if (data.type === "complete") {
        setRecommendation(data.result);
        setIsPlanning(false);
        eventSource.close();
      }
    };
    
    // Send request
    await fetch("/api/agent/recommend", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        userId: "user123",
        location: "Rishikesh",
        budget: 25000,
        groupSize: 4,
        startDate: "2026-05-20",
        endDate: "2026-05-23",
        interests: ["adventure", "rafting", "camping"]
      })
    });
  };
  
  return (
    <div className="p-6">
      <button 
        onClick={planTrip}
        disabled={isPlanning}
        className="bg-blue-600 text-white px-6 py-3 rounded-lg"
      >
        {isPlanning ? "🤖 AI Agent Planning..." : "✨ Plan with AI Agent"}
      </button>
      
      {/* Agent's Thought Process */}
      {agentThoughts.length > 0 && (
        <div className="mt-6 p-4 bg-gray-100 rounded-lg">
          <h3 className="font-bold">Agent's Reasoning:</h3>
          <ul className="mt-2 space-y-1">
            {agentThoughts.map((thought, i) => (
              <li key={i} className="text-sm">{thought}</li>
            ))}
          </ul>
        </div>
      )}
      
      {/* Recommendation Result */}
      {recommendation && (
        <div className="mt-6 p-4 bg-green-50 rounded-lg border border-green-200">
          <h3 className="font-bold text-green-800">✨ Your Personalized Package</h3>
          <pre className="mt-2 text-sm">
            {JSON.stringify(recommendation, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
}