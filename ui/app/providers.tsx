"use client";

import { createWeb3Modal } from "@web3modal/wagmi/react";
import { WagmiConfig, createConfig } from "wagmi";
import { config } from "../contract/config";
import { mainnet, arbitrum, arbitrumSepolia, sepolia } from "viem/chains";
import { injected, walletConnect } from "wagmi/connectors";
import { http } from "viem";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

// Create a client
const queryClient = new QueryClient();

// Set up wagmi config
// const config = createConfig({
//   chains: [mainnet, arbitrum, arbitrumSepolia, sepolia],
//   transports: {
//     [mainnet.id]: http(),
//     [arbitrum.id]: http(),
//     [arbitrumSepolia.id]: http(),
//     [sepolia.id]: http(),
//   },
//   connectors: [
//     injected(),
//     walletConnect({
//       projectId: process.env.NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID || "",
//     }),
//   ],
// });

// Create modal
createWeb3Modal({
  wagmiConfig: config,
  projectId: process.env.NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID || "",
  defaultChain: arbitrumSepolia,
  themeMode: "dark",
});

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <WagmiConfig config={config}>
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </WagmiConfig>
  );
}
