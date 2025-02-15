"use client";

import { useState, useRef } from "react";
import { useParams } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Heart, Send, Twitter, ExternalLink } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { Bot, ChatMessage } from "./types";
import { getImageSrc } from "@/lib/utils";
import TradingViewWidget from "@/components/TradingViewWidget";

export default function AgentPage() {
  const { id } = useParams();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [message, setMessage] = useState("");
  const chatContainerRef = useRef<HTMLDivElement>(null);

  // Example bot data
  const bot: Bot = {
    name: "Anya Bot",
    bio: "Example bio",
    personality: "Friendly",
    starting_dialogue: "Hello! How can I help you today?",
    ticker_symbol: "ANYA",
    contract_address: "0x123...",
    ticker: "ANYA",
    creator: "Creator",
    created_date: "2024-01-01",
    image: "/assets/anyachan.jpg",
    twitter: "@anyabot",
    price: 0.1234,
    marketCap: 1000000,
    volume: 500000,
    change: 5.67,
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;

    const userMessage: ChatMessage = {
      message: message,
      role: "user",
      expression: null,
      timestamp: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, userMessage]);
    setMessage("");
  };

  const renderMessage = (msg: ChatMessage, index: number) => (
    <div
      key={index}
      className={`flex gap-2 ${msg.role === "user" ? "justify-end" : ""}`}
    >
      <div
        className={`rounded-lg p-3 text-sm max-w-[80%] ${
          msg.role === "user"
            ? "bg-pink-600 text-white ml-12"
            : "bg-zinc-800 text-zinc-200"
        }`}
      >
        {msg.message}
        {msg.expression && (
          <div className="text-xs text-zinc-400 mt-1 italic">
            *{msg.expression}*
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className="container mx-auto p-6 max-w-6xl">
      <Card className="bg-zinc-900 border-zinc-800 p-6 mb-6">
        <div className="flex items-start justify-between mb-8">
          <div className="flex items-center gap-4">
            <div className="relative aspect-square h-16 overflow-hidden rounded-full">
              <Image
                src={getImageSrc(bot.image)}
                alt={bot.name}
                fill
                className="object-cover"
              />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-bold text-white">{bot.name}</h1>
                <span className="text-pink-500">
                  {bot.ticker.toUpperCase()}
                </span>
              </div>
              <div className="text-zinc-400 text-sm">
                Created by {bot.creator} •
                <Link
                  href={`https://x.com/${bot.twitter.replace("@", "")}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-400 hover:text-pink-500 hover:underline"
                >
                  <Twitter className="inline-block w-4 h-4 ml-1 mr-1" />
                  {bot.twitter}
                </Link>
                •
                <Link
                  href={`https://sepolia.arbiscan.io/token/${bot.contract_address}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-400 hover:text-pink-500 hover:underline"
                >
                  <ExternalLink className="inline-block w-4 h-4 ml-1 mr-1" />
                  {bot.contract_address}
                </Link>
              </div>
            </div>
          </div>
          <Button variant="ghost" size="icon" className="text-pink-500">
            <Heart className="h-5 w-5" />
          </Button>
        </div>

        <div className="grid gap-6">
          <Card className="bg-zinc-900 border-zinc-800">
            <div className="p-4 border-b border-zinc-800">
              <div className="flex items-center gap-2">
                <div>
                  <h3 className="font-semibold text-white">
                    Chat with {bot.name}
                  </h3>
                  <p className="text-xs text-zinc-400">
                    Created by {bot.creator}
                  </p>
                </div>
              </div>
            </div>

            <div
              className="p-4 h-[400px] overflow-y-auto space-y-4"
              ref={chatContainerRef}
            >
              {messages.map((msg, i) => renderMessage(msg, i))}
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
        </div>
      </Card>
    </div>
  );
}
