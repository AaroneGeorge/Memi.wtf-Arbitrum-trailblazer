"use client";

import { useState, useEffect } from "react";
import { AgentCard } from "@/components/agent-card";
import { useFavorites } from "@/contexts/favorites-context";
import { useAccount } from "wagmi";
import WalletConnectButton from "@/components/wallet-connect-button";
import { getImageSrc } from "@/lib/utils";

const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;

type Bot = {
  name: string;
  bio: string;
  creator: string;
  image: string;
};

export default function FavoritesPage() {
  const [favoriteAgents, setFavoriteAgents] = useState<Bot[]>([]);
  const [creators, setCreators] = useState<Record<string, string>>({});
  const { favorites } = useFavorites();
  const { address } = useAccount();

  useEffect(() => {
    const fetchFavoriteAgents = async () => {
      if (!favorites.length) {
        setFavoriteAgents([]);
        return;
      }

      try {
        const response = await fetch(`${backendUrl}/bots`);
        const data = await response.json();
        const filteredBots = data.bots.filter((bot: Bot) => 
          favorites.includes(bot.name)
        );
        setFavoriteAgents(filteredBots);

        // Fetch creator usernames
        const creatorMap: Record<string, string> = {};
        for (const bot of filteredBots) {
          try {
            const userResponse = await fetch(`${backendUrl}/users/${bot.creator}`);
            const userData = await userResponse.json();
            creatorMap[bot.creator] = userData.username;
          } catch (error) {
            console.error(`Error fetching creator for ${bot.creator}:`, error);
            creatorMap[bot.creator] = bot.creator.slice(0, 6) + '...' + bot.creator.slice(-4);
          }
        }
        setCreators(creatorMap);
      } catch (error) {
        console.error('Error fetching favorite agents:', error);
      }
    };

    fetchFavoriteAgents();
  }, [favorites]);

  if (!address) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-white mb-4">
            Connect your wallet to view favorites
          </h2>
          <WalletConnectButton />
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-2xl font-bold text-white mb-6">Your Favorite Agents</h1>
      {favoriteAgents.length === 0 ? (
        <p className="text-zinc-400">No favorite agents yet.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {favoriteAgents.map((agent) => (
            <AgentCard
              key={agent.name}
              id={agent.name}
              name={agent.name}
              description={`Created by ${creators[agent.creator] || 'Loading...'}`}
              image={getImageSrc(agent.image) || '/assets/anyachan.jpg'}
              bio={agent.bio}
            />
          ))}
        </div>
      )}
    </div>
  );
}
