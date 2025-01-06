"use client";

import { UserAgentCard } from "@/components/user-agent-card";
import { useRouter } from "next/navigation";
import { useAccount } from "wagmi";
import { Card } from "@/components/ui/card";
import { useState, useEffect } from "react";
import WalletConnectButton from "@/components/wallet-connect-button";
import { getImageSrc } from "@/lib/utils";

// Interface for bot data from API
interface Bot {
  name: string;
  bio: string;
  personality: string;
  starting_dialogue: string;
  ticker_symbol: string;
  contract_address: string;
  ticker: string;
  creator: string;
  created_date: string;
  image: string;
  twitter: string;
}

export default function YourAgentsPage() {
  const { address, isConnected } = useAccount();
  const router = useRouter();
  const [userBots, setUserBots] = useState<Bot[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch bots from API
  useEffect(() => {
    const fetchBots = async () => {
      if (!isConnected || !address) return;

      try {
        const response = await fetch('http://127.0.0.1:8000/bots');
        if (response.ok) {
          const data = await response.json();
          // Filter bots where creator matches wallet address
          const userOwnedBots = data.bots.filter(
            (bot: Bot) => bot.creator.toLowerCase() === address.toLowerCase()
          );
          setUserBots(userOwnedBots);
        }
      } catch (error) {
        console.error('Error fetching bots:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchBots();
  }, [isConnected, address]);

  if (!isConnected) {
    return (
      <div className="container mx-auto p-6 max-w-2xl h-[80vh] flex items-center justify-center">
        <Card className="bg-zinc-900 border-zinc-800 p-6 text-center">
          <h1 className="text-2xl font-bold text-white mb-6">Your Agents</h1>
          <p className="text-zinc-400 mb-6">Please connect your wallet to view your agents</p>
          <w3m-button />
        </Card>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="container mx-auto p-6 max-w-2xl h-[80vh] flex items-center justify-center">
        <Card className="bg-zinc-900 border-zinc-800 p-6 text-center">
          <p className="text-zinc-400">Loading your agents...</p>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-white">Your Agents</h1>
        {userBots.length === 0 && (
          <button
            onClick={() => router.push("/create")}
            className="bg-pink-500 hover:bg-pink-600 text-white px-4 py-2 rounded-md"
          >
            Create New Agent
          </button>
        )}
      </div>
      
      {userBots.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-zinc-400 mb-6">You haven't created any agents yet.</p>
          <p className="text-zinc-400">Create your first agent to get started!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {userBots.map((bot) => (
            <UserAgentCard
              key={bot.name}
              id={bot.name}
              name={bot.name}
              description={bot.bio}
              ticker={bot.ticker}
              bio={bot.bio}
              personality={bot.personality}
              image={getImageSrc(bot.image) || '/assets/anyachan.jpg'}
              startingDialogue={bot.starting_dialogue}
              price={0} // Add these if available from API
              marketCap={0}
              volume={0}
              change={0}
              creator={bot.creator}
              contract={bot.contract_address}
              twitter={bot.twitter}
              onEdit={() => router.push(`/edit-agent/${bot.name}`)}
            />
          ))}
        </div>
      )}
    </div>
  );
} 