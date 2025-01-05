"use client";

import { agents } from "@/lib/data";
import { AgentCard } from "@/components/agent-card";
import { useFavorites } from "@/contexts/favorites-context";
import { useAccount } from "wagmi";
import { Card } from "@/components/ui/card";

export default function FavouritesPage() {
  const { isConnected } = useAccount();
  const { favorites } = useFavorites();
  const favouriteAgents = agents.filter((agent) =>
    favorites.includes(agent.id)
  );

  if (!isConnected) {
    return (
      <div className="container mx-auto p-6 max-w-2xl h-[80vh] flex items-center justify-center">
        <Card className="bg-zinc-900 border-zinc-800 p-6 text-center">
          <h1 className="text-2xl font-bold text-white mb-6">Favourite Agents</h1>
          <p className="text-zinc-400 mb-6">Please connect your wallet to view your favourite agents</p>
          <w3m-button />
        </Card>
      </div>
    );
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-white mb-6">Favourite Agents</h1>
      {favouriteAgents.length === 0 ? (
        <p className="text-zinc-400">No favourite agents yet.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {favouriteAgents.map((agent) => (
            <AgentCard key={agent.id} {...agent} />
          ))}
        </div>
      )}
    </div>
  );
}
