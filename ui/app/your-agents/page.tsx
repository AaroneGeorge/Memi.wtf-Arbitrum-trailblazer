"use client";

import { agents } from "@/lib/data";
import { UserAgentCard } from "@/components/user-agent-card";
import { useRouter } from "next/navigation";

// TODO: Replace this with actual user authentication
const MOCK_USER_ID = "user123";

export default function YourAgentsPage() {
  const router = useRouter();
  // Filter agents created by the user
  // TODO: Replace this with actual backend call to get user's agents
  const userAgents = agents.filter((agent) => agent.creator === MOCK_USER_ID);

  const handleEdit = (agentId: string) => {
    router.push(`/edit-agent/${agentId}`);
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-white">Your Agents</h1>
        <button
          onClick={() => router.push("/create")}
          className="bg-pink-500 hover:bg-pink-600 text-white px-4 py-2 rounded-md"
        >
          Create New Agent
        </button>
      </div>
      
      {userAgents.length === 0 ? (
        <p className="text-zinc-400">You haven't created any agents yet.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {userAgents.map((agent) => (
            <UserAgentCard
              key={agent.id}
              {...agent}
              onEdit={() => handleEdit(agent.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
} 