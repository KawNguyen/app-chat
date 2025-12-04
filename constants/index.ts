import { Hash, Volume2, Megaphone } from "lucide-react";

// User Status theo Prisma schema
export type UserStatus = "ONLINE" | "IDLE" | "DND" | "INVISIBLE" | "OFFLINE";

// Member interface theo Prisma schema
export interface ServerMember {
  id: string;
  userId: string;
  serverId: string;
  nickname?: string;
  user: {
    id: string;
    name: string;
    username?: string;
    image?: string;
    status: UserStatus;
  };
  roles: {
    id: string;
    name: string;
    color?: string;
    position: number;
  }[];
}

// Mock data members cho server
export const serverMembers: ServerMember[] = [
  {
    id: "member1",
    userId: "user1",
    serverId: "1",
    nickname: "Alice Admin",
    user: {
      id: "user1",
      name: "Alice",
      username: "alice",
      image: undefined,
      status: "ONLINE",
    },
    roles: [{ id: "role1", name: "Admin", color: "#f59e0b", position: 10 }],
  },
  {
    id: "member2",
    userId: "user2",
    serverId: "1",
    user: {
      id: "user2",
      name: "Bob",
      username: "bob",
      status: "ONLINE",
    },
    roles: [{ id: "role2", name: "Moderator", color: "#8b5cf6", position: 5 }],
  },
  {
    id: "member3",
    userId: "user3",
    serverId: "1",
    user: {
      id: "user3",
      name: "Charlie",
      username: "charlie",
      status: "ONLINE",
    },
    roles: [],
  },
  {
    id: "member4",
    userId: "user4",
    serverId: "1",
    user: {
      id: "user4",
      name: "David",
      username: "david",
      status: "IDLE",
    },
    roles: [],
  },
  {
    id: "member5",
    userId: "user5",
    serverId: "1",
    user: {
      id: "user5",
      name: "Emma",
      username: "emma",
      status: "IDLE",
    },
    roles: [],
  },
  {
    id: "member6",
    userId: "user6",
    serverId: "1",
    user: {
      id: "user6",
      name: "Felix",
      username: "felix",
      status: "DND",
    },
    roles: [],
  },
  {
    id: "member7",
    userId: "user7",
    serverId: "1",
    user: {
      id: "user7",
      name: "Grace",
      username: "grace",
      status: "OFFLINE",
    },
    roles: [],
  },
  {
    id: "member8",
    userId: "user8",
    serverId: "1",
    user: {
      id: "user8",
      name: "Henry",
      username: "henry",
      status: "OFFLINE",
    },
    roles: [],
  },
];

export const servers = [
  {
    id: "1",
    name: "Khoa Đình",
    image: null,
    initial: "K",
    categories: [
      {
        id: "cat1",
        name: "Sự Kiện",
        channels: [{ id: "1", type: "text", name: "event", icon: Megaphone }],
      },
      {
        id: "cat2",
        name: "Kênh Chat",
        channels: [
          { id: "2", type: "text", name: "nhắn-tin", icon: Hash },
          { id: "3", type: "text", name: "âm-nhạc", icon: Hash },
        ],
      },
      {
        id: "cat3",
        name: "Voice",
        channels: [
          { id: "4", type: "voice", name: "Ngủ", icon: Volume2 },
          { id: "5", type: "voice", name: "pm", icon: Volume2 },
        ],
      },
      {
        id: "cat4",
        name: "Webbing",
        channels: [
          { id: "6", type: "voice", name: "Web Classroom 1", icon: Volume2 },
          { id: "7", type: "voice", name: "Web Classroom 2", icon: Volume2 },
        ],
      },
    ],
  },
];

// Message interface theo Prisma schema
export interface ChannelMessage {
  id: string;
  content: string;
  channelId: string;
  memberId: string;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
  isEdited: boolean;
  member: {
    id: string;
    userId: string;
    nickname?: string;
    user: {
      id: string;
      name: string;
      username?: string;
      image?: string;
    };
    roles: {
      id: string;
      name: string;
      color?: string;
      position: number;
    }[];
  };
  attachments?: {
    id: string;
    name: string;
    url: string;
    type: string;
  }[];
}

// Hàm helper để tạo avatar gradient từ user id
const getAvatarGradient = (userId: string) => {
  const gradients = [
    "bg-gradient-to-br from-orange-400 to-red-500",
    "bg-gradient-to-br from-purple-400 to-indigo-500",
    "bg-gradient-to-br from-blue-400 to-cyan-500",
    "bg-gradient-to-br from-green-400 to-emerald-500",
    "bg-gradient-to-br from-pink-400 to-rose-500",
    "bg-gradient-to-br from-yellow-400 to-amber-500",
    "bg-gradient-to-br from-teal-400 to-cyan-500",
  ];
  const index = parseInt(userId.slice(-1)) % gradients.length;
  return gradients[index];
};

