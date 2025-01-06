"use client";

import { memo, useEffect, useState } from 'react'
import { useWeb3Modal } from '@web3modal/wagmi/react'
import { useAccount, useDisconnect } from 'wagmi'
import { Button } from './ui/button'

const WalletConnectButton = memo(() => {
  const { open } = useWeb3Modal()
  const { address, isConnected, chain } = useAccount()
  const { disconnect } = useDisconnect()
  const [mounted, setMounted] = useState(false)

  // Only show the component after it's mounted on the client
  useEffect(() => {
    setMounted(true)
  }, [])

  // When wallet is connected, dispatch the event
  const dispatchWalletConnected = (address: string, network: string) => {
    const event = new CustomEvent('walletConnected', {
      detail: {
        address,
        network
      }
    });
    window.dispatchEvent(event);
  };

  useEffect(() => {
    if (isConnected && address && chain) {
      dispatchWalletConnected(address, chain.name.toLowerCase() || 'ethereum');
    }
  }, [isConnected, address, chain]);

  if (!mounted) {
    return (
      <Button 
        variant="outline"
        className="bg-zinc-900 border-zinc-800 text-zinc-100 hover:bg-zinc-800"
      >
        Connect Wallet
      </Button>
    )
  }
  
  if (isConnected && address) {
    return (
      <Button 
        onClick={() => disconnect()}
        variant="outline"
        className="bg-zinc-900 border-zinc-800 text-zinc-100 hover:bg-zinc-800"
      >
        {address.slice(0, 6)}...{address.slice(-4)}
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
})

WalletConnectButton.displayName = 'WalletConnectButton'

export default WalletConnectButton 