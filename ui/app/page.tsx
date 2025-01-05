"use client";

import { useState, useEffect, Suspense } from "react";
import { AgentCard } from "@/components/agent-card";
// import WalletConnectButton from "@/components/wallet-connect-button";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { agents } from "@/lib/data";
import { GetServerSideProps } from "next";

//privy
import { useLogin, usePrivy } from "@privy-io/react-auth";
import { PrivyClient } from "@privy-io/server-auth";

// export const getServerSideProps: GetServerSideProps = async ({ req }) => {
//   const cookieAuthToken = req.cookies["privy-token"];
//
//   // If no cookie is found, skip any further checks
//   if (!cookieAuthToken) return { props: {} };
//
//   const PRIVY_APP_ID = process.env.NEXT_PUBLIC_PRIVY_APP_ID;
//   const PRIVY_APP_SECRET = process.env.NEXT_PUBLIC_PRIVY_SECRET;
//   const client = new PrivyClient(PRIVY_APP_ID!, PRIVY_APP_SECRET!);
//
//   try {
//     const claims = await client.verifyAuthToken(cookieAuthToken);
//     // Use this result to pass props to a page for server rendering or to drive redirects!
//     // ref https://nextjs.org/docs/pages/api-reference/functions/get-server-side-props
//     console.log({ claims });
//
//     return {
//       props: {},
//       redirect: { destination: "/dashboard", permanent: false },
//     };
//   } catch (error) {
//     return { props: {} };
//   }
// };

function LoginButton() {
  const { login } = useLogin({
    onComplete: () => console.log("Logged In"),
  });
  return (
    <button
      onClick={login}
      className="px-4 py-2 bg-pink-500 text-white rounded-md hover:bg-pink-600 transition-colors"
    >
      Log in
    </button>
  );
}

export default function Home() {
  const [searchQuery, setSearchQuery] = useState("");
  const [userAddress, setUserAddress] = useState<string>("");

  const { user, ready, authenticated, logout } = usePrivy();

  useEffect(() => {
    if (authenticated && user?.wallet?.address) {
      setUserAddress(user.wallet.address);
    }
  }, [authenticated, user]);

  console.log("Privy Wallet", user);
  console.log("Privy:", ready, authenticated);
  const filteredAgents = agents.filter(
    (agent) =>
      agent.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      agent.description.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  return (
    <div className="h-full relative">
      <Suspense
        fallback={
          <div className="flex items-center justify-center h-screen">
            Loading...
          </div>
        }
      >
        <main className="p-6">
          <div className="px-6 py-4 border-b border-zinc-800 flex items-center justify-between mb-6">
            {authenticated && (
              <div className="relative w-full max-w-md">
                <Search className="absolute left-3 top-3 h-4 w-4 text-zinc-400" />
                <Input
                  placeholder="Search agents..."
                  className="pl-9 bg-zinc-900 border-zinc-800 focus-visible:ring-pink-500 text-zinc-100"
                  value={searchQuery}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    setSearchQuery(e.target.value)
                  }
                />
              </div>
            )}
            <div className="text-zinc-400 text-sm">
              {authenticated ? (
                <div className="flex flex-col">
                  <button
                    onClick={logout}
                    className="px-4 py-2 bg-pink-500 text-white rounded-md hover:bg-pink-600 transition-colors"
                  >
                    Logout
                  </button>
                  <span>
                    Connected: {userAddress.slice(0, 6)}...
                    {userAddress.slice(-4)}
                  </span>
                </div>
              ) : null}
            </div>
            {/*<LoginButton />*/}
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {authenticated ? (
              filteredAgents.map((agent) => (
                <AgentCard
                  key={agent.id}
                  id={agent.id}
                  name={agent.name}
                  description={`Created by ${agent.creator}`}
                  image={agent.image}
                  bio={agent.bio}
                />
              ))
            ) : (
              <div className="flex flex-col items-center justify-center h-[80vh] gap-6">
                <h1 className="text-3xl font-bold text-zinc-100">
                  Welcome to Agent Marketplace
                </h1>
                <p className="text-zinc-400 text-center max-w-md mb-4">
                  Connect your wallet to browse and interact with our collection
                  of AI agents.
                </p>
                <LoginButton />
              </div>
            )}
          </div>
        </main>
      </Suspense>
    </div>
  );
}
