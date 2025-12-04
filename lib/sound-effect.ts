export function playSound(src: string) {
  const audio = new Audio(src);
  audio.volume = 0.7; // giống Discord
  audio.play();
}
