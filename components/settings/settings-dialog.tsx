"use client";

import {
  Bell,
  Check,
  Globe,
  Home,
  Keyboard,
  Link,
  Lock,
  LogOut,
  Menu,
  MessageCircle,
  Paintbrush,
  Shield,
  Video,
  X,
} from "lucide-react";
import { useState } from "react";

import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";

import { TwoFactorSetup } from "./two-factor-setup";
import { SetPasswordForm } from "./set-password-form";
import { useSession } from "@/lib/auth-client";
import { trpc } from "@/lib/trpc/react";
import { cn } from "@/lib/utils";

const nav = [
  { name: "Notifications", icon: Bell },
  { name: "Navigation", icon: Menu },
  { name: "Home", icon: Home },
  { name: "Appearance", icon: Paintbrush },
  { name: "Messages & media", icon: MessageCircle },
  { name: "Language & region", icon: Globe },
  { name: "Accessibility", icon: Keyboard },
  { name: "Mark as read", icon: Check },
  { name: "Audio & video", icon: Video },
  { name: "Connected accounts", icon: Link },
  { name: "Privacy & visibility", icon: Lock },
  { name: "Security", icon: Shield },
  { name: "Two-Factor Auth", icon: Shield },
];

interface SettingsDialogProps {
  openDialog?: boolean;
  setOpenDialog?: (open: boolean) => void;
  logout: () => void;
}

export function SettingsDialog({
  openDialog,
  setOpenDialog,
  logout,
}: SettingsDialogProps) {
  const [activeSection, setActiveSection] = useState("Two-Factor Auth");
  const { data: session, refetch } = useSession();
  const utils = trpc.useUtils();

  const { data: passwordStatus } = trpc.auth.checkPassword.useQuery(undefined, {
    enabled: openDialog === true,
  });

  return (
    <Dialog open={openDialog} onOpenChange={setOpenDialog}>
      <DialogContent className="p-0 w-260 h-200" showCloseButton={false}>
        <DialogTitle className="sr-only">Settings</DialogTitle>
        <DialogDescription className="sr-only">
          Customize your settings here.
        </DialogDescription>

        <div className="flex h-full w-full overflow-hidden">
          <aside className="hidden md:flex w-64 border-r bg-muted/30 flex-col">
            <div className="flex-1 overflow-y-auto p-2">
              <nav className="space-y-1">
                {nav.map((item) => {
                  const Icon = item.icon;
                  const active = item.name === activeSection;
                  return (
                    <button
                      key={item.name}
                      onClick={() => setActiveSection(item.name)}
                      className={cn(
                        "flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm transition",
                        active
                          ? "bg-muted font-medium"
                          : "hover:bg-muted/60 text-muted-foreground"
                      )}
                    >
                      <Icon className="h-4 w-4" />
                      <span>{item.name}</span>
                    </button>
                  );
                })}
              </nav>
            </div>

            <div className="border-t p-2">
              <Button
                variant="ghost"
                className="w-full justify-start gap-2"
                onClick={logout}
              >
                <LogOut className="h-4 w-4" />
                Logout
              </Button>
            </div>
          </aside>

          <main className="flex flex-1 flex-col min-w-0">
            <header className="h-10 shrink-0 flex items-center px-4 border-b">
              <Breadcrumb>
                <BreadcrumbList>
                  <BreadcrumbItem className="hidden md:block">
                    <BreadcrumbLink href="#">Settings</BreadcrumbLink>
                  </BreadcrumbItem>
                  <BreadcrumbSeparator className="hidden md:block" />
                  <BreadcrumbItem>
                    <BreadcrumbPage>{activeSection}</BreadcrumbPage>
                  </BreadcrumbItem>
                </BreadcrumbList>
              </Breadcrumb>
              <DialogClose className="ml-auto text-muted-foreground hover:text-foreground">
                <X className="size-5" />
              </DialogClose>
            </header>

            <div className="flex flex-1 min-h-0">
              <ScrollArea className="h-full w-full p-4">
                {activeSection === "Two-Factor Auth" ? (
                  <TwoFactorSetup
                    isEnabled={session?.user?.twoFactorEnabled ?? false}
                    onStatusChange={() => refetch()}
                  />
                ) : activeSection === "Security" ? (
                  <div className="space-y-4">
                    <SetPasswordForm
                      hasPassword={passwordStatus?.hasPassword ?? false}
                      onSuccess={async () => {
                        await refetch();
                        await utils.auth.checkPassword.invalidate();
                      }}
                    />
                  </div>
                ) : (
                  <div className="space-y-4">
                    {Array.from({ length: 12 }).map((_, i) => (
                      <div
                        key={i}
                        className="bg-muted/50 h-40 max-w-3xl rounded-xl"
                      />
                    ))}
                  </div>
                )}
              </ScrollArea>
            </div>
          </main>
        </div>
      </DialogContent>
    </Dialog>
  );
}
