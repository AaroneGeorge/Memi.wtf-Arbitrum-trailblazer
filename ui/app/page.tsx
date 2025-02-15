"use client";

import { useState, Suspense } from "react";
import { AgentCard } from "@/components/agent-card";
import WalletConnectButton from "@/components/wallet-connect-button";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { getImageSrc } from "@/lib/utils";
import Squares from "@/components/Squares";
import TrueFocus from "@/components/TrueFocus";
import { testBots } from "@/lib/test-data";

export default function Home() {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredAgents = testBots.filter(
    (agent) =>
      agent.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      agent.bio.toLowerCase().includes(searchQuery.toLowerCase())
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

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredAgents.map((agent) => (
              <AgentCard
                key={agent.name}
                id={agent.name}
                name={agent.name}
                description={`Created by ${agent.creator}`}
                image={getImageSrc(agent.image) || "/assets/anyachan.jpg"}
                bio={agent.bio}
              />
            ))}
          </div>
        </main>
      </Suspense>
    </div>
  );
}
