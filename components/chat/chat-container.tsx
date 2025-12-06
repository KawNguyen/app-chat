"use client";

import { useState, lazy, Suspense } from "react";
import { ResizablePanel, ResizablePanelGroup } from "../ui/resizable";
import { Users } from "lucide-react";
import { ListMember } from "./chat-channels-server";
import { Skeleton } from "../ui/skeleton";

// Code splitting cho ChatArea
const ChatArea = lazy(() =>
  import("./chat-channels-server").then((mod) => ({ default: mod.ChatArea }))
);

interface ChatContainerProps {
  channelId: string;
  channelName?: string;
}

const ChatContainer = ({
  channelId,
  channelName = "Server",
}: ChatContainerProps) => {
  const [open, setOpen] = useState(true);
  return (
    <div className="flex flex-col h-screen w-full">
      <header className="bg-background top-0 flex shrink-0 items-center gap-2 border-b p-4">
        <div className="flex w-full items-center justify-between">
          <div className="text-foreground text-base font-medium">
            # {channelName}
          </div>
        </div>

        <Users onClick={() => setOpen(!open)} size={16} />
      </header>
      <ResizablePanelGroup direction="horizontal" className="h-full">
        <ResizablePanel
          defaultSize={80}
          minSize={80}
          maxSize={100}
          className="h-full"
        >
          <Suspense
            fallback={
              <div className="flex flex-col gap-2 p-4">
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-3/4" />
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-2/3" />
              </div>
            }
          >
            <ChatArea channelId={channelId} />
          </Suspense>
        </ResizablePanel>
        <ResizablePanel
          className={`${open ? "block" : "hidden"} border-l`}
          defaultSize={30}
          minSize={0}
          maxSize={30}
        >
          <ListMember />
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  );
};

export default ChatContainer;
