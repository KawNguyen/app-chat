import { Hash, Volume2, Megaphone } from "lucide-react";

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
