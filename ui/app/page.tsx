"use client";

import { useState, Suspense, useEffect } from "react";
import { AgentCard } from "@/components/agent-card";
import WalletConnectButton from "@/components/wallet-connect-button";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { generateRandomUsername, getImageSrc } from "@/lib/utils";
import Squares from "@/components/Squares";
import TrueFocus from "@/components/TrueFocus";

type Bot = {
  name: string;
  bio: string;
  ticker_symbol: string;
  creator: string;
  image: string;
  twitter: string;
  contract_address: string;
  created_date: string;
};

type User = {
  username: string;
  wallet_address: string;
};

type WalletInfo = {
  address: string;
  network: string;
};

const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;

async function checkUserExists(walletAddress: string): Promise<boolean> {
  try {
    const response = await fetch(`${backendUrl}/users/${walletAddress}`, {
      method: "GET",
      headers: {
        Accept: "application/json",
      },
    });

    // If we get 404, user doesn't exist
    if (response.status === 404) {
      return false;
    }

    // For any other error, log it and return false
    if (!response.ok) {
      console.error("Error checking user:", await response.text());
      return false;
    }

    // If we get here, user exists
    const data = await response.json();
    return true;
  } catch (error) {
    console.error("Error checking user existence:", error);
    return false;
  }
}

async function createUser(walletInfo: WalletInfo) {
  try {
    const response = await fetch(`${backendUrl}/users`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        username: generateRandomUsername(),
        wallet_address: walletInfo.address,
        network: walletInfo.network,
        favourite_agents: [],
      }),
    });

    if (!response.ok) {
      throw new Error("Failed to create user");
    }

    return await response.json();
  } catch (error) {
    console.error("Error creating user:", error);
    throw error;
  }
}

export default function Home() {
  const [searchQuery, setSearchQuery] = useState("");
  const [agents, setAgents] = useState<Bot[]>([]);
  const [creators, setCreators] = useState<Record<string, string>>({});

  useEffect(() => {
    const fetchBots = async () => {
      try {
        const response = await fetch(`${backendUrl}/bots`);
        const data = await response.json();
        setAgents(data.bots);

        const creatorMap: Record<string, string> = {};
        for (const bot of data.bots) {
          try {
            const userResponse = await fetch(
              `${backendUrl}/users/${bot.creator}`
            );
            const userData = await userResponse.json();
            creatorMap[bot.creator] = userData.username;
          } catch (error) {
            console.error(`Error fetching creator for ${bot.creator}:`, error);
            creatorMap[bot.creator] =
              bot.creator.slice(0, 6) + "..." + bot.creator.slice(-4);
          }
        }
        setCreators(creatorMap);
      } catch (error) {
        console.error("Error fetching bots:", error);
      }
    };

    fetchBots();
  }, []);

  useEffect(() => {
    const handleWalletConnection = async (walletInfo: WalletInfo) => {
      if (!walletInfo.address) return;

      const userExists = await checkUserExists(walletInfo.address);
      if (!userExists) {
        try {
          await createUser(walletInfo);
        } catch (error) {
          console.error("Error in user creation:", error);
        }
      }
    };

    // Subscribe to wallet connection events
    window.addEventListener("walletConnected", ((
      event: CustomEvent<WalletInfo>
    ) => {
      handleWalletConnection(event.detail);
    }) as EventListener);

    return () => {
      window.removeEventListener("walletConnected", ((
        event: CustomEvent<WalletInfo>
      ) => {
        handleWalletConnection(event.detail);
      }) as EventListener);
    };
  }, []);

  const filteredAgents = agents
    .filter(
      (agent) =>
        agent.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        agent.bio.toLowerCase().includes(searchQuery.toLowerCase())
    )
    .sort((a, b) => {
      // First, pin the specified bot
      if (a.contract_address === "0x36fc8adf3f639f42e30a7e3e5e72905a2f9c346f") return -1;
      if (b.contract_address === "0x36fc8adf3f639f42e30a7e3e5e72905a2f9c346f") return 1;
      
      // Then sort by creation date (newest first)
      return new Date(b.created_date).getTime() - new Date(a.created_date).getTime();
    });

  const handleAnimationComplete = () => {
    console.log("All letters have animated!");
  };

  return (
    <div className="h-full relative">
      <div className="fixed inset-0 z-0">
        <Squares
          speed={0.5}
          squareSize={40}
          direction="diagonal"
          borderColor="#fff"
          // hoverFillColor="#222"
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
                placeholder="Search agents...!"
                className="pl-9 bg-zinc-900 border-zinc-800 focus-visible:ring-pink-500 text-zinc-100"
                value={searchQuery}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setSearchQuery(e.target.value)
                }
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
                description={`Created by ${
                  creators[agent.creator] || "Loading..."
                }`}
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
