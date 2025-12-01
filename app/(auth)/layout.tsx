import { Zap } from "lucide-react";

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen animated-gradient-bg flex items-center justify-center p-4 overflow-hidden relative">
      {/* <div className="absolute top-0 left-0 w-96 h-96 bg-cyan-600/20 rounded-full filter blur-3xl -translate-x-1/2 -translate-y-1/2 animate-pulse"></div>
      <div
        className="absolute bottom-0 right-0 w-96 h-96 bg-emerald-600/20 rounded-full filter blur-3xl translate-x-1/2 translate-y-1/2 animate-pulse"
        style={{ animationDelay: "1s" }}
      ></div>
      <div
        className="absolute top-1/2 left-1/4 w-72 h-72 bg-teal-600/10 rounded-full filter blur-3xl animate-pulse"
        style={{ animationDelay: "0.5s" }}
      ></div> */}

      <div className="w-full max-w-md z-10 relative">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-linear-to-br from-cyan-500 to-emerald-500 mb-6 glow-primary shadow-2xl relative">
            <Zap className="w-8 h-8 text-white" />
            <div className="absolute inset-0 rounded-full bg-linear-to-br from-cyan-400 to-emerald-400 opacity-0 group-hover:opacity-20 transition-opacity"></div>
          </div>
          <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-linear-to-br from-cyan-400 via-emerald-400 to-cyan-500 mb-2 tracking-tight">
            Neon Chat
          </h1>
        </div>

        {children}

        {/* <p className="text-center text-xs text-purple-300/40 font-medium mt-6">
          ✦ Secured by Neon • Encrypted • Elite Access ✦
        </p> */}
      </div>
    </div>
  );
}
