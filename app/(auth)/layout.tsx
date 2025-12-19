import { AudioWaveform } from "lucide-react";

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex w-screen h-screen flex-col items-center justify-center gap-6 p-6 md:p-10">
      <div className="flex items-center gap-2 self-center font-medium">
        <div className="bg-primary text-primary-foreground flex size-10 items-center justify-center rounded-full">
          <AudioWaveform className="size-7" />
        </div>
        ConTalk
      </div>

      {children}
    </div>
  );
}
