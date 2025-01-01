"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import { agents } from "@/lib/data";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Heart, Send } from "lucide-react";
import Image from "next/image";

export default function AgentPage() {
  const { id } = useParams();
  const agent = agents.find((a) => a.id === id);
  const [message, setMessage] = useState("");

  if (!agent) return <div>Agent not found</div>;

  return (
    <div className="container mx-auto p-6 max-w-6xl">
      <Card className="bg-zinc-900 border-zinc-800 p-6">
        <div className="flex items-start justify-between mb-8">
          <div className="flex items-center gap-4">
            <Image
              src={agent.image}
              alt={agent.name}
              width={64}
              height={64}
              className="rounded-full"
            />
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-bold text-white">{agent.name}</h1>
                <span className="text-pink-500">{agent.ticker}</span>
              </div>
              <div className="text-zinc-400 text-sm">
                Created by {agent.creator} • Contract: {agent.contract}
              </div>
            </div>
          </div>
          <Button variant="ghost" size="icon" className="text-pink-500">
            <Heart className="h-5 w-5" />
          </Button>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <Card className="bg-zinc-950 border-zinc-800 p-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-sm text-zinc-400">Price</div>
                  <div className="text-xl font-bold text-white">
                    ${agent.price}
                  </div>
                </div>
                <div>
                  <div className="text-sm text-zinc-400">24h Change</div>
                  <div className="text-xl font-bold text-green-500">
                    +{agent.change}%
                  </div>
                </div>
                <div>
                  <div className="text-sm text-zinc-400">Market Cap</div>
                  <div className="text-xl font-bold text-white">
                    ${agent.marketCap.toLocaleString()}
                  </div>
                </div>
                <div>
                  <div className="text-sm text-zinc-400">Volume</div>
                  <div className="text-xl font-bold text-white">
                    ${agent.volume.toLocaleString()}
                  </div>
                </div>
              </div>
            </Card>

            <Card className="bg-zinc-950 border-zinc-800 p-4 h-64">
              <div className="text-sm text-zinc-400 mb-2">Price Chart</div>
              {/* Integrate your preferred chart library here */}
            </Card>

            <div className="flex gap-2">
              <Button className="flex-1 bg-green-600 hover:bg-green-700">
                Buy
              </Button>
              <Button className="flex-1 bg-red-600 hover:bg-red-700">
                Sell
              </Button>
            </div>
          </div>

          <div className="flex flex-col">
            <Card className="bg-zinc-950 border-zinc-800 p-4 flex-1 mb-4 overflow-auto">
              <div className="space-y-4">
                <div className="flex gap-2">
                  <Image
                    src={agent.image}
                    alt={agent.name}
                    width={32}
                    height={32}
                    className="rounded-full"
                  />
                  <div className="bg-zinc-800 rounded-lg p-3 text-sm text-zinc-200">
                    {agent.startingDialogue}
                  </div>
                </div>
                {/* Add more messages here */}
              </div>
            </Card>

            <div className="flex gap-2">
              <Input
                placeholder="Type a message..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="bg-zinc-900 border-zinc-800"
              />
              <Button size="icon" className="bg-pink-600 hover:bg-pink-700">
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
