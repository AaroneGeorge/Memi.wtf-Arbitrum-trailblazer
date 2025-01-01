"use client";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Wallet, Copy, LogOut } from "lucide-react";

export function WalletButton() {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          className="border-pink-800 text-pink-100 hover:bg-pink-950"
        >
          <Wallet className="mr-2 h-4 w-4" />
          Connect Wallet
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56 bg-zinc-950 border-zinc-800">
        <DropdownMenuItem className="text-zinc-200 focus:bg-pink-950 focus:text-pink-100">
          <Copy className="mr-2 h-4 w-4" />
          Copy Address
        </DropdownMenuItem>
        <DropdownMenuItem className="text-zinc-200 focus:bg-pink-950 focus:text-pink-100">
          <LogOut className="mr-2 h-4 w-4" />
          Disconnect
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
