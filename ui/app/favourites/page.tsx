"use client";

import { useState, useEffect } from "react";
import { AgentCard } from "@/components/agent-card";
import { useFavorites } from "@/contexts/favorites-context";
import { useAccount } from "wagmi";
import WalletConnectButton from "@/components/wallet-connect-button";
import { getImageSrc } from "@/lib/utils";
import { Card } from "@/components/ui/card";
import Squares from "@/components/Squares";
import { getAgentsByProfileIds, getUserProfiles } from "@/lib/firebase/firestore";
import type { Agent } from "@/app/types";
import type { UserProfile } from "@/lib/firebase/firestore";

const truncateAddress = (address: string) => {
  if (!address) return "";
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
};

export default function FavoritesPage() {
  const [favoriteAgents, setFavoriteAgents] = useState<Agent[]>([]);
  const [userProfiles, setUserProfiles] = useState<Record<string, UserProfile>>({});
  const { favorites, loading: favoritesLoading } = useFavorites();
  const { address, isConnected } = useAccount();
  const [isLoading, setIsLoading] = useState(true);

  // Function to get creator display name (username or address)
  const getCreatorName = (walletAddress: string) => {
    if (!walletAddress) return "Unknown";
    
    const profile = userProfiles[walletAddress];
    if (profile && profile.username) {
      return profile.username;
    }
    return truncateAddress(walletAddress);
  };

  useEffect(() => {
    const fetchFavoriteAgents = async () => {
      if (!isConnected || favoritesLoading) {
        return;
      }

      setIsLoading(true);
      try {
        if (favorites.length === 0) {
          setFavoriteAgents([]);
          setIsLoading(false);
          return;
        }

        // Fetch agents data from Firebase
        const agents = await getAgentsByProfileIds(favorites);
        setFavoriteAgents(agents);

        // Get unique wallet addresses from agents
        const ownerAddresses = [...new Set(agents.map(agent => agent.owner))].filter(Boolean);
        
        // Fetch user profiles for all agent owners
        if (ownerAddresses.length > 0) {
          const profiles = await getUserProfiles(ownerAddresses);
          setUserProfiles(profiles);
        }
      } catch (error) {
        console.error("Error fetching favorite agents:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchFavoriteAgents();
  }, [favorites, isConnected, favoritesLoading]);

  if (!isConnected) {
    return (
      <div className="relative min-h-screen">
        <div className="fixed inset-0">
          <Squares
            speed={0.5}
            squareSize={40}
            direction="diagonal"
            borderColor="#fff"
            hoverFillColor="#222"
          />
        </div>
        <div className="relative container mx-auto p-6 max-w-2xl h-[80vh] flex items-center justify-center">
          <Card className="bg-zinc-900/90 backdrop-blur border-zinc-800 p-6 text-center relative z-10">
            <h1 className="text-2xl font-bold text-white mb-6">
              Favorite Agents
            </h1>
            <p className="text-zinc-400 mb-6">
              Please connect your wallet to view your favorite agents
            </p>
            <WalletConnectButton />
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full relative">
      <div className="fixed inset-0 z-0">
        <Squares
          speed={0.5}
          squareSize={40}
          direction="diagonal"
          borderColor="#fff"
          hoverFillColor="#222"
        />
      </div>
      <div className="container mx-auto p-6 relative z-10">
        <h1 className="text-2xl font-bold text-white mb-6">
          Your Favorite Agents
        </h1>
        
        {isLoading ? (
          <div className="flex justify-center items-center min-h-[200px]">
            <p className="text-zinc-400">Loading favorite agents...</p>
          </div>
        ) : favoriteAgents.length === 0 ? (
          <div className="flex flex-col items-center justify-center min-h-[200px]">
            <p className="text-zinc-400 mb-4">You haven't favorited any agents yet.</p>
            <p className="text-zinc-500 text-sm">
              Browse agents and click the heart icon to add them to your favorites.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {favoriteAgents.map((agent) => (
              <AgentCard
                key={agent.agentProfileId}
                agentProfileId={agent.agentProfileId}
                name={agent.name}
                description={`Created by ${getCreatorName(agent.owner)}`}
                image={getImageSrc(agent.profileImage)}
                bio={Array.isArray(agent.bio) ? agent.bio[0] : agent.bio}
                className="h-[200px]"
                imageClassName="rounded-full"
                owner={agent.owner}
                creatorName={getCreatorName(agent.owner)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
