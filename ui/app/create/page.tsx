"use client";

import { useEffect, useState } from "react";
import {
  useAccount,
  useWriteContract,
  useWaitForTransactionReceipt,
} from "wagmi";
import { getTransactionReceipt } from "@wagmi/core";
import { abi } from "../../contract/abi";
import { config } from "../../contract/config";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ImagePlus } from "lucide-react";
import Image from "next/image";
import toast, { Toaster } from "react-hot-toast";
import { useRouter } from "next/navigation";
import WalletConnectButton from "@/components/wallet-connect-button";
import { HoverTooltip } from "@/components/hover-tooltip";
import Squares from "@/components/Squares";
import { generateRandomUsername } from "@/lib/utils";

const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;

const waitForReceipt = async (hash: `0x${string}`, maxAttempts = 20) => {
  for (let i = 0; i < maxAttempts; i++) {
    try {
      const receipt = await getTransactionReceipt(config, { hash });
      if (receipt) return receipt;
    } catch (error) {
      if (i === maxAttempts - 1) throw error;
    }
    // Wait 2 seconds before next attempt
    await new Promise(resolve => setTimeout(resolve, 2000));
  }
  throw new Error("Transaction receipt not found after maximum attempts");
};

const botTemplates = [
  {
    name: "Trading Assistant",
    bio: "Expert in crypto trading and market analysis",
    personality: "Professional, analytical, and detail-oriented",
    starting_dialogue: "Hello! Ready to analyze the markets together?",
    image: "/assets/trading-template.jpg"
  },
  {
    name: "DeFi Guide",
    bio: "Your personal guide to decentralized finance",
    personality: "Educational, patient, and thorough",
    starting_dialogue: "Welcome! What would you like to learn about DeFi today?",
    image: "/assets/defi-template.jpg"
  }
];

