import Link from "next/link";
import { Hash } from "lucide-react";

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center h-screen">
      <div className="text-center space-y-4">
        <Hash className="w-16 h-16 mx-auto text-muted-foreground" />
        <h2 className="text-2xl font-bold">Channel Not Found</h2>
        <p className="text-muted-foreground">
          This channel doesn&apos;t exist or you don&apos;t have access to it.
        </p>
        <Link
          href="/channels/me"
          className="inline-block mt-4 px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
        >
          Go back to home
        </Link>
      </div>
    </div>
  );
}
