"use client";

import { useState, useEffect } from "react";
import { useAccount } from "wagmi";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Copy, Edit2, Check, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import WalletConnectButton from "@/components/wallet-connect-button";
import Squares from "@/components/Squares";
import { testUsers } from "@/lib/test-data";
import { createOrUpdateUserProfile, getUserProfile } from "@/lib/firebase/firestore";

// Add new interface for user data
interface UserData {
  username: string;
  wallet_address: string;
  network: string;
  favourite_agents: string[];
  created_date?: string;
}

export default function ProfilePage() {
  const { address, isConnected } = useAccount();
  const [isEditing, setIsEditing] = useState(false);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [editingUsername, setEditingUsername] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const fetchUserData = async () => {
      if (isConnected && address) {
        setIsLoading(true);
        try {
          // Try to get user data from Firebase
          const userProfile = await getUserProfile(address);
          
          if (userProfile) {
            // User exists in Firebase
            setUserData({
              username: userProfile.username || '',
              wallet_address: userProfile.wallet_address,
              network: userProfile.network || 'Arbitrum',
              favourite_agents: userProfile.favourite_agents || [],
              created_date: userProfile.created_date
            });
            setEditingUsername(userProfile.username || '');
          } else {
            // Fallback to test data or create a new user object
            const user = testUsers[address as keyof typeof testUsers];
            if (user) {
              setUserData(user);
              setEditingUsername(user.username);
            } else {
              // Create a minimal user object
              setUserData({
                username: '',
                wallet_address: address,
                network: 'Arbitrum',
                favourite_agents: []
              });
              setEditingUsername('');
            }
          }
        } catch (error) {
          console.error("Error fetching user data:", error);
        } finally {
          setIsLoading(false);
        }
      }
    };

    fetchUserData();
  }, [isConnected, address]);

  const saveUsername = async () => {
    if (!userData || !address) return;
    
    setIsSaving(true);
    try {
      // Save to Firebase
      await createOrUpdateUserProfile(address, {
        username: editingUsername,
        wallet_address: address
      });
      
      // Update local state
      setUserData({
        ...userData,
        username: editingUsername
      });
      setIsEditing(false);
    } catch (error) {
      console.error("Error saving username:", error);
    } finally {
      setIsSaving(false);
    }
  };

  // Effect to refresh user data after saving
  useEffect(() => {
    const refreshUserData = async () => {
      if (!isSaving && !isEditing && address) {
        try {
          const userProfile = await getUserProfile(address);
          if (userProfile) {
            setUserData({
              username: userProfile.username || '',
              wallet_address: userProfile.wallet_address,
              network: userProfile.network || 'Arbitrum',
              favourite_agents: userProfile.favourite_agents || [],
              created_date: userProfile.created_date
            });
          }
        } catch (error) {
          console.error("Error refreshing user data:", error);
        }
      }
    };

    refreshUserData();
  }, [isSaving, isEditing, address]);

  const copyAddress = () => {
    if (address) {
      navigator.clipboard.writeText(address);
    }
  };

  const startEditing = () => {
    setEditingUsername(userData?.username || "");
    setIsEditing(true);
  };

  const cancelEditing = () => {
    setEditingUsername(userData?.username || "");
    setIsEditing(false);
  };

  if (!isConnected) {
    return (
      <div className="relative min-h-screen">
        <div className="fixed inset-0">
          <Squares
            speed={0.5}
            squareSize={40}
            direction="diagonal"
            borderColor="#fff"
            hoverFillColor="#222"
          />
        </div>
        <div className="relative container mx-auto p-6 max-w-2xl h-[80vh] flex items-center justify-center">
          <Card className="bg-zinc-900/90 backdrop-blur border-zinc-800 p-6 text-center relative z-10">
            <h1 className="text-2xl font-bold text-white mb-6">Profile</h1>
            <p className="text-zinc-400 mb-6">
              Please connect your wallet to view your profile
            </p>
            <WalletConnectButton />
          </Card>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="container mx-auto p-6 max-w-2xl h-[80vh] flex items-center justify-center">
        <Card className="bg-zinc-900 border-zinc-800 p-6 text-center">
          <p className="text-zinc-400">Loading...</p>
        </Card>
      </div>
    );
  }

  return (
    <div className="h-full p-6 space-y-6">
      <div className="fixed inset-0">
        <Squares
          speed={0.5}
          squareSize={40}
          direction="diagonal"
          borderColor="#fff"
          hoverFillColor="#222"
        />
      </div>
      <div className="relative z-10">
        <h1 className="text-2xl font-bold text-zinc-100">Profile</h1>

        <div className="space-y-4 max-w-3xl">
          <Card className="bg-zinc-950/90 backdrop-blur border-zinc-800">
            <CardHeader className="text-zinc-100 font-semibold flex flex-row items-center justify-between">
              <span>Personal Information</span>
              {!isEditing && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-zinc-400 hover:text-zinc-100"
                  onClick={startEditing}
                >
                  <Edit2 className="h-4 w-4" />
                </Button>
              )}
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm text-zinc-400">Username</label>
                {isEditing ? (
                  <div className="flex items-center gap-2">
                    <Input
                      value={editingUsername}
                      onChange={(e) => setEditingUsername(e.target.value)}
                      className="bg-zinc-900 border-zinc-800 text-zinc-100"
                      placeholder="Enter username"
                      disabled={isSaving}
                    />
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-green-500 hover:text-green-400"
                      onClick={saveUsername}
                      disabled={isSaving}
                    >
                      {isSaving ? (
                        <div className="h-4 w-4 animate-spin rounded-full border-b-2 border-green-500"></div>
                      ) : (
                        <Check className="h-4 w-4" />
                      )}
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-red-500 hover:text-red-400"
                      onClick={cancelEditing}
                      disabled={isSaving}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ) : (
                  <p className="text-lg font-medium text-zinc-100">
                    {userData?.username || "No username set"}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <label className="text-sm text-zinc-400">Member Since</label>
                <p className="text-zinc-100">
                  {userData?.created_date
                    ? new Date(userData.created_date).toLocaleDateString()
                    : "N/A"}
                </p>
              </div>

              <div className="space-y-2">
                <label className="text-sm text-zinc-400">Favorite Agents</label>
                <p className="text-zinc-100">
                  {userData?.favourite_agents?.length
                    ? userData.favourite_agents.join(", ")
                    : "No favorite agents yet"}
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-zinc-950/90 backdrop-blur border-zinc-800">
            <CardHeader className="text-zinc-100 font-semibold">
              Wallet Address
            </CardHeader>
            <CardContent>
              {!isConnected ? (
                <p className="text-zinc-400">
                  Please connect your wallet to view address
                </p>
              ) : (
                <div className="flex items-center justify-between">
                  <p className="text-zinc-100 font-mono">{address}</p>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-zinc-400 hover:text-zinc-100"
                    onClick={copyAddress}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* <Card className="bg-zinc-950 border-zinc-800">
            <CardHeader className="text-zinc-100 font-semibold">
              Network Information
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <span className="text-zinc-400">Network</span>
                <span className="text-zinc-100">Arbitrum</span>
              </div>
            </CardContent>
          </Card> */}
        </div>
      </div>
    </div>
  );
}
