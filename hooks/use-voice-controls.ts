import { playSound } from "@/lib/sound-effect";
import { useState } from "react";

export function useVoiceControls() {
  const [isMuted, setIsMuted] = useState(false);
  const [isDeafened, setIsDeafened] = useState(false);
  const [previousMute, setPreviousMute] = useState(false);

  const toggleMute = () => {
    // If deafened → un-deafen first
    if (isDeafened) {
      setIsDeafened(false);
      setIsMuted(previousMute);

      // deafen OFF sound
      playSound("/sounds/deafen.mp3");
      return;
    }

    if (isMuted) {
      playSound("/sounds/unmute.mp3");
    } else {
      playSound("/sounds/mute.mp3");
    }

    setIsMuted((prev) => !prev);
  };

  const toggleDeafen = () => {
    if (!isDeafened) {
      // turning ON deafen
      setPreviousMute(isMuted);
      setIsMuted(true);

      playSound("/sounds/undeafen.mp3");
      setIsDeafened(true);
    } else {
      // turning OFF deafen
      playSound("/sounds/deafen.mp3");
      setIsDeafened(false);
      setIsMuted(previousMute);
    }
  };

  return {
    isMuted,
    isDeafened,
    toggleMute,
    toggleDeafen,
  };
}
