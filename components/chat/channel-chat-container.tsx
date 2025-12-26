"use client";

import { useState, Suspense, useRef } from "react";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";
import { Button } from "@/components/ui/button";
import { Users } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { ImperativePanelHandle } from "react-resizable-panels";
import { ChatArea } from "./components/chat-area";
import { ListMember } from "./components/list-member";
import { trpc } from "@/lib/trpc/react";
import { MessageInput } from "../message-input";
import { Channel } from "@/types";

interface ChatContainerProps {
  // channelId: string;
  // channelName: string;
  initData?: Channel;
  serverId: string;
}

export default function ChatContainer({
  // channelId,
  // channelName,
  initData,
  serverId,
}: ChatContainerProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const memberPanelRef = useRef<ImperativePanelHandle>(null);

  const sendMessage = trpc.message.sendMessage.useMutation({
    onSuccess: () => {
      trpc.useUtils().message.getMessages.invalidate({
        channelId: initData?.id ?? "",
        limit: 50,
      });
    },
  });

  const handleSendMessage = (content: string) => {
    sendMessage.mutate({ channelId: initData?.id ?? "", content });
  };
  
  return (
    <div className="flex flex-col h-screen w-full bg-background">
      {/* Header */}
      <header className="flex shrink-0 items-center justify-between border-b p-2.5 bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60">
        <h1 className="text-lg font-medium">#{initData?.name}</h1>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => {
            if (isCollapsed) {
              memberPanelRef.current?.expand();
            } else {
              memberPanelRef.current?.collapse();
            }
          }}
        >
          <Users className="h-5 w-5" />
        </Button>
      </header>

      <ResizablePanelGroup
        direction="horizontal"
        className="flex flex-col w-full h-full"
      >
        {/* Chat Area */}
        <ResizablePanel
          defaultSize={80}
          maxSize={100}
          minSize={80}
          className="h-full flex flex-col overflow-hidden"
        >
          <div className="flex-1 overflow-hidden">
            <Suspense
              fallback={
                <div className="p-6 space-y-4">
                  {[...Array(10)].map((_, i) => (
                    <div key={i} className="flex gap-4">
                      <Skeleton className="h-10 w-10 rounded-full" />
                      <div className="space-y-2">
                        <Skeleton className="h-4 w-48" />
                        <Skeleton className="h-4 w-96" />
                      </div>
                    </div>
                  ))}
                </div>
              }
            >
              <ChatArea initData={initData?.messages ?? []} />
            </Suspense>
          </div>
          <div className="shrink-0 px-3 pb-3">
            <MessageInput
              channelName={initData?.name ?? ""}
              onSendMessage={handleSendMessage}
            />
          </div>
        </ResizablePanel>

        {/* Handle */}
        <ResizableHandle disabled />

        {/* Member List */}
        <ResizablePanel
          ref={memberPanelRef}
          defaultSize={20}
          minSize={0}
          collapsible={true}
          onCollapse={() => {
            setIsCollapsed(true);
          }}
          onExpand={() => {
            setIsCollapsed(false);
          }}
        >
          <ListMember serverId={serverId} />
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  );
}
