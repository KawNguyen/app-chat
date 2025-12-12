"use client";

import {
  createContext,
  useContext,
  useState,
  useCallback,
  useMemo,
} from "react";
import { trpc } from "@/lib/trpc/react";
import { UserStatus } from "@/types";

interface UserStatusMap {
  [userId: string]: UserStatus;
}

interface UserStatusContextType {
  getUserStatus: (userId: string) => UserStatus | undefined;
  setUserStatus: (userId: string, status: UserStatus) => void;
  setMultipleStatuses: (
    statuses: Array<{ userId: string; status: UserStatus }>,
  ) => void;
}

const UserStatusContext = createContext<UserStatusContextType | undefined>(
  undefined,
);

export function UserStatusProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [userStatuses, setUserStatuses] = useState<UserStatusMap>({});

  // Global subscription - subscribe to all users we've seen
  const userIds = useMemo(() => Object.keys(userStatuses), [userStatuses]);

  trpc.user.onStatusUpdate.useSubscription(
    { userIds },
    {
      enabled: userIds.length > 0,
      onData: (data) => {
        console.log("🌐 Global status update:", data.userId, "→", data.status);
        setUserStatuses((prev) => ({
          ...prev,
          [data.userId]: data.status as UserStatus,
        }));
      },
      onError: (err) => {
        console.error("❌ Global status subscription error:", err);
      },
    },
  );

  const getUserStatus = useCallback(
    (userId: string) => userStatuses[userId],
    [userStatuses],
  );

  const setUserStatus = useCallback((userId: string, status: UserStatus) => {
    setUserStatuses((prev) => ({
      ...prev,
      [userId]: status,
    }));
  }, []);

  const setMultipleStatuses = useCallback(
    (statuses: Array<{ userId: string; status: UserStatus }>) => {
      setUserStatuses((prev) => {
        const updated = { ...prev };
        statuses.forEach(({ userId, status }) => {
          updated[userId] = status;
        });
        return updated;
      });
    },
    [],
  );

  const contextValue = useMemo(
    () => ({
      getUserStatus,
      setUserStatus,
      setMultipleStatuses,
    }),
    [getUserStatus, setUserStatus, setMultipleStatuses],
  );

  return (
    <UserStatusContext.Provider value={contextValue}>
      {children}
    </UserStatusContext.Provider>
  );
}

export function useUserStatus() {
  const context = useContext(UserStatusContext);
  if (!context) {
    throw new Error("useUserStatus must be used within UserStatusProvider");
  }
  return context;
}
