"use client";

import { useState } from "react";
import { Sidebar } from "@/components/sidebar";
import { AgentCard } from "@/components/agent-card";
import { WalletButton } from "@/components/wallet-button";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { agents } from "@/lib/data";

export default function Home() {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredAgents = agents.filter(
    (agent) =>
      agent.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      agent.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="h-full relative">
      <div className="hidden h-full md:flex md:w-72 md:flex-col md:fixed md:inset-y-0 bg-zinc-950">
        <Sidebar />
      </div>
      <main className="md:pl-72">
        <div className="px-6 py-4 border-b border-zinc-800 flex items-center justify-between">
          <div className="relative w-full max-w-md">
            <Search className="absolute left-3 top-3 h-4 w-4 text-zinc-400" />
            <Input
              placeholder="Search agents..."
              className="pl-9 bg-zinc-900 border-zinc-800 focus-visible:ring-pink-500 text-zinc-100"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <WalletButton />
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredAgents.map((agent) => (
              <AgentCard key={agent.id} {...agent} />
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
