"use client";

import { useState, useEffect } from 'react';
import { useAccount } from 'wagmi';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Copy, Edit2, Check, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { generateRandomUsername } from '@/lib/utils';

export default function ProfilePage() {
  const { address, isConnected } = useAccount();
  const [isEditing, setIsEditing] = useState(false);
  const [username, setUsername] = useState('');
  const [editingUsername, setEditingUsername] = useState('');

  // Generate random username on first load or when wallet connects
  useEffect(() => {
    if (isConnected && !username) {
      setUsername(generateRandomUsername());
    }
  }, [isConnected]);

  const copyAddress = () => {
    if (address) {
      navigator.clipboard.writeText(address);
    }
  };

  const startEditing = () => {
    setEditingUsername(username);
    setIsEditing(true);
  };

  const saveUsername = () => {
    setUsername(editingUsername);
    setIsEditing(false);
  };

  const cancelEditing = () => {
    setEditingUsername(username);
    setIsEditing(false);
  };

  if (!isConnected) {
    return (
      <div className="container mx-auto p-6 max-w-2xl h-[80vh] flex items-center justify-center">
        <Card className="bg-zinc-900 border-zinc-800 p-6 text-center">
          <h1 className="text-2xl font-bold text-white mb-6">Profile</h1>
          <p className="text-zinc-400 mb-6">Please connect your wallet to view your profile</p>
          <w3m-button />
        </Card>
      </div>
    );
  }

  return (
    <div className="h-full p-6 space-y-6">
      <h1 className="text-2xl font-bold text-zinc-100">Profile</h1>
      
      <div className="space-y-4 max-w-3xl">
        <Card className="bg-zinc-950 border-zinc-800">
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
                  />
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-green-500 hover:text-green-400"
                    onClick={saveUsername}
                  >
                    <Check className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-red-500 hover:text-red-400"
                    onClick={cancelEditing}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ) : (
                <p className="text-lg font-medium text-zinc-100">{username}</p>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-zinc-950 border-zinc-800">
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
                <p className="text-zinc-100 font-mono">
                  {address}
                </p>
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

        <Card className="bg-zinc-950 border-zinc-800">
          <CardHeader className="text-zinc-100 font-semibold">
            Network Information
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <span className="text-zinc-400">Network</span>
              <span className="text-zinc-100">Arbitrum</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
