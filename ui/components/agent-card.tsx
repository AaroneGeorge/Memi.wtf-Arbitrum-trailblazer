import Image from "next/image";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface AgentCardProps {
  name: string;
  description: string;
  image: string;
}

export function AgentCard({ name, description, image }: AgentCardProps) {
  return (
    <Card className="bg-zinc-900 border-zinc-800 hover:border-pink-500/50 transition-colors">
      <CardContent className="p-6">
        <div className="flex items-center gap-4">
          <div className="relative w-12 h-12">
            <Image
              src={image}
              alt={name}
              fill
              className="rounded-full object-cover"
            />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-white">{name}</h3>
            <p className="text-sm text-zinc-400">{description}</p>
          </div>
        </div>
      </CardContent>
      <CardFooter className="bg-zinc-950/50 px-6 py-4">
        <Button
          variant="secondary"
          className="w-full bg-pink-950 hover:bg-pink-900 text-pink-50"
        >
          Chat Now
        </Button>
      </CardFooter>
    </Card>
  );
}
