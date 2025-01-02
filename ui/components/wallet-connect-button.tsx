"use client";

import { useWeb3Modal } from '@web3modal/wagmi/react'
import { useAccount, useDisconnect } from 'wagmi'
import { Button } from './ui/button'

export function WalletConnectButton() {
  const { open } = useWeb3Modal()
  const { address, isConnected } = useAccount()
  const { disconnect } = useDisconnect()

  if (isConnected) {
    return (
      <Button 
        onClick={() => disconnect()}
        variant="outline"
        className="bg-zinc-900 border-zinc-800 text-zinc-100 hover:bg-zinc-800"
      >
        {address?.slice(0, 6)}...{address?.slice(-4)}
      </Button>
    )
  }

  return (
    <Button 
      onClick={() => open()}
      variant="outline"
      className="bg-zinc-900 border-zinc-800 text-zinc-100 hover:bg-zinc-800"
    >
      Connect Wallet
    </Button>
  )
} 