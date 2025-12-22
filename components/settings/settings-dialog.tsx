"use client";

import { Shield, User as UserIcon } from "lucide-react";
import { useState } from "react";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";

import { ScrollArea } from "@/components/ui/scroll-area";

import { Header, Sidebar } from "./components";
import type { User } from "@/types";
import { MyAccount } from "./my-account/my-account";

const nav = [
  { key: "profiles", label: "Profiles", icon: UserIcon },
  { key: "account", label: "My Account", icon: UserIcon },
  { key: "security", label: "Security", icon: Shield },
  { key: "two-factor", label: "Two-Factor Auth", icon: Shield },
];

type SectionKey = "profiles" | "account" | "security" | "two-factor";

interface SettingsDialogProps {
  openDialog?: boolean;
  setOpenDialog?: (open: boolean) => void;
  user: User;
  logout: () => void;
  hasPassword?: boolean;
}

export function SettingsDialog({
  openDialog,
  setOpenDialog,
  user,
  logout,
  hasPassword,
}: SettingsDialogProps) {
  const [activeSection, setActiveSection] = useState<SectionKey>("account");

  const sectionMap: Record<SectionKey, React.ReactNode> = {
    "profiles": null,
    account: <MyAccount user={user} hasPassword={hasPassword} />,
    security: null,
    "two-factor": null,
  };
  const activeNav = nav.find((n) => n.key === activeSection);
  return (
    <Dialog open={openDialog} onOpenChange={setOpenDialog}>
      <DialogContent className="p-0 w-[1320px] h-220" showCloseButton={false}>
        <DialogTitle className="sr-only">Settings</DialogTitle>
        <DialogDescription className="sr-only">
          Customize your settings here.
        </DialogDescription>

        <div className="flex h-full w-full overflow-hidden">
          <Sidebar
            nav={nav}
            activeSection={activeSection}
            setActiveSection={(section: string) =>
              setActiveSection(section as SectionKey)
            }
            user={user}
            logout={logout}
          />

          <main className="w-full flex flex-1 flex-col">
            <Header activeSection={activeNav?.label ?? ""} />

            <div className="w-full flex min-h-0">
              <ScrollArea className="h-full w-full">
                {/* {activeSection === "two-factor" ? (
                  <TwoFactorSetup
                    isEnabled={session?.user?.twoFactorEnabled ?? false}
                    onStatusChange={() => refetch()}
                  />
                ) : activeSection === "security" ? (
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
                )} */}
                <main className="flex justify-center pt-10">
                  {sectionMap[activeSection as SectionKey]}
                </main>
              </ScrollArea>
            </div>
          </main>
        </div>
      </DialogContent>
    </Dialog>
  );
}
