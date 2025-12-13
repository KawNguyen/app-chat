import { Button } from "@/components/ui/button";
import { GoogleIcon } from "../icons";
import { signIn } from "@/lib/auth-client";

export default function OAuthButtons() {
  const handleGoogleSignIn = async () => {
    await signIn.social({
      provider: "google",
      callbackURL: "/",
    });
  };

  return (
    <div className="grid grid-cols-2 gap-4">
      <Button
        type="button"
        onClick={handleGoogleSignIn}
        className=" bg-white/10 border border-cyan-500/30 text-white hover:bg-white/20 hover:border-cyan-400/50 font-medium h-11 rounded-lg transition-all group"
      >
        <GoogleIcon />
      </Button>
    </div>
  );
}
