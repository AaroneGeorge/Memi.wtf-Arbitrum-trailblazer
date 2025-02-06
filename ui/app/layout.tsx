
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Sidebar } from "@/components/sidebar";
import { FavoritesProvider } from "@/contexts/favorites-context";
import "./globals.css";
import { Providers } from "./providers";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Memi.wtf",
  description: "AI Agent Token generation platform for Arbitrum",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className={inter.className}>
        <Providers>
          <FavoritesProvider>
            <div className="h-full relative">
              <div className="hidden z-10 h-full md:flex md:w-72 md:flex-col md:fixed md:inset-y-0 bg-zinc-950">
                <Sidebar />
              </div>
              <main className="md:pl-72 min-h-screen bg-black">{children}</main>
            </div>
          </FavoritesProvider>
        </Providers>
      </body>
    </html>
  );
}
