import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Sidebar } from "@/components/sidebar";
import { FavoritesProvider } from "@/contexts/favorites-context";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Mimi.fun",
  description: "AI Agent Platform",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className={inter.className}>
        <FavoritesProvider>
          <div className="h-full relative">
            <div className="hidden h-full md:flex md:w-72 md:flex-col md:fixed md:inset-y-0 bg-zinc-950">
              <Sidebar />
            </div>
            <main className="md:pl-72 min-h-screen bg-black">{children}</main>
          </div>
        </FavoritesProvider>
      </body>
    </html>
  );
}
