export type TabType = "online" | "all" | "pending" | "blocked";

export interface Friend {
  id: string;
  userName: string | null;
  displayName: string | null;
  image: string | null;
  status: string;
  customStatus?: string | null;
}

export interface PendingRequest {
  id: string;
  sender: {
    id: string;
    userName: string | null;
    displayName: string | null;
    image: string | null;
  };
  createdAt: Date;
}
