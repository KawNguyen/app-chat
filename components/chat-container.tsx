"use client";

import { useState } from "react";
import ListMember from "./list-member";
import { ResizablePanel, ResizablePanelGroup } from "./ui/resizable";
import { Users } from "lucide-react";
import ChatArea from "./chat-area";

const ChatContainer = () => {
  const [open, setOpen] = useState(true);
  return (
    <div className="flex flex-col h-screen w-full">
      <header className="bg-background top-0 flex shrink-0 items-center gap-2 border-b p-4">
        <div className="flex w-full items-center justify-between">
          <div className="text-foreground text-base font-medium"># Server</div>
        </div>

        <Users onClick={() => setOpen(!open)} size={16} />
      </header>
      <ResizablePanelGroup direction="horizontal" className="h-full">
        <ResizablePanel defaultSize={80} minSize={80} maxSize={100} className="h-full">
          <ChatArea />
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
