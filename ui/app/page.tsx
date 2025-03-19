"use client";

import { useState, Suspense, useEffect } from "react";
import { AgentCard } from "@/components/agent-card";
import WalletConnectButton from "@/components/wallet-connect-button";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { getImageSrc } from "@/lib/utils";
import Squares from "@/components/Squares";
import TrueFocus from "@/components/TrueFocus";
import { listDocuments, getUserProfiles } from "@/lib/firebase/firestore";
import constants from "@/lib/constants";
import type { Agent } from "./types";
import type { UserProfile } from "@/lib/firebase/firestore";

const truncateAddress = (address: string) => {
  if (!address) return "";
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
};

export default function Home() {
  const [searchQuery, setSearchQuery] = useState("");
  const [agents, setAgents] = useState<Agent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [userProfiles, setUserProfiles] = useState<Record<string, UserProfile>>({});

  useEffect(() => {
    const fetchAgents = async () => {
      try {
        const documents = await listDocuments(constants.AGENTS_COLLECTION);
        // Filter out invalid documents and those without agentProfileId
        const sortedAgents = documents
          .filter((doc) => doc && doc.name && doc.agentProfileId) // Ensure agentProfileId exists
          .sort((a, b) => {
            const dateA = new Date(a.createdAt || 0).getTime();
            const dateB = new Date(b.createdAt || 0).getTime();
            return dateB - dateA;
          });
        
        setAgents(sortedAgents);
        
        // Get unique wallet addresses from agents
        const ownerAddresses = [...new Set(sortedAgents.map(agent => agent.owner))].filter(Boolean);
        
        // Fetch user profiles for all agent owners
        if (ownerAddresses.length > 0) {
          const profiles = await getUserProfiles(ownerAddresses);
          setUserProfiles(profiles);
        }
      } catch (error) {
        console.error("Error fetching agents:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAgents();
  }, []);

  // Function to get creator display name (username or address)
  const getCreatorName = (walletAddress: string) => {
    if (!walletAddress) return "Unknown";
    
    const profile = userProfiles[walletAddress];
    if (profile && profile.username) {
      return profile.username;
    }
    return truncateAddress(walletAddress);
  };

  const filteredAgents = agents.filter(
    (agent) =>
      agent.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (Array.isArray(agent.bio) &&
        agent.bio.some((b) =>
          b?.toLowerCase().includes(searchQuery.toLowerCase())
        ))
  );

  return (
    <div className="h-full relative">
      <div className="fixed inset-0 z-0">
        <Squares
          speed={0.5}
          squareSize={40}
          direction="diagonal"
          borderColor="#fff"
        />
      </div>

      <Suspense
        fallback={
          <div className="flex items-center justify-center h-screen">
            Loading...
          </div>
        }
      >
        <main className="p-6 relative z-10">
          <div className="px-6 py-4 border-b border-zinc-800 flex items-center justify-between mb-6">
            <div className="relative w-full max-w-md">
              <Search className="absolute left-3 top-3 h-4 w-4 text-zinc-400" />
              <Input
                placeholder="Search agents..."
                className="pl-9 bg-zinc-900 border-zinc-800 focus-visible:ring-pink-500 text-zinc-100"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <WalletConnectButton />
          </div>
          <TrueFocus
            sentence="Deploy AI agents on Arbitrum"
            manualMode={false}
            blurAmount={5}
            borderColor="pink"
            animationDuration={2}
            pauseBetweenAnimations={1}
          />

          {isLoading ? (
            <div className="flex justify-center items-center min-h-[200px]">
              <p className="text-zinc-400">Loading agents...</p>
            </div>
          ) : filteredAgents.length === 0 ? (
            <div className="flex justify-center items-center min-h-[200px]">
              <p className="text-zinc-400">
                {searchQuery
                  ? "No agents found matching your search"
                  : "No agents available"}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredAgents.map((agent) => (
                <AgentCard
                  key={agent.name}
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
        </main>
      </Suspense>
    </div>
  );
}
