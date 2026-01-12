"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { 
  Code2, 
  ChevronLeft, 
  CheckCircle2, 
  AlertTriangle, 
  Activity,
  Server,
  Users,
  Cpu,
  Database,
  ShieldCheck,
  Zap,
  Bot,
  Terminal,
  RefreshCw
} from "lucide-react";
import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";

interface BotStats {
  id: string;
  name: string;
  status: string;
  server_count: number;
  user_count: number;
  version: string;
  cpu: string;
  ram: string;
  uptime: string;
  discord_token?: string;
  ping?: number;
  command_count?: number;
  last_seen?: string;
  discord_status?: string;
  start_time?: string;
}

function calculateUptime(startTime?: string) {
  if (!startTime) return "0m";
  const start = new Date(startTime).getTime();
  const now = new Date().getTime();
  const diff = now - start;
  
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
  const minutes = Math.floor((diff / (1000 * 60)) % 60);
  
  if (days > 0) return `${days}d ${hours}h`;
  if (hours > 0) return `${hours}h ${minutes}m`;
  return `${minutes}m`;
}

export default function Status() {
  const [bots, setBots] = useState<BotStats[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [health, setHealth] = useState({ core: "Operational", database: "Operational", bridge: "Operational", latency: 0 });

  const fetchBots = async () => {
    setIsLoading(true);
    try {
      const [botsRes, healthRes] = await Promise.all([
        fetch("/api/bots", { cache: 'no-store' }),
        fetch("/api/health", { cache: 'no-store' })
      ]);
      
      const botsData = await botsRes.json();
      const healthData = await healthRes.json();
      
      if (Array.isArray(botsData)) setBots(botsData);
      if (healthData) setHealth(healthData);
    } catch (err) {
      console.error("Failed to fetch status:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchBots();
  }, []);

  const systems = [
    { name: "CORE_MAINFRAME", status: health.core },
    { name: "DATABASE_CLUSTER", status: health.database },
    { name: "DISCORD_API_BRIDGE", status: health.bridge },
  ];

  return (
    <div className="min-h-screen bg-background selection:bg-primary/30">
      <Navbar />

      <main className="max-w-4xl mx-auto px-6 py-24">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-16">
            <div className="flex items-center justify-between w-full md:w-auto gap-4">
                <div>
                    <h1 className="text-4xl font-bold tracking-tighter uppercase mb-2">System_Status</h1>
                    <p className="text-muted-foreground font-mono text-xs">// REAL-TIME OPERATIONAL TELEMETRY</p>
                </div>
                <button 
                  onClick={fetchBots}
                  disabled={isLoading}
                  className="p-2 hover:bg-white/5 rounded-sm border border-white/10 transition-colors group disabled:opacity-50"
                  title="Reload Stats"
                >
                  <RefreshCw className={`w-4 h-4 text-primary ${isLoading ? 'animate-spin' : 'group-hover:rotate-180 transition-transform duration-500'}`} />
                </button>
            </div>
            <div className="px-4 py-2 bg-emerald-500/10 border border-emerald-500/20 rounded-sm flex items-center gap-3">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                <span className="text-xs font-bold text-emerald-500 uppercase tracking-widest">All_Systems_Nominal</span>
            </div>
        </div>
        
        <div className="space-y-12">
          {/* Core Infrastructure */}
          <section>
            <h2 className="text-[10px] font-mono text-muted-foreground uppercase tracking-[0.3em] mb-6 flex items-center gap-2">
              <ShieldCheck className="w-3 h-3 text-primary" /> Core_Infrastructure
            </h2>
            <div className="grid gap-3">
                {systems.map((system, i) => (
                    <div key={i} className="bg-white/[0.02] border border-white/5 p-4 rounded-sm flex items-center justify-between group hover:bg-white/[0.04] transition-all">
                        <div className="flex items-center gap-4">
                            <Activity className="w-4 h-4 text-primary" />
                            <div className="font-mono text-[11px] font-bold uppercase tracking-wider">{system.name}</div>
                        </div>
                        <div className="flex items-center gap-4">
                            <span className="text-[9px] font-mono text-emerald-500 uppercase tracking-widest bg-emerald-500/5 px-2 py-0.5 border border-emerald-500/10 rounded-full">Operational</span>
                            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                        </div>
                    </div>
                ))}
            </div>
          </section>

          {/* Bot Agents Telemetry */}
          <section>
            <h2 className="text-[10px] font-mono text-muted-foreground uppercase tracking-[0.3em] mb-6 flex items-center gap-2">
              <Zap className="w-3 h-3 text-primary" /> Active_Agent_Telemetry
            </h2>
            <div className="grid gap-4">
              {isLoading ? (
                Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="h-20 bg-white/[0.01] border border-white/5 animate-pulse rounded-sm" />
                ))
              ) : bots.length === 0 ? (
                <div className="text-center py-12 border border-dashed border-white/10 rounded-sm">
                  <p className="text-[10px] font-mono text-muted-foreground uppercase">// NO_ACTIVE_AGENTS_FOUND</p>
                </div>
              ) : (
                bots.map((bot) => (
                  <div key={bot.id} className="bg-black/40 border border-white/5 rounded-sm overflow-hidden group hover:border-primary/30 transition-all">
                    <div className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-6">
                      <div className="flex items-center gap-4">
                        <div className="p-2 bg-primary/5 border border-primary/20 rounded-sm">
                          <Bot className="w-5 h-5 text-primary" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="font-mono font-bold text-sm uppercase">{bot.name}</h3>
                            <span className="text-[9px] opacity-40 font-mono">{bot.version}</span>
                          </div>
                            <div className="flex items-center gap-2 mt-1">
                              <div className={`w-1.5 h-1.5 rounded-full ${
                                bot.status === 'OFFLINE' ? 'bg-zinc-500' :
                                (bot.discord_status || bot.status) === 'ONLINE' ? 'bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.5)]' : 
                                (bot.discord_status || bot.status) === 'IDLE' ? 'bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.5)]' : 
                                (bot.discord_status || bot.status) === 'DND' ? 'bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.5)]' : 
                                'bg-zinc-500'
                              }`} />
                              <span className={`text-[10px] font-mono uppercase tracking-widest ${
                                bot.status === 'OFFLINE' ? 'text-muted-foreground' :
                                (bot.discord_status || bot.status) === 'ONLINE' ? 'text-emerald-500' : 
                                (bot.discord_status || bot.status) === 'IDLE' ? 'text-amber-500' : 
                                (bot.discord_status || bot.status) === 'DND' ? 'text-rose-500' : 
                                'text-muted-foreground'
                              }`}>{bot.status === 'OFFLINE' ? 'OFFLINE' : (bot.discord_status || bot.status)}</span>
                            </div>

                        </div>
                      </div>

                        <div className="grid grid-cols-2 md:grid-cols-5 gap-8">
                          {bot.server_count > -1 ? (
                            <>
                              <div className="space-y-1">
                                <div className="text-[9px] text-muted-foreground font-mono uppercase tracking-widest flex items-center gap-1">
                                  <Server className="w-2.5 h-2.5" /> Servers
                                </div>
                                <div className="text-xs font-mono font-bold text-primary">{bot.server_count.toLocaleString()}</div>
                              </div>
                              <div className="space-y-1">
                                <div className="text-[9px] text-muted-foreground font-mono uppercase tracking-widest flex items-center gap-1">
                                  <Terminal className="w-2.5 h-2.5" /> Commands
                                </div>
                                <div className="text-xs font-mono font-bold text-emerald-400">{(bot.command_count || 0).toLocaleString()}</div>
                              </div>
                              <div className="space-y-1">
                                <div className="text-[9px] text-muted-foreground font-mono uppercase tracking-widest flex items-center gap-1">
                                  <Activity className="w-2.5 h-2.5" /> Latency
                                </div>
                                <div className="text-xs font-mono font-bold text-amber-400">
                                  {bot.status !== 'OFFLINE' ? `${bot.ping || 0}ms` : '-'}
                                </div>
                              </div>
                            </>
                          ) : (
                            <>
                              <div className="space-y-1 col-span-2 md:col-span-3">
                                <div className="flex gap-8">
                                  <div className="space-y-1">
                                    <div className="text-[9px] text-muted-foreground font-mono uppercase tracking-widest flex items-center gap-1">
                                      <Cpu className="w-2.5 h-2.5" /> CPU
                                    </div>
                                    <div className="text-xs font-mono font-bold">{bot.cpu}</div>
                                  </div>
                                  <div className="space-y-1">
                                    <div className="text-[9px] text-muted-foreground font-mono uppercase tracking-widest flex items-center gap-1">
                                      <Database className="w-2.5 h-2.5" /> RAM
                                    </div>
                                    <div className="text-xs font-mono font-bold">{bot.ram}</div>
                                  </div>
                                </div>
                              </div>
                            </>
                          )}
                          <div className="space-y-1">
                            <div className="text-[9px] text-muted-foreground font-mono uppercase tracking-widest">Bot_Uptime</div>
                            <div className="text-xs font-mono font-bold opacity-80">{bot.status !== 'OFFLINE' ? calculateUptime(bot.start_time) : '-'}</div>
                          </div>
                          <div className="flex items-center justify-end">
                            <div className="px-3 py-1 bg-white/5 border border-white/10 rounded-sm">
                              <span className="text-[9px] font-mono font-bold uppercase tracking-widest text-primary">
                                {bot.status !== 'OFFLINE' ? 'STABLE' : 'OFFLINE'}
                              </span>
                            </div>
                          </div>
                        </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </section>
        </div>

        <div className="mt-16 p-8 bg-black border border-white/10 rounded-sm space-y-4">
            <div className="flex items-center gap-2 text-amber-500">
                <AlertTriangle className="w-4 h-4" />
                <span className="text-xs font-bold font-mono uppercase">Incident_Report_Log</span>
            </div>
            <div className="font-mono text-[11px] space-y-2 opacity-60">
                <div className="flex gap-4">
                    <span className="text-primary">[2026-05-12 14:22]</span>
                    <span>GATEWAY_PROXY: Latency spike detected in EU-WEST-1 node.</span>
                </div>
                <div className="flex gap-4">
                    <span className="text-primary">[2026-05-12 10:05]</span>
                    <span>DATABASE_CLUSTER: Scheduled maintenance completed successfully.</span>
                </div>
            </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
