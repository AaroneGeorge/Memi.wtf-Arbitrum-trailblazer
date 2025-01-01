import { chatHistory } from "@/lib/data";
import { Card } from "@/components/ui/card";
import { formatDistanceToNow } from "date-fns";
import Image from "next/image";
import Link from "next/link";

export default function HistoryPage() {
  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <h1 className="text-2xl font-bold text-white mb-6">Chat History</h1>
      <div className="space-y-4">
        {chatHistory.map((chat) => (
          <Link key={chat.id} href={`/agent/${chat.agentId}`}>
            <Card className="bg-zinc-900 border-zinc-800 p-4 hover:border-pink-500/50 transition-colors">
              <div className="flex items-start gap-4">
                <Image
                  src={chat.agentImage}
                  alt={chat.agentName}
                  width={40}
                  height={40}
                  className="rounded-full"
                />
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold text-white">
                      {chat.agentName}
                    </h3>
                    <span className="text-sm text-zinc-400">
                      {formatDistanceToNow(new Date(chat.date), {
                        addSuffix: true,
                      })}
                    </span>
                  </div>
                  <p className="text-sm text-zinc-400 line-clamp-2">
                    {chat.preview}
                  </p>
                </div>
              </div>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
