import { AppSidebar } from "@/components/sidebar/app-sidebar";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";
import { FriendRequestListener } from "@/components/friend-request-listener";
import { DirectMessageListener } from "@/components/direct-message-listener";

const Layout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="min-h-screen">
      <FriendRequestListener />
      <DirectMessageListener />
      <ResizablePanelGroup direction="horizontal" className="w-max">
        <ResizablePanel
          defaultSize={22}
          minSize={16}
          maxSize={22}
          className="w-full"
        >
          <AppSidebar />
        </ResizablePanel>
        <ResizableHandle />
        <ResizablePanel
          defaultSize={78}
          minSize={78}
          maxSize={84}
          className="w-full"
        >
          {children}
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  );
};

export default Layout;
