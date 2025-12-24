"use client";

import { createContext, useContext, ReactNode } from "react";
import { trpc } from "@/lib/trpc/react";
import { User } from "@/types";

interface UserContextValue {
  user: User;
  isLoading: boolean;
}

const UserContext = createContext<UserContextValue | undefined>(undefined);

export function UserProvider({ children }: { children: ReactNode }) {
  const { data: user, isLoading } = trpc.user.me.useQuery(undefined, {
    staleTime: 2 * 60 * 1000, // 2 minutes
    refetchOnWindowFocus: false, // Tối ưu thêm
  }) as { data: User; isLoading: boolean };

  return (
    <UserContext.Provider value={{ user, isLoading }}>
      {children}
    </UserContext.Provider>
  );
}

export function useCurrentUser() {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error("useCurrentUser must be used within UserProvider");
  }
  return context;
}
