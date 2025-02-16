"use client";

import { useState, useRef, useEffect } from "react";
import { useParams } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Heart, Send, Twitter, ExternalLink } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { getImageSrc } from "@/lib/utils";
import TradingViewWidget from "@/components/TradingViewWidget";
import { getAgentDetails } from "@/lib/firebase/firestore";
import { Agent, ChatMessage } from "@/app/types";
import WalletConnectButton from "@/components/wallet-connect-button";
import { TypingAnimation } from "@/components/typing-animation";

export default function AgentPage() {
  const { id } = useParams();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [message, setMessage] = useState("");
  const [agent, setAgent] = useState<Agent | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [walletAddress, setWalletAddress] = useState<string>("");
  const [isTyping, setIsTyping] = useState(false);

  useEffect(() => {
    const fetchAgent = async () => {
      try {
        if (typeof id === "string") {
          const agentData = await getAgentDetails(id);
          if (agentData) {
            setAgent(agentData);
          } else {
            setError("Agent not found");
          }
        }
      } catch (error) {
        console.error("Error fetching agent:", error);
        setError("Failed to load agent details");
      } finally {
        setLoading(false);
      }
    };

    fetchAgent();
  }, [id]);

  useEffect(() => {
    if (typeof window !== 'undefined' && window.ethereum) {
      window.ethereum.request({ method: 'eth_accounts' })
        .then((accounts: string[]) => {
          if (accounts.length > 0) {
            setWalletAddress(accounts[0]);
          }
        });

      window.ethereum.on('accountsChanged', function (accounts: string[]) {
        if (accounts.length > 0) {
          setWalletAddress(accounts[0]);
        } else {
          setWalletAddress("");
        }
      });
    }
  }, []);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() || !agent || isSubmitting) return;
    
    if (!walletAddress) {
      setError("Please connect your wallet first");
      return;
    }

    const userMessage: ChatMessage = {
      message: message,
      role: "user",
      expression: null,
      timestamp: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, userMessage]);
    setMessage("");
    setIsSubmitting(true);
    setIsTyping(true);

    try {
      const response = await fetch(`http://localhost:3000/${agent.agentId}/message`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: message,
          userId: walletAddress,
        }),
      });

      const data = await response.json();
      
      if (data && data.length > 0) {
        const agentMessage: ChatMessage = {
          message: data[0].text,
          role: "assistant",
          expression: null,
          timestamp: new Date().toISOString(),
        };
        setMessages((prev) => [...prev, agentMessage]);
      }
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setIsSubmitting(false);
      setIsTyping(false);
    }
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

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  if (loading) {
    return (
      <div className="container mx-auto p-6 flex items-center justify-center">
        <Card className="bg-zinc-900 border-zinc-800 p-6">
          <p className="text-zinc-400">Loading agent details...</p>
        </Card>
      </div>
    );
  }

  if (error || !agent) {
    return (
      <div className="container mx-auto p-6 flex items-center justify-center">
        <Card className="bg-zinc-900 border-zinc-800 p-6">
          <p className="text-red-500">{error || "Agent not found"}</p>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 max-w-6xl">
      <Card className="bg-zinc-900 border-zinc-800 p-6 mb-6">
        <div className="flex items-start justify-between mb-8">
          <div className="flex items-center gap-4">
            <div className="relative aspect-square h-16 overflow-hidden rounded-full">
              <Image
                src={getImageSrc(agent.profileImage)}
                alt={agent.name}
                fill
                className="object-cover"
              />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-bold text-white">{agent.name}</h1>
                <span className="text-pink-500">
                  {agent.ticker.toUpperCase()}
                </span>
              </div>
              <div className="text-zinc-400 text-sm">
                Created by {agent.owner} •
                <Link
                  href={`https://x.com/${agent.twitter.replace("@", "")}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-400 hover:text-pink-500 hover:underline"
                >
                  <Twitter className="inline-block w-4 h-4 ml-1 mr-1" />
                  {agent.twitter}
                </Link>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" className="text-pink-500">
              <Heart className="h-5 w-5" />
            </Button>
            <WalletConnectButton />
          </div>
        </div>

        <div className="grid gap-6">
          <Card className="bg-zinc-900 border-zinc-800">
            <div className="p-4 border-b border-zinc-800">
              <div className="flex items-center gap-2">
                <div>
                  <h3 className="font-semibold text-white">
                    Chat with {agent.name}
                  </h3>
                  <p className="text-xs text-zinc-400">
                    Created by {agent.owner}
                  </p>
                </div>
              </div>
            </div>

            <div
              className="p-4 h-[400px] overflow-y-auto space-y-4"
              ref={chatContainerRef}
            >
              {messages.map((msg, i) => renderMessage(msg, i))}
              {isTyping && (
                <div className="flex gap-2">
                  <TypingAnimation />
                </div>
              )}
            </div>

            <form
              onSubmit={handleSendMessage}
              className="p-4 border-t border-zinc-800"
            >
              <div className="flex gap-2">
                <Input
                  placeholder={walletAddress ? "Type a message..." : "Connect wallet to chat..."}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="bg-zinc-800 border-zinc-700"
                  disabled={isSubmitting || !walletAddress}
                />
                <Button
                  type="submit"
                  size="icon"
                  className="bg-pink-600 hover:bg-pink-700"
                  disabled={isSubmitting || !walletAddress}
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
