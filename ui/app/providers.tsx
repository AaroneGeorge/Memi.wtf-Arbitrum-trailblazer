"use client";

// import { createWeb3Modal } from "@web3modal/wagmi/react";
// import { WagmiConfig, createConfig } from "wagmi";
// import { mainnet, arbitrum } from "viem/chains";
// import { injected, walletConnect } from "wagmi/connectors";
// import { http } from "viem";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

// Privy
import { PrivyProvider } from "@privy-io/react-auth";

// Create a client
const queryClient = new QueryClient();

// Set up wagmi config
// const config = createConfig({
//   chains: [mainnet, arbitrum],
//   transports: {
//     [mainnet.id]: http(),
//     [arbitrum.id]: http(),
//   },
//   connectors: [
//     injected(),
//     walletConnect({
//       projectId: process.env.NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID || "",
//     }),
//   ],
// });
//
// // Create modal
// createWeb3Modal({
//   wagmiConfig: config,
//   projectId: process.env.NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID || "",
//   chains: [mainnet, arbitrum],
//   themeMode: "dark",
// });

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <PrivyProvider
      appId={process.env.NEXT_PUBLIC_PRIVY_APP_ID || ""}
      config={{
        loginMethods: ["email", "wallet", "google", "apple", "farcaster"],
        appearance: {
          theme: "light",
          accentColor: "#676FFF",
          logo: "https://banner2.cleanpng.com/20180404/ije/avh826bi8.webp", // TODO: Change Logo
        },
        embeddedWallets: {
          createOnLogin: "all-users",
        },
      }}
    >
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </PrivyProvider>
  );
}
