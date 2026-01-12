"use client";

import { Terminal, Zap, Code2, Bot } from "lucide-react";
import Link from "next/link";
import { useState, useEffect } from "react";
import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";

export default function Home() {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const hasLoaded = sessionStorage.getItem("terminal_loaded");
    if (hasLoaded) {
      setProgress(100);
      return;
    }

    const timer = setTimeout(() => {
      const interval = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 100) {
            clearInterval(interval);
            sessionStorage.setItem("terminal_loaded", "true");
            return 100;
          }
          const increment = Math.random() * 3 + 1;
          return Math.min(prev + increment, 100);
        });
      }, 60);
      return () => clearInterval(interval);
    }, 1500);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="min-h-screen bg-background selection:bg-primary/30">
      <Navbar />

      <main className="max-w-7xl mx-auto px-6 py-12 lg:py-24">
        {/* Hero Section */}
        <section className="grid lg:grid-cols-2 gap-12 items-center mb-24">
          <div className="space-y-8">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-primary/20 bg-primary/5 text-primary text-[10px] font-bold tracking-[0.2em] uppercase">
              <Zap className="w-3 h-3 fill-primary" />
              Build the future of discord
            </div>
            <h1 className="text-5xl lg:text-7xl font-bold tracking-tighter leading-none">
              Deploy <span className="text-primary italic">next-gen</span> <br />
              Discord Agents.
            </h1>
            <p className="text-muted-foreground text-lg max-w-lg leading-relaxed">
              Access a curated repository of high-performance bots. Fully documented, 
              scalable, and designed for modern communities.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link href="/directory" className="px-8 py-3 bg-primary text-primary-foreground font-bold rounded-sm hover:scale-[1.02] active:scale-95 transition-transform flex items-center gap-2">
                <Bot className="w-5 h-5" />
                GET_STARTED
              </Link>
              <a href="#logs" className="px-8 py-3 border border-white/10 hover:bg-white/5 font-bold rounded-sm active:scale-95 transition-all">
                READ_THE_LOGS
              </a>
            </div>
          </div>

          {/* Terminal UI */}
          <div id="logs" className="relative group scroll-mt-24">
            <div className="absolute -inset-1 bg-gradient-to-r from-primary to-accent opacity-20 blur group-hover:opacity-40 transition-opacity"></div>
            <div className="relative bg-black rounded-lg border border-white/10 overflow-hidden shadow-2xl">
                <div className="flex items-center gap-2 px-4 py-3 border-b border-white/5 bg-white/5">
                <div className="w-3 h-3 rounded-full bg-red-500/50" />
                <div className="w-3 h-3 rounded-full bg-yellow-500/50" />
                <div className="w-3 h-3 rounded-full bg-green-500/50" />
                <div className="ml-4 text-[10px] opacity-40 font-mono">root@arch-bots:~</div>
              </div>
              <div className="p-6 font-mono text-sm space-y-2">
                <div className="flex gap-2">
                  <span className="text-green-400">➜</span>
                  <span className="text-blue-400">~</span>
                  <span className="text-white">arch-bots-cli deploy --bot astra-core</span>
                </div>
                <div className="text-muted-foreground italic">Fetching manifest... Done</div>
                <div className="text-muted-foreground italic">Authenticating with Discord API... Done</div>
                <div className="text-muted-foreground italic">Spinning up containers (US-EAST-1)...</div>
                <div className="flex items-center gap-4 py-2">
                  <div className="h-1 flex-1 bg-white/10 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-primary transition-all duration-300 ease-out" 
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                  <span className="text-[10px] text-primary w-8">{Math.floor(progress)}%</span>
                </div>
                {progress === 100 && (
                  <div className="text-emerald-400 flex items-center gap-2 animate-in fade-in slide-in-from-top-1">
                    <Zap className="w-3 h-3 fill-emerald-400" />SUCCESS: AstraCore v4.2.0 deployed to 1 servers.
                  </div>
                )}
                <div className="flex gap-2 pt-4">
                  <span className="text-green-400">➜</span>
                  <span className="text-blue-400">~</span>
                  <span className="text-white animate-pulse">_</span>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
