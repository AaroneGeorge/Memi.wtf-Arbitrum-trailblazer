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

const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;

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
  const [twitter, setTwitter] = useState("memi");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // contract
  const { data: hash, isPending, writeContract } = useWriteContract();
  // const { data: receipt } = useWaitForTransactionReceipt({ hash });

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

    if (
      !name ||
      !ticker ||
      !bio ||
      !personality ||
      !startingDialogue ||
      !twitter
    ) {
      toast.error("Please fill in all required fields");
      return;
    }

    if (!image) {
      toast.error("Please upload an agent image");
      return;
    }

    try {
      setIsSubmitting(true);

      // Writing Contract
      writeContract({
        //address: "0xf66Caf08e7205654F666364554e7376BC1C704B1", // sepolia
        address: "0x77aDfAe2d4639de469dDD47ea6ed1C3Abc2CeD33", // arbitrum sepolia
        abi,
        functionName: "createToken",
        args: [name, ticker],
      });

      // Create a promise to wait for hash
      const waitForHash = new Promise((resolve, reject) => {
        const timeout = setTimeout(() => {
          reject(new Error("Transaction hash timeout"));
        }, 30000);

        const checkHash = async () => {
          if (hash) {
            clearTimeout(timeout);
            resolve(hash);
          } else if (!isPending) {
            clearTimeout(timeout);
            reject(new Error("Transaction failed"));
          } else {
            setTimeout(checkHash, 30000);
          }
        };

        checkHash();
      });

      // Wait for hash
      const txHash = await waitForHash;
      console.log("Transaction hash:", txHash);

      // Wait for transaction receipt
      const receipt = await getTransactionReceipt(config, {
        hash: txHash as `0x${string}`,
      });

      // Extract token ID from receipt
      const tokenId = receipt.logs[0].address; // Assuming this is where the token ID is stored
      const contractAddress = `${tokenId}`; // Format contract address with token ID

      console.log("Transaction receipt:", receipt);
      console.log("Token ID:", tokenId);

      const imageFile = image ? await fetch(image).then((r) => r.blob()) : null;
      let base64Image = null;

      if (imageFile) {
        base64Image = await convertImageToBase64(imageFile as File);
      }

      const response = await fetch(`${backendUrl}/bots/create`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: name,
          bio: bio,
          personality: personality,
          starting_dialogue: startingDialogue,
          ticker_symbol: `$${ticker}`,
          contract_address: contractAddress,
          ticker: `$${ticker}`,
          creator: address,
          image: base64Image,
          twitter: twitter,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        if (error.detail?.includes("database is locked")) {
          throw new Error("Server is busy, please try again in a few moments");
        }
        throw new Error(error.detail || "Failed to create AI agent");
      }

      const data = await response.json();
      toast.success("AI agent created successfully!", {
        duration: 5000,
      });

      setImage("/assets/anyachan.jpg");
      setName("");
      setTicker("");
      setBio("");
      setPersonality("");
      setStartingDialogue("");
      setContractAddress("");
      setTwitter("");

      setTimeout(() => {
        router.push("/");
      }, 1000);
    } catch (error: any) {
      console.error("Error creating AI agent:", error);
      toast.error(error.message || "Failed to create AI agent");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isConnected) {
    return (
      <div className="container mx-auto p-6 max-w-2xl h-[80vh] flex items-center justify-center">
        <Card className="bg-zinc-900 border-zinc-800 p-6 text-center">
          <h1 className="text-2xl font-bold text-white mb-6">
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
      <Card className="bg-zinc-900 border-zinc-800 p-6">
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
      <Toaster position="top-right" />
    </div>
  );
}
