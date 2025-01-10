"use client";

import { useState, useEffect, useRef } from "react";
import { useParams } from "next/navigation";
import { agents } from "@/lib/data";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Heart, Send, Twitter, ExternalLink } from "lucide-react";
import Image from "next/image";
import { useFavorites } from "@/contexts/favorites-context";
import Link from "next/link";
import { useAccount } from "wagmi";
import { Bot, ChatMessage, ChatHistory } from "./types";
import WalletConnectButton from "@/components/wallet-connect-button";
import { getImageSrc } from "@/lib/utils";
import TradingViewWidget from "@/components/TradingViewWidget";

const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;

export default function AgentPage() {
  const { id } = useParams();
  const { address } = useAccount();
  const [bot, setBot] = useState<Bot | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [message, setMessage] = useState("");
  const [showBuyOptions, setShowBuyOptions] = useState(true);
  const [showSellOptions, setShowSellOptions] = useState(false);
  const [ethAmount, setEthAmount] = useState("0.0");
  const [tokenPercentage, setTokenPercentage] = useState("0.0");
  const [creatorUsername, setCreatorUsername] = useState<string>("");
  const [loadingText, setLoadingText] = useState("Agent Loading...");

  const { isFavorite, toggleFavorite } = useFavorites();
  const favorite = isFavorite(id as string);

  const staticData = agents.find((a) => a.id === id);

  // Fetch bot data
  useEffect(() => {
    const fetchBot = async () => {
      try {
        const response = await fetch(`${backendUrl}/bots`);
        const data = await response.json();
        const foundBot = data.bots.find((b: Bot) => b.name === id);
        if (foundBot) setBot(foundBot);
      } catch (error) {
        console.error("Error fetching bot:", error);
      }
    };
    fetchBot();
  }, [id]);

  // Fetch chat history
  useEffect(() => {
    const fetchChatHistory = async () => {
      if (!address || !bot) return;

      // Set the starting dialogue as first message
      const startingMessage: ChatMessage = {
        message: bot.starting_dialogue,
        role: "assistant",
        expression: null,
        timestamp: new Date().toISOString(),
      };

      try {
        const response = await fetch(`${backendUrl}/chats/${address}/${id}`);
        const data: ChatHistory = await response.json();

        // Combine starting dialogue with chat history
        setMessages([startingMessage, ...data.messages]);
      } catch (error) {
        console.error("Error fetching chat history:", error);
        setMessages([startingMessage]);
      }
    };

    fetchChatHistory();
  }, [id, address, bot]);

  // Add new useEffect to fetch creator's username
  useEffect(() => {
    const fetchCreatorUsername = async () => {
      if (!bot?.creator) return;

      try {
        const response = await fetch(`${backendUrl}/users/${bot.creator}`);
        const data = await response.json();
        setCreatorUsername(data.username || bot.creator); // fallback to address if no username
      } catch (error) {
        console.error("Error fetching creator username:", error);
        setCreatorUsername(bot.creator); // fallback to address on error
      }
    };

    fetchCreatorUsername();
  }, [bot?.creator]);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop =
        chatContainerRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() || !address) return;

    // Add user message immediately
    const userMessage: ChatMessage = {
      message: message,
      role: "user",
      expression: null,
      timestamp: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, userMessage]);

    // Clear the input field immediately
    setMessage("");

    try {
      const response = await fetch(`${backendUrl}/chat`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          bot_name: id,
          user_id: address,
          message: userMessage.message,
        }),
      });

      const data = await response.json();

      // Add bot response
      const botMessage: ChatMessage = {
        message: data.response.content,
        role: "assistant",
        expression: data.response.expression,
        timestamp: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, botMessage]);
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };

  // Update the message display in the chat
  const renderMessage = (msg: ChatMessage, index: number) => (
    <div
      key={index}
      className={`flex gap-2 ${msg.role === "user" ? "justify-end" : ""}`}
    >
      <div
        className={`rounded-lg p-3 text-sm max-w-[80%] ${msg.role === "user"
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

  useEffect(() => {
    const timer = setTimeout(() => {
      if (!bot) {
        setLoadingText("Agent Not Found");
      }
    }, 3000);

    return () => clearTimeout(timer);
  }, [bot]);

  if (!bot) return (
    <div className="h-screen flex items-center justify-center text-xl font-medium text-zinc-400">
      {loadingText}
    </div>
  );

  const overlayClass =
    "relative after:content-['Coming_soon...'] after:absolute after:inset-0 after:bg-black/50 after:flex after:items-center after:justify-center after:text-white after:font-bold after:text-xl";

  return (
    <div className="container mx-auto p-6 max-w-6xl">
      <Card className="bg-zinc-900 border-zinc-800 p-6 mb-6">
        <div className="flex items-start justify-between mb-8">
          <div className="flex items-center gap-4">
            <div className="relative aspect-square h-16 overflow-hidden rounded-full">
              <Image
                src={getImageSrc(bot.image) || "/assets/anyachan.jpg"}
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
                Created by {creatorUsername} •
                <Link
                  href={`https://x.com/${bot.twitter.replace("@", "")}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-400 hover:text-pink-500 hover:underline"
                >
                  <Twitter className="inline-block w-4 h-4 ml-1 mr-1" />
                  {bot.twitter}
                </Link>{" "}
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
                <div className="w-8 h-8 rounded-full overflow-hidden relative flex items-center justify-center">
                  <Image
                    src={getImageSrc(bot.image) || "/assets/anyachan.jpg"}
                    alt={bot.name}
                    width={32}
                    height={32}
                    className="object-cover w-full h-full"
                  />
                </div>
                <div>
                  <h3 className="font-semibold text-white">
                    Chat with {bot.name}
                  </h3>
                  <p className="text-xs text-zinc-400">
                    Created by {creatorUsername}
                  </p>
                </div>
              </div>
            </div>

            {address ? (
              <>
                <div
                  className="p-4 h-[400px] overflow-y-auto space-y-4"
                  ref={chatContainerRef}
                >
                  {messages.map((msg, i) => renderMessage(msg, i))}
                  <div ref={messagesEndRef} />
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
              </>
            ) : (
              <div className="p-8 flex flex-col items-center justify-center gap-4">
                <p className="text-zinc-400 text-center">
                  Connect your wallet to chat with {bot.name}
                </p>
                <WalletConnectButton />
              </div>
            )}
          </Card>

          {/* <Card className={`bg-zinc-950 border-zinc-800 p-4 ${overlayClass}`}>
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <div className="text-sm text-zinc-400">Price</div>
                <div className="text-xl font-bold text-white">
                  ${staticData?.price || "0.00"}
                </div>
              </div>
              <div>
                <div className="text-sm text-zinc-400">24h Change</div>
                <div className="text-xl font-bold text-green-500">
                  +{staticData?.change || "0.00"}%
                </div>
              </div>
              <div>
                <div className="text-sm text-zinc-400">Market Cap</div>
                <div className="text-xl font-bold text-white">
                  ${staticData?.marketCap.toLocaleString() || "0"}
                </div>
              </div>
              <div>
                <div className="text-sm text-zinc-400">Volume</div>
                <div className="text-xl font-bold text-white">
                  ${staticData?.volume.toLocaleString() || "0"}
                </div>
              </div>
            </div>
          </Card> */}

          <TradingViewWidget />




        </div>
      </Card>
    </div>
  );
}
