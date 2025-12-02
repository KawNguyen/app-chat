"use client";

import { Zap, Users, Settings } from "lucide-react";
import { useState } from "react";

import { NavUser } from "@/components/sidebar/nav-user";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";

import { signOut, useSession } from "@/lib/auth-client";
import { servers } from "@/constants";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import Link from "next/link";
import { CreateServerDialog } from "./create-server-dialog";

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { data: user } = useSession();

  const [activeServer, setActiveServer] = useState<(typeof servers)[0] | null>(
    servers[0]
  );
  const [activeChannel, setActiveChannel] = useState<string | null>(null);
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});

  return (
    <Sidebar collapsible="icon" className="overflow-hidden" {...props}>
      {/* SIDEBAR LỚN */}
      <SidebarContent className="flex-row gap-0 overflow-hidden">
        {/* SERVER LIST */}
        <Sidebar
          collapsible="none"
          className="w-max border-r flex items-center"
        >
          <SidebarHeader>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton size="lg" className="hover:bg-transparent">
                  <div className="bg-sidebar-primary text-sidebar-primary-foreground flex aspect-square size-10 items-center justify-center rounded-lg">
                    <Zap className="size-6" />
                  </div>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarHeader>

          <SidebarContent>
            <SidebarGroup>
              <SidebarGroupContent className="px-1.5 md:px-0">
                <SidebarMenu className="flex justify-center items-center">
                  {servers.map((sv) => (
                    <SidebarMenuItem
                      key={sv.id}
                      className="h-10 w-10 flex justify-center items-center"
                    >
                      <SidebarMenuButton
                        tooltip={{ children: sv.name }}
                        onClick={() => {
                          setActiveServer(sv);
                          setActiveChannel(null);
                        }}
                        isActive={activeServer?.id === sv.id}
                        className="w-full h-full flex items-center justify-center"
                      >
                        <Avatar className="h-8 w-8 rounded-lg">
                          <AvatarImage src={sv.image || ""} alt={sv.name} />
                          <AvatarFallback className="rounded-lg">
                            {sv.initial}
                          </AvatarFallback>
                        </Avatar>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                  <SidebarMenuItem className="w-full h-full flex items-center justify-center">
                    <SidebarMenuButton
                      size="lg"
                      className="hover:bg-transparent"
                    >
                      <CreateServerDialog />
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </SidebarContent>
        </Sidebar>

        {/* CHANNEL LIST */}
        <Sidebar collapsible="none" className="flex-1 md:flex">
          <SidebarHeader className="border-b p-4">
            <div className="flex w-full items-center justify-between">
              <div className="text-foreground text-base font-medium">
                {activeServer?.name}
              </div>
            </div>
          </SidebarHeader>

          <SidebarContent>
            <SidebarGroup className="px-0">
              <SidebarGroupContent>
                {activeServer?.categories.map((cat) => (
                  <div key={cat.id} className="p-2">
                    {/* CATEGORY HEADER */}
                    <button
                      onClick={() =>
                        setCollapsed((prev) => ({
                          ...prev,
                          [cat.id]: !prev[cat.id],
                        }))
                      }
                      className="flex items-center justify-between w-full text-xs font-semibold text-muted-foreground px-2 py-1 hover:text-white"
                    >
                      <span className="uppercase">{cat.name}</span>
                      <span className="text-lg">+</span>
                    </button>

                    {/* CHANNEL LIST */}
                    {!collapsed[cat.id] && (
                      <div className="mt-1 flex flex-col">
                        {cat.channels.map((channel) => (
                          <Link
                            href={`/${activeServer?.id}/${channel.id}`}
                            key={channel.id}
                            onClick={() => setActiveChannel(channel.id)}
                            className={`flex items-center justify-between px-2 py-1 rounded-md group
                              ${
                                activeChannel === channel.id
                                  ? "bg-accent text-"
                                  : "text-muted-foreground hover:bg-accent/30 hover:text-white"
                              }
                            `}
                          >
                            <div className="flex items-center gap-2">
                              <channel.icon className="w-4 h-4" />
                              <span className="text-sm">{channel.name}</span>
                            </div>

                            {/* ACTION ICONS */}
                            {activeChannel === channel.id && (
                              <div className="flex items-center gap-1 opacity-100 transition-opacity">
                                <Users className="w-4 h-4" />
                                <Settings className="w-4 h-4" />
                              </div>
                            )}
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </SidebarGroupContent>
            </SidebarGroup>
          </SidebarContent>
        </Sidebar>
      </SidebarContent>

      {/* USER */}
      <SidebarFooter className="pt-0">
        <NavUser
          user={{
            name: user?.user.name || "User",
            email: user?.user.email || "user@example.com",
            image: user?.user.image ?? undefined,
          }}
          logout={() => signOut()}
        />
      </SidebarFooter>
    </Sidebar>
  );
}
