import { Circle, Moon, CircleMinus } from "lucide-react";
import { UserStatus } from "@/types";

export const statusConfig: Record<
  UserStatus,
  {
    label: string;
    description: string;
    color: string;
    text: string;
    icon: typeof Circle;
  }
> = {
  [UserStatus.ONLINE]: {
    label: "Online",
    description: "",
    color: "bg-green-500",
    text: "text-green-500",
    icon: Circle,
  },
  [UserStatus.IDLE]: {
    label: "Idle",
    description: "",
    color: "bg-amber-500",
    text: "text-amber-500",
    icon: Moon,
  },
  [UserStatus.DND]: {
    label: "Do Not Disturb",
    description: "You will not receive desktop notifications",
    color: "bg-red-500",
    text: "text-red-500",
    icon: CircleMinus,
  },
  [UserStatus.INVISIBLE]: {
    label: "Invisible",
    description: "You will appear offline",
    color: "bg-gray-400",
    text: "text-gray-400",
    icon: Circle,
  },
  [UserStatus.OFFLINE]: {
    label: "Offline",
    description: "",
    color: "bg-gray-500",
    text: "text-gray-500",
    icon: Circle,
  },
};
