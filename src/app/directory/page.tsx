"use client";

import { useState, useEffect } from "react";
import { 
  Terminal, 
  Cpu, 
  MessageSquare, 
  ExternalLink, 
  Code2, 
  Plus,
  RefreshCcw,
  Bot,
  Zap,
  ShieldAlert,
  Globe,
  Activity,
  Ghost,
  Music,
  Gamepad2,
  Hammer,
  Eye,
  Star,
  Heart,
  Smile,
  Server,
  Database
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const ICON_MAP: Record<string, any> = {
  Cpu, Bot, Terminal, Zap, ShieldAlert, Globe, Activity, Code2, Ghost, Music, Gamepad2, Hammer, Eye, Star, Heart, Smile, Server, Database
};
import Link from "next/link";
import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";

interface Bot {
  id: string;
  name: string;
  version: string;
  description: string;
  status: string;
  tags: string[];
  color: string;
  icon: string;
  invite_url: string;
  server_count?: number;
  user_count?: number;
  ping?: number;
  command_count?: number;
}

export default function Directory() {
  const [bots, setBots] = useState<Bot[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchBots = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/bots", { cache: 'no-store' });
      const data = await res.json();
      if (Array.isArray(data)) {
        setBots(data);
      }
    } catch (err) {
      console.error("Failed to fetch bots:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchBots();
  }, []);

  const getStatusColor = (status: string) => {
    switch (status.toUpperCase()) {
      case 'ONLINE': return 'bg-emerald-500';
      case 'MAINTENANCE': return 'bg-amber-500';
      case 'IDLE': return 'bg-blue-500';
      case 'DND': return 'bg-red-500';
      default: return 'bg-zinc-500';
    }
  };

  return (
    <div className="min-h-screen bg-background selection:bg-primary/30">
      <Navbar />

      <main className="max-w-7xl mx-auto px-6 py-12 lg:py-24">
        {/* Bot Grid */}
        <section id="directory" className="space-y-12">
          <div className="flex items-end justify-between border-b border-white/5 pb-4">
            <div>
              <h2 className="text-2xl font-bold tracking-tight uppercase">Bot_Directory</h2>
              <p className="text-sm text-muted-foreground italic mt-1">// Real-time status of all ecosystem agents</p>
            </div>
            <div className="flex gap-4">
              <button 
                onClick={fetchBots}
                className="text-[10px] font-mono text-muted-foreground hover:text-primary flex items-center gap-1 transition-colors"
              >
                <RefreshCcw className={`w-3 h-3 ${isLoading ? 'animate-spin' : ''}`} />
                REFRESH_STATUS
              </button>
              <button 
                onClick={() => {
                  const el = document.getElementById('directory-grid');
                  el?.scrollIntoView({ behavior: 'smooth' });
                }}
                className="text-xs text-primary hover:underline flex items-center gap-1 active:scale-95 transition-transform"
              >
                VIEW_ALL <ExternalLink className="w-3 h-3" />
              </button>
            </div>
          </div>

          <div id="directory-grid" className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 min-h-[400px]">
            {isLoading ? (
              Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="bg-white/[0.02] border border-white/5 rounded-sm p-6 h-[320px] animate-pulse">
                  <div className="w-12 h-12 bg-white/5 rounded-sm mb-6" />
                  <div className="w-2/3 h-6 bg-white/5 rounded-sm mb-4" />
                  <div className="w-full h-20 bg-white/5 rounded-sm mb-6" />
                  <div className="flex gap-2 mb-6">
                    <div className="w-12 h-4 bg-white/5 rounded-full" />
                    <div className="w-12 h-4 bg-white/5 rounded-full" />
                  </div>
                  <div className="w-full h-8 bg-white/5 rounded-sm" />
                </div>
              ))
            ) : bots.length === 0 ? (
              <div className="col-span-full py-20 text-center space-y-4">
                <div className="text-muted-foreground font-mono text-sm opacity-50 uppercase tracking-widest">// NO_AGENTS_DETECTED_IN_DATABASE</div>
                <p className="text-xs text-muted-foreground">Add some bots through the admin panel to see them here.</p>
              </div>
            ) : (
              bots.map((bot, i) => (
                <motion.div 
                  key={bot.id} 
                  initial={{ y: 10, opacity: 0 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.03, duration: 0.2 }}
                  className="group relative bg-white/[0.02] border border-white/5 rounded-sm p-6 hover:bg-white/[0.04] transition-all hover:border-primary/50 flex flex-col"
                >
                  <div className="flex justify-between items-start mb-6">
                    <div className={`p-3 rounded-sm bg-black border border-white/10 group-hover:border-primary/50 transition-colors ${bot.color || 'text-primary'}`}>
                      {(() => {
                        const IconComp = ICON_MAP[bot.icon || 'Cpu'] || Cpu;
                        return <IconComp className="w-6 h-6" />;
                      })()}
                    </div>
                    <span className="text-[10px] font-mono opacity-40">{bot.version || 'v1.0.0'}</span>
                  </div>
                  <h3 className="text-xl font-bold mb-2 group-hover:text-primary transition-colors">{bot.name}</h3>
                  
                  {bot.server_count !== undefined && bot.server_count > 0 && (
                    <div className="flex flex-wrap items-center gap-3 mb-4 font-mono">
                      <div className="flex items-center gap-1.5 px-2 py-0.5 bg-white/5 border border-white/10 rounded-sm">
                        <Server className="w-3 h-3 text-primary" />
                        <span className="text-[10px] font-bold uppercase">{bot.server_count} SERVERS</span>
                      </div>
                      {bot.command_count !== undefined && bot.command_count > 0 && (
                        <div className="flex items-center gap-1.5 px-2 py-0.5 bg-white/5 border border-white/10 rounded-sm">
                          <Terminal className="w-3 h-3 text-emerald-400" />
                          <span className="text-[10px] font-bold uppercase">{bot.command_count} CMDS</span>
                        </div>
                      )}
                      {bot.ping !== undefined && bot.ping > 0 && (
                        <div className="flex items-center gap-1.5 px-2 py-0.5 bg-white/5 border border-white/10 rounded-sm">
                          <Activity className="w-3 h-3 text-amber-400" />
                          <span className="text-[10px] font-bold uppercase">{bot.ping}MS</span>
                        </div>
                      )}
                    </div>
                  )}

                  <p className="text-sm text-muted-foreground leading-relaxed mb-6 h-20 line-clamp-4 flex-grow">
                    {bot.description || "No description provided for this agent."}
                  </p>
                  <div className="flex flex-wrap gap-2 mb-6">
                    {bot.tags && bot.tags.length > 0 ? bot.tags.map((tag, j) => (
                      <span key={j} className="text-[9px] px-2 py-0.5 rounded-full border border-white/10 bg-white/5 opacity-60">
                        {tag}
                      </span>
                    )) : (
                      <span className="text-[9px] px-2 py-0.5 rounded-full border border-white/10 bg-white/5 opacity-30 italic">
                        No_Tags
                      </span>
                    )}
                  </div>
                    <div className="flex items-center justify-between pt-4 border-t border-white/5">
                      <div className="flex items-center gap-2">
                        <div className={`w-1.5 h-1.5 rounded-full ${getStatusColor(bot.status)} ${bot.status.toUpperCase() === 'ONLINE' ? 'animate-pulse' : ''}`} />
                        <span className="text-[10px] font-mono uppercase tracking-widest opacity-60">{bot.status}</span>
                      </div>
                      {bot.status.toUpperCase() !== 'OFFLINE' && bot.invite_url ? (
                        <button 
                          onClick={() => window.parent.postMessage({ type: "OPEN_EXTERNAL_URL", data: { url: bot.invite_url } }, "*")}
                          className="flex items-center gap-1.5 px-3 py-1 bg-primary/10 border border-primary/30 text-primary text-[10px] font-bold rounded-sm hover:bg-primary hover:text-primary-foreground transition-all active:scale-95 uppercase"
                        >
                          <Plus className="w-3 h-3" />
                          ADD_SERVER
                        </button>
                      ) : (
                        <div className="text-[10px] font-mono opacity-20 uppercase tracking-tighter">
                          {bot.status.toUpperCase() === 'OFFLINE' ? 'BOT_OFFLINE' : 'NO_INVITE_LINK'}
                        </div>
                      )}
                    </div>

                </motion.div>
              ))
            )}
          </div>
        </section>

        {/* Footer Stats */}
        <section className="mt-24 py-12 border-y border-white/5 bg-white/[0.01] flex justify-center">
          {[
            { label: "TOTAL_BOTS_", val: bots.length.toString() }
          ].map((stat, i) => (
            <div key={i} className="text-center space-y-1">
              <div className="text-2xl font-bold font-mono tracking-tighter">{stat.val}</div>
              <div className="text-[10px] text-muted-foreground font-mono uppercase tracking-widest">{stat.label}</div>
            </div>
          ))}
        </section>
      </main>

      <Footer />
    </div>
  );
}
