import { http, createConfig } from "@wagmi/core";
import { mainnet, arbitrum, arbitrumSepolia, sepolia } from "viem/chains";
import { injected, walletConnect } from "wagmi/connectors";

export const config = createConfig({
  chains: [arbitrum, arbitrumSepolia],
  transports: {
    [arbitrum.id]: http(),
    [arbitrumSepolia.id]: http(),
  },
  connectors: [
    injected(),
    walletConnect({
      projectId: process.env.NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID || "",
    }),
  ],
});
