"use client";

import { useState, Suspense, useEffect } from "react";
import { AgentCard } from "@/components/agent-card";
import WalletConnectButton from "@/components/wallet-connect-button";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";

type Bot = {
  name: string;
  bio: string;
  ticker_symbol: string;
  creator: string;
  image: string;
  twitter: string;
  contract_address: string;
};

type User = {
  username: string;
  wallet_address: string;
};

export default function Home() {
  const [searchQuery, setSearchQuery] = useState("");
  const [agents, setAgents] = useState<Bot[]>([]);
  const [creators, setCreators] = useState<Record<string, string>>({});

  useEffect(() => {
    const fetchBots = async () => {
      try {
        const response = await fetch('http://127.0.0.1:8000/bots');
        const data = await response.json();
        setAgents(data.bots);

        const creatorMap: Record<string, string> = {};
        for (const bot of data.bots) {
          try {
            const userResponse = await fetch(`http://127.0.0.1:8000/users/${bot.creator}`);
            const userData = await userResponse.json();
            creatorMap[bot.creator] = userData.username;
          } catch (error) {
            console.error(`Error fetching creator for ${bot.creator}:`, error);
            creatorMap[bot.creator] = bot.creator.slice(0, 6) + '...' + bot.creator.slice(-4);
          }
        }
        setCreators(creatorMap);
      } catch (error) {
        console.error('Error fetching bots:', error);
      }
    };

    fetchBots();
  }, []);

  const filteredAgents = agents.filter(
    (agent) =>
      agent.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      agent.bio.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="h-full relative">
      <Suspense fallback={
        <div className="flex items-center justify-center h-screen">
          Loading...
        </div>
      }>
        <main className="p-6">
          <div className="px-6 py-4 border-b border-zinc-800 flex items-center justify-between mb-6">
            <div className="relative w-full max-w-md">
              <Search className="absolute left-3 top-3 h-4 w-4 text-zinc-400" />
              <Input
                placeholder="Search agents..."
                className="pl-9 bg-zinc-900 border-zinc-800 focus-visible:ring-pink-500 text-zinc-100"
                value={searchQuery}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchQuery(e.target.value)}
              />
            </div>
            <WalletConnectButton />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredAgents.map((agent) => (
              <AgentCard
                key={agent.name}
                id={agent.name}
                name={agent.name}
                description={`Created by ${creators[agent.creator] || 'Loading...'}`}
                // image={agent.image || '/assets/anyachan.jpg'}
                bio={agent.bio}
              />
            ))}
          </div>
        </main>
      </Suspense>
    </div>
  );
}
