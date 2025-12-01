"use client";

import { useState } from "react";
import { useForm } from "@tanstack/react-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Mail, Lock, Eye, EyeOff } from "lucide-react";
import OAuthButtons from "./oauth-buttons";
import { signIn } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import Link from "next/link";

export default function LoginForm() {
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();

  const form = useForm({
    defaultValues: {
      email: "",
      password: "",
    },
    onSubmit: async ({ value }) => {
      try {
        const result = await signIn.email({
          email: value.email,
          password: value.password,
        });

        if (result.error) {
          toast.error(result.error.message || "Login failed");
          return;
        }

        toast.success("Welcome back!");
        router.push("/");
        router.refresh();
      } catch {
        toast.error("An error occurred during login");
      }
    },
  });

  return (
    <div className="glass-effect rounded-2xl p-8 shadow-2xl mb-6 neon-border">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          form.handleSubmit();
        }}
        className="space-y-6"
      >
        {/* Email Field */}
        <form.Field name="email">
          {(field) => (
            <div className="space-y-3 animate-fade-in">
              <label
                htmlFor="email"
                className="block text-sm font-semibold text-cyan-200"
              >
                Email Address
              </label>
              <div className="relative group">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-cyan-400/60 group-focus-within:text-cyan-400 transition-colors" />
                <Input
                  id="email"
                  type="email"
                  placeholder="you@neon.realm"
                  value={field.state.value}
                  onChange={(e) => field.handleChange(e.target.value)}
                  onBlur={field.handleBlur}
                  className="pl-12 bg-cyan-950/30 border border-cyan-600/30 hover:border-cyan-500/50 focus:border-cyan-500 focus:shadow-[0_0_10px_rgba(6,182,212,0.3)] transition-all text-white placeholder:text-cyan-300/30 h-11 rounded-lg"
                />
              </div>
              {field.state.meta.errors && (
                <p className="text-xs text-pink-400">
                  {field.state.meta.errors.join(", ")}
                </p>
              )}
            </div>
          )}
        </form.Field>

        {/* Password Field */}
        <form.Field name="password">
          {(field) => (
            <div className="space-y-3 animate-fade-in">
              <div className="flex items-center justify-between">
                <label
                  htmlFor="password"
                  className="block text-sm font-semibold text-cyan-200"
                >
                  Password
                </label>
                <div className="flex items-center justify-end animate-fade-in">
                  <button
                    type="button"
                    className="text-sm text-cyan-400/80 hover:text-cyan-300 transition-colors font-medium"
                  >
                    Forgot your password?
                  </button>
                </div>
              </div>
              <div className="relative group">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-cyan-400/60 group-focus-within:text-cyan-400 transition-colors" />
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={field.state.value}
                  onChange={(e) => field.handleChange(e.target.value)}
                  onBlur={field.handleBlur}
                  className="pl-12 pr-12 bg-cyan-950/30 border border-cyan-600/30 hover:border-cyan-500/50 focus:border-cyan-500 focus:shadow-[0_0_10px_rgba(6,182,212,0.3)] transition-all text-white placeholder:text-cyan-300/30 h-11 rounded-lg"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-cyan-300/50 hover:text-cyan-400 transition-colors"
                >
                  {showPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>
              {field.state.meta.errors && (
                <p className="text-xs text-pink-400">
                  {field.state.meta.errors.join(", ")}
                </p>
              )}
            </div>
          )}
        </form.Field>

        <form.Subscribe
          selector={(state) => [state.canSubmit, state.isSubmitting]}
        >
          {([canSubmit, isSubmitting]) => (
            <Button
              type="submit"
              disabled={!canSubmit || isSubmitting}
              className="w-full bg-linear-to-r from-cyan-600 to-emerald-600 text-white hover:from-cyan-500 hover:to-emerald-500 font-semibold h-11 rounded-lg transition-all glow-primary mt-8"
              size="lg"
            >
              {isSubmitting ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-transparent border-t-white rounded-full animate-spin"></div>
                  Signing in...
                </div>
              ) : (
                "Enter Realm"
              )}
            </Button>
          )}
        </form.Subscribe>
      </form>

      <div className="flex items-center gap-3 my-6">
        <div className="flex-1 h-px bg-cyan-600/30"></div>
        <span className="text-xs text-cyan-300/50 font-medium uppercase tracking-wide">
          or
        </span>
        <div className="flex-1 h-px bg-cyan-600/30"></div>
      </div>

      <OAuthButtons />

      <div className="flex items-center gap-3 my-6">
        <div className="flex-1 h-px bg-cyan-600/30"></div>
      </div>

      <div className="text-center text-sm text-cyan-200/60">
        Don&apos;t have an account?{" "}
        <Link
          href="/sign-up"
          className="text-transparent bg-clip-text bg-linear-to-r from-cyan-400 to-emerald-400 hover:from-cyan-300 hover:to-emerald-300 font-semibold transition-all"
        >
          Create one
        </Link>
      </div>
    </div>
  );
}
