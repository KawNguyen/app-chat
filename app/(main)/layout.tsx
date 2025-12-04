import ChatContainer from "@/components/chat-container";
import { AppSidebar } from "@/components/sidebar/app-sidebar";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";

const Layout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="min-h-screen">
      <ResizablePanelGroup direction="horizontal" className="w-max">
        <ResizablePanel
          defaultSize={18}
          minSize={14}
          maxSize={18}
          className="w-full"
        >
          <AppSidebar />
        </ResizablePanel>
        <ResizableHandle />
        <ResizablePanel
          defaultSize={82}
          minSize={82}
          maxSize={86}
          className="w-full"
        >
          <ChatContainer />
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  );
};

export default Layout;
