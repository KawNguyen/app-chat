import { Button } from "@/components/ui/button";
import { GitHubIcon, GoogleIcon } from "../icons";
import { signIn } from "@/lib/auth-client";

export default function OAuthButtons() {
  const handleGoogleSignIn = async () => {
    await signIn.social({
      provider: "google",
      callbackURL: "/",
    });
  };

  const handleGithubSignIn = async () => {
    await signIn.social({
      provider: "github",
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

      <Button
        type="button"
        onClick={handleGithubSignIn}
        className="bg-white/10 border border-cyan-500/30 text-white hover:bg-white/20 hover:border-cyan-400/50 font-medium h-11 rounded-lg transition-all group"
      >
        <GitHubIcon />
      </Button>
    </div>
  );
}