export default function CreatePage() {
  const router = useRouter();
  const { isConnected, address } = useAccount();
  const [image, setImage] = useState<string>("/assets/anyachan.jpg");
  const [name, setName] = useState("");
  const [ticker, setTicker] = useState("");
  const [bio, setBio] = useState("A friendly AI agent ready to assist you.");
  const [personality, setPersonality] = useState(
    "Helpful, curious, and always eager to learn.",
  );
  const [startingDialogue, setStartingDialogue] = useState(
    "Hello! How can I assist you today?",
  );
  const [contractAddress, setContractAddress] = useState(
    "0x1234567890123456789",
  );
  const [twitter, setTwitter] = useState("memionarb");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // contract
  const { writeContractAsync } = useWriteContract();

  const validateName = (value: string) => {
    return value.replace(/[^a-zA-Z0-9]/g, "");
  };

  const validateTicker = (value: string) => {
    return value.replace(/[\$]/g, "");
  };

  const validateTwitter = (value: string) => {
    return value.replace(/[@]/g, "");
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 50 * 1024) {
        toast.error(
          "Image size exceeds 50KB limit. Please upload a smaller image.",
          {
            duration: 2500,
          },
        );
        e.target.value = "";
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        setImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const convertImageToBase64 = (imageFile: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const base64String = (reader.result as string).split(",")[1];
        resolve(base64String);
      };
      reader.onerror = reject;
      reader.readAsDataURL(imageFile);
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!address) {
      toast.error("Please connect your wallet first");
      return;
    }

    if (!name || !ticker || !bio || !personality || !startingDialogue || !twitter) {
      toast.error("Please fill in all required fields");
      return;
    }

    if (!image) {
      toast.error("Please upload an agent image");
      return;
    }

    try {
      setIsSubmitting(true);

      // Simulate contract interaction
      toast.loading("Creating your AI agent...");
      
      // Simulate success after 2 seconds
      setTimeout(() => {
        toast.dismiss();
        toast.success("AI agent created successfully!", {
          duration: 5000,
        });

        // Reset form
        setImage("/assets/anyachan.jpg");
        setName("");
        setTicker("");
        setBio("");
        setPersonality("");
        setStartingDialogue("");
        setContractAddress("");
        setTwitter("");

        // Redirect to home
        setTimeout(() => {
          router.push("/");
        }, 1000);
      }, 2000);

    } catch (error: any) {
      console.error("Error creating AI agent:", error);
      toast.error(error.message || "Failed to create AI agent");
    } finally {
      setIsSubmitting(false);
    }
  };

  const applyTemplate = (template: typeof botTemplates[0]) => {
    setBio(template.bio);
    setPersonality(template.personality);
    setStartingDialogue(template.starting_dialogue);
    setImage(template.image);
  };

  if (!isConnected) {
    return (
      <div className="container mx-auto p-6 max-w-2xl h-[80vh] flex items-center justify-center">
        <div className="fixed inset-0 z-0">
          <Squares
            speed={0.5}
            squareSize={40}
            direction="diagonal"
            borderColor="#fff"
            hoverFillColor="#222"
          />
        </div>
        <Card className="bg-zinc-900 border-zinc-700 p-6 text-center z-10">
          <h1 className="text-2xl font-bold text-white mb-6 z-10">
            Create AI Agent
          </h1>
          <p className="text-zinc-400 mb-6">
            Please connect your wallet to create an AI agent
          </p>
          <WalletConnectButton />
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 max-w-2xl">
      <div className="fixed inset-0">
        <Squares
          speed={0.5}
          squareSize={40}
          direction="diagonal"
          borderColor="#fff"
          hoverFillColor="#222"
        />
      </div>
      <Card className="bg-zinc-900/90 backdrop-blur border-zinc-800 p-6 relative z-10">
        <h1 className="text-2xl font-bold text-white mb-6">Create AI Agent</h1>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="flex justify-center">
            <div className="relative w-32 h-32">
              <Image
                src={image}
                alt="Agent"
                fill
                className="rounded-full object-cover"
              />
              <label className="absolute bottom-0 right-0 bg-zinc-800 rounded-full p-2 cursor-pointer hover:bg-pink-500/50 transition-colors">
                <ImagePlus className="h-4 w-4 text-zinc-200" />
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleImageUpload}
                />
              </label>

              {!image && (
                <p className="text-xs text-zinc-500 text-center mt-2">
                  Max image size: 50KB
                </p>
              )}
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-zinc-200">
                Agent Name <span className="text-red-500">*</span>
              </label>
              <Input
                required
                className="bg-zinc-800 border-zinc-700"
                value={name}
                onChange={(e) => setName(validateName(e.target.value))}
                placeholder="Use only letters and numbers"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-zinc-200">
                Ticker <span className="text-red-500">*</span>
              </label>
              <Input
                required
                className="bg-zinc-800 border-zinc-700"
                placeholder="SYMBOL"
                value={ticker}
                onChange={(e) => setTicker(validateTicker(e.target.value))}
              />
            </div>
            <div>
              <label className="text-sm font-medium text-zinc-200">
                Bio <span className="text-red-500">*</span>
              </label>
              <Textarea
                required
                className="bg-zinc-800 border-zinc-700"
                value={bio}
                onChange={(e) => setBio(e.target.value)}
              />
            </div>
            <div>
              <label className="text-sm font-medium text-zinc-200">
                Personality <span className="text-red-500">*</span>
              </label>
              <Textarea
                required
                className="bg-zinc-800 border-zinc-700"
                value={personality}
                onChange={(e) => setPersonality(e.target.value)}
              />
            </div>
            <div>
              <label className="text-sm font-medium text-zinc-200">
                Starting Dialogue <span className="text-red-500">*</span>
              </label>
              <Textarea
                required
                className="bg-zinc-800 border-zinc-700"
                value={startingDialogue}
                onChange={(e) => setStartingDialogue(e.target.value)}
              />
            </div>
            {/*
            <div>
              <label className="text-sm font-medium text-zinc-200 flex items-center">
                Contract Address <span className="text-red-500">*</span>
                <HoverTooltip
                  content={
                    "Paste the contract address of the agent after deploying it as a token to arbitrum."
                  }
                />
              </label>
              <Input
                required
                className="bg-zinc-800 border-zinc-700"
                placeholder="0x..."
                value={contractAddress}
                onChange={(e) => setContractAddress(e.target.value)}
              />
            </div>*/}
            <div>
              <label className="text-sm font-medium text-zinc-200 flex items-center">
                Twitter <span className="text-red-500">*</span>
                <HoverTooltip content="Twitter username of the agent" />
              </label>
              <Input
                required
                className="bg-zinc-800 border-zinc-700"
                placeholder="username"
                value={twitter}
                onChange={(e) => setTwitter(validateTwitter(e.target.value))}
              />
            </div>
          </div>

          <Button
            type="submit"
            className="w-full bg-pink-600 hover:bg-pink-700"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Creating..." : "Create Agent"}
          </Button>
        </form>
      </Card>
      <Card className="bg-zinc-900/90 backdrop-blur border-zinc-800 p-6 mb-6">
        <h2 className="text-lg font-semibold text-white mb-4">Templates</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {botTemplates.map((template) => (
            <Card 
              key={template.name}
              className="bg-zinc-800 border-zinc-700 p-4 cursor-pointer hover:border-pink-500/50 transition-colors"
              onClick={() => applyTemplate(template)}
            >
              <div className="flex items-center gap-3">
                <div className="relative w-12 h-12 rounded-full overflow-hidden">
                  <Image
                    src={template.image}
                    alt={template.name}
                    fill
                    className="object-cover"
                  />
                </div>
                <div>
                  <h3 className="font-medium text-white">{template.name}</h3>
                  <p className="text-sm text-zinc-400">{template.bio}</p>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </Card>
      <Toaster position="top-right" />
    </div>
  );
}
