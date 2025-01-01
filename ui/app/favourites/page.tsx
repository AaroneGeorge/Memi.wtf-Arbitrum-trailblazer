"use client";

import { agents } from "@/lib/data";
import { AgentCard } from "@/components/agent-card";
import { useFavorites } from "@/contexts/favorites-context";

export default function FavouritesPage() {
  const { favorites } = useFavorites();
  const favouriteAgents = agents.filter((agent) =>
    favorites.includes(agent.id)
  );

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
