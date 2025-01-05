"use client";

import { useState } from "react";
import { useAccount } from "wagmi";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ImagePlus } from "lucide-react";
import Image from "next/image";

export default function CreatePage() {
  const { isConnected } = useAccount();
  const [image, setImage] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [ticker, setTicker] = useState("");
  const [bio, setBio] = useState("");
  const [personality, setPersonality] = useState("");
  const [startingDialogue, setStartingDialogue] = useState("");
  const [contractAddress, setContractAddress] = useState("");
  const [twitter, setTwitter] = useState("");

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle form submission here
    console.log({
      name,
      ticker,
      bio,
      personality,
      startingDialogue,
      contractAddress,
      twitter,
    });
  };

  if (!isConnected) {
    return (
      <div className="container mx-auto p-6 max-w-2xl h-[80vh] flex items-center justify-center">
        <Card className="bg-zinc-900 border-zinc-800 p-6 text-center">
          <h1 className="text-2xl font-bold text-white mb-6">Create AI Agent</h1>
          <p className="text-zinc-400 mb-6">Please connect your wallet to create an AI agent</p>
          <w3m-button />
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 max-w-2xl">
      <Card className="bg-zinc-900 border-zinc-800 p-6">
        <h1 className="text-2xl font-bold text-white mb-6">Create AI Agent</h1>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="flex justify-center">
            <div className="relative w-32 h-32">
              {image ? (
                <Image
                  src={image}
                  alt="Agent"
                  fill
                  className="rounded-full object-cover"
                />
              ) : (
                <label className="flex items-center justify-center w-full h-full rounded-full border-2 border-dashed border-zinc-700 cursor-pointer hover:border-pink-500/50 transition-colors">
                  <ImagePlus className="h-8 w-8 text-zinc-500" />
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleImageUpload}
                  />
                </label>
              )}
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-zinc-200">Agent Name</label>
              <Input
                className="bg-zinc-800 border-zinc-700"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
            <div>
              <label className="text-sm font-medium text-zinc-200">
                Ticker
              </label>
              <Input
                className="bg-zinc-800 border-zinc-700"
                placeholder="$SYMBOL"
                value={ticker}
                onChange={(e) => setTicker(e.target.value)}
              />
            </div>
            <div>
              <label className="text-sm font-medium text-zinc-200">Bio</label>
              <Textarea
                className="bg-zinc-800 border-zinc-700"
                value={bio}
                onChange={(e) => setBio(e.target.value)}
              />
            </div>
            <div>
              <label className="text-sm font-medium text-zinc-200">
                Personality
              </label>
              <Textarea
                className="bg-zinc-800 border-zinc-700"
                value={personality}
                onChange={(e) => setPersonality(e.target.value)}
              />
            </div>
            <div>
              <label className="text-sm font-medium text-zinc-200">
                Starting Dialogue
              </label>
              <Textarea
                className="bg-zinc-800 border-zinc-700"
                value={startingDialogue}
                onChange={(e) => setStartingDialogue(e.target.value)}
              />
            </div>
            <div>
              <label className="text-sm font-medium text-zinc-200">
                Contract Address
              </label>
              <Input
                className="bg-zinc-800 border-zinc-700"
                placeholder="0x..."
                value={contractAddress}
                onChange={(e) => setContractAddress(e.target.value)}
              />
            </div>
            <div>
              <label className="text-sm font-medium text-zinc-200">
                Twitter
              </label>
              <Input
                className="bg-zinc-800 border-zinc-700"
                placeholder="@username"
                value={twitter}
                onChange={(e) => setTwitter(e.target.value)}
              />
            </div>
          </div>

          <Button
            type="submit"
            className="w-full bg-pink-600 hover:bg-pink-700"
          >
            Create Agent
          </Button>
        </form>
      </Card>
    </div>
  );
}
