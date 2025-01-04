"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import { agents } from "@/lib/data";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Heart, Send, Twitter, ExternalLink } from "lucide-react";
import Image from "next/image";
import { useFavorites } from "@/contexts/favorites-context";
import Link from "next/link";

type Message = {
  role: "user" | "assistant";
  content: string;
};

export default function AgentPage() {
  const { id } = useParams();
  const agent = agents.find((a) => a.id === id);
  const [message, setMessage] = useState("");
  const [showBuyOptions, setShowBuyOptions] = useState(true);
  const [showSellOptions, setShowSellOptions] = useState(false);
  const [ethAmount, setEthAmount] = useState("0.0");
  const [tokenPercentage, setTokenPercentage] = useState("0.0");
  const [messages, setMessages] = useState<Message[]>([
    { role: "assistant", content: "How's your day going?" },
  ]);

  const { isFavorite, toggleFavorite } = useFavorites();
  const favorite = isFavorite(id as string);

  if (!agent) return <div>Agent not found</div>;

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;

    setMessages((prev) => [...prev, { role: "user", content: message }]);
    setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "Thank you for your message!" },
      ]);
    }, 1000);
    setMessage("");
  };

  return (
    <div className="container mx-auto p-6 max-w-6xl">
      <Card className="bg-zinc-900 border-zinc-800 p-6 mb-6">
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
                Created by {agent.creator} •
                <Link
                  href={`https://x.com/${agent.twitter.replace("@", "")}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-400 hover:text-pink-500 hover:underline"
                >
                  <Twitter className="inline-block w-4 h-4 ml-1 mr-1" />
                  {agent.twitter}
                </Link>{" "}
                •
                <Link
                  href={`https://etherscan.io/address/${agent.contract}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-400 hover:text-pink-500 hover:underline"
                >
                  <ExternalLink className="inline-block w-4 h-4 ml-1 mr-1" />
                  {agent.contract}
                </Link>
              </div>
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="text-pink-500"
            onClick={() => toggleFavorite(id as string)}
          >
            <Heart className={`h-5 w-5 ${favorite ? "fill-current" : ""}`} />
          </Button>
        </div>

        <div className="grid gap-6">
          <Card className="bg-zinc-900 border-zinc-800">
            <div className="p-4 border-b border-zinc-800">
              <div className="flex items-center gap-2">
                <Image
                  src={agent.image}
                  alt={agent.name}
                  width={32}
                  height={32}
                  className="rounded-full"
                />
                <div>
                  <h3 className="font-semibold text-white">
                    Chat with {agent.name}
                  </h3>
                  <p className="text-xs text-zinc-400">
                    Created by {agent.creator}
                  </p>
                </div>
              </div>
            </div>

            <div className="p-4 h-[400px] overflow-auto space-y-4">
              {messages.map((msg, i) => (
                <div
                  key={i}
                  className={`flex gap-2 ${
                    msg.role === "user" ? "justify-end" : ""
                  }`}
                >
                  <div
                    className={`rounded-lg p-3 text-sm max-w-[80%] ${
                      msg.role === "user"
                        ? "bg-pink-600 text-white ml-12"
                        : "bg-zinc-800 text-zinc-200"
                    }`}
                  >
                    {msg.content}
                  </div>
                </div>
              ))}
            </div>

            <form
              onSubmit={handleSendMessage}
              className="p-4 border-t border-zinc-800"
            >
              <div className="flex gap-2">
                <Input
                  placeholder="Type a message..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="bg-zinc-800 border-zinc-700"
                />
                <Button
                  type="submit"
                  size="icon"
                  className="bg-pink-600 hover:bg-pink-700"
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </form>
          </Card>

          <Card className="bg-zinc-950 border-zinc-800 p-4">
            <div className="grid grid-cols-2 gap-4 mb-4">
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

          <div className="grid md:grid-cols-2 gap-6">
            <Card className="bg-zinc-950 border-zinc-800 p-4 h-64">
              <div className="text-sm text-zinc-400 mb-2">Price Chart</div>
              {/* Integrate your preferred chart library here */}
            </Card>

            <Card className="bg-zinc-950 border-zinc-800 p-4">
              <div className="flex gap-2 mb-4">
                <Button
                  className="flex-1 bg-green-600 hover:bg-green-700"
                  onClick={() => {
                    setShowBuyOptions(true);
                    setShowSellOptions(false);
                  }}
                >
                  Buy
                </Button>
                <Button
                  className="flex-1 bg-red-600 hover:bg-red-700"
                  onClick={() => {
                    setShowBuyOptions(false);
                    setShowSellOptions(true);
                  }}
                >
                  Sell
                </Button>
              </div>

              {showBuyOptions && (
                <div>
                  <div className="mb-4">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm text-zinc-400">Amount</span>
                      <span className="text-sm text-zinc-400">ETH</span>
                    </div>
                    <div className="text-xl font-bold text-white mb-4">
                      {ethAmount}
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                      {[...Array(6)].map((_, i) => (
                        <Button
                          key={i}
                          variant="outline"
                          className="text-sm"
                          onClick={() => setEthAmount((0.01).toString())}
                        >
                          0.01 eth
                        </Button>
                      ))}
                    </div>
                  </div>
                  <Button className="w-full bg-green-600 hover:bg-green-700">
                    Buy Tokens
                  </Button>
                </div>
              )}

              {showSellOptions && (
                <div>
                  <div className="mb-4">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm text-zinc-400">Amount</span>
                      <span className="text-sm text-zinc-400">MIMI</span>
                    </div>
                    <div className="text-xl font-bold text-white mb-4">
                      {tokenPercentage}
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                      {["25%", "50%", "100%"].map((percent) => (
                        <Button
                          key={percent}
                          variant="outline"
                          className="text-sm"
                          onClick={() => setTokenPercentage(percent)}
                        >
                          {percent}
                        </Button>
                      ))}
                    </div>
                  </div>
                  <Button className="w-full bg-red-600 hover:bg-red-700">
                    Sell Tokens
                  </Button>
                </div>
              )}
            </Card>
          </div>
        </div>
      </Card>
    </div>
  );
}