export const messages: ChannelMessage[] = [
  {
    id: "msg1",
    content: "Hey mọi người, hôm nay làm gì đó?",
    channelId: "2",
    memberId: "member1",
    userId: "user1",
    createdAt: new Date("2025-12-04T10:01:00Z"),
    updatedAt: new Date("2025-12-04T10:01:00Z"),
    isEdited: false,
    member: {
      id: "member1",
      userId: "user1",
      nickname: "Alice Admin",
      user: {
        id: "user1",
        name: "Alice",
        username: "alice",
      },
      roles: [{ id: "role1", name: "Admin", color: "#f59e0b", position: 10 }],
    },
  },
  {
    id: "msg2",
    content: "Tớ đang code cái giao diện mới, hơi mệt 😪",
    channelId: "2",
    memberId: "member2",
    userId: "user2",
    createdAt: new Date("2025-12-04T10:02:30Z"),
    updatedAt: new Date("2025-12-04T10:02:30Z"),
    isEdited: false,
    member: {
      id: "member2",
      userId: "user2",
      user: {
        id: "user2",
        name: "Bob",
        username: "bob",
      },
      roles: [
        { id: "role2", name: "Moderator", color: "#8b5cf6", position: 5 },
      ],
    },
  },
  {
    id: "msg4",
    content: "Tớ có thử rồi, component đẹp phết 😎",
    channelId: "2",
    memberId: "member1",
    userId: "user1",
    createdAt: new Date("2025-12-04T10:05:20Z"),
    updatedAt: new Date("2025-12-04T10:05:20Z"),
    isEdited: false,
    member: {
      id: "member1",
      userId: "user1",
      nickname: "Alice Admin",
      user: {
        id: "user1",
        name: "Alice",
        username: "alice",
      },
      roles: [{ id: "role1", name: "Admin", color: "#f59e0b", position: 10 }],
    },
  },
  {
    id: "msg5",
    content: "Hôm qua tui làm lỗi overflow-x 🥲",
    channelId: "2",
    memberId: "member2",
    userId: "user2",
    createdAt: new Date("2025-12-04T10:06:00Z"),
    updatedAt: new Date("2025-12-04T10:06:00Z"),
    isEdited: false,
    member: {
      id: "member2",
      userId: "user2",
      user: {
        id: "user2",
        name: "Bob",
        username: "bob",
      },
      roles: [
        { id: "role2", name: "Moderator", color: "#8b5cf6", position: 5 },
      ],
    },
  },
  {
    id: "msg6",
    content: "Gửi code xem nào để tớ coi giúp 👀",
    channelId: "2",
    memberId: "member3",
    userId: "user3",
    createdAt: new Date("2025-12-04T10:07:30Z"),
    updatedAt: new Date("2025-12-04T10:07:30Z"),
    isEdited: false,
    member: {
      id: "member3",
      userId: "user3",
      user: {
        id: "user3",
        name: "Charlie",
        username: "charlie",
      },
      roles: [],
    },
  },
  {
    id: "msg7",
    content: "À đây, tui gửi cái screenshot",
    channelId: "2",
    memberId: "member1",
    userId: "user1",
    createdAt: new Date("2025-12-04T10:08:40Z"),
    updatedAt: new Date("2025-12-04T10:08:40Z"),
    isEdited: false,
    member: {
      id: "member1",
      userId: "user1",
      nickname: "Alice Admin",
      user: {
        id: "user1",
        name: "Alice",
        username: "alice",
      },
      roles: [{ id: "role1", name: "Admin", color: "#f59e0b", position: 10 }],
    },
    attachments: [
      {
        id: "att1",
        name: "screenshot-1.png",
        url: "/images/screenshot-1.png",
        type: "image/png",
      },
    ],
  },
  {
    id: "msg8",
    content: "Ủa sao cái div ở trong lại để flex-row nhỉ 😂",
    channelId: "2",
    memberId: "member2",
    userId: "user2",
    createdAt: new Date("2025-12-04T10:09:55Z"),
    updatedAt: new Date("2025-12-04T10:09:55Z"),
    isEdited: false,
    member: {
      id: "member2",
      userId: "user2",
      user: {
        id: "user2",
        name: "Bob",
        username: "bob",
      },
      roles: [
        { id: "role2", name: "Moderator", color: "#8b5cf6", position: 5 },
      ],
    },
  },
];

export { getAvatarGradient };
