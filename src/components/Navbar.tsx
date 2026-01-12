"use client";

import { Terminal, Code2, ShieldAlert } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Navbar() {
  const pathname = usePathname();

  const isActive = (path: string) => {
    if (path === "/" && pathname === "/") return true;
    if (path !== "/" && pathname?.startsWith(path)) return true;
    return false;
  };

  return (
    <nav className="border-b border-white/10 bg-black/40 backdrop-blur-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 group">
          <Code2 className="w-6 h-6 text-primary group-hover:scale-110 transition-transform" />
          <span className="font-bold tracking-tighter text-xl uppercase">ArchBots</span>
        </Link>
        
        <div className="hidden md:flex items-center gap-8 text-sm opacity-70">
          <Link 
            href="/directory" 
            className={`transition-colors underline-offset-4 hover:underline hover:text-primary ${isActive('/directory') ? 'text-primary underline' : ''}`}
          >
            ./directory
          </Link>
          <Link 
            href="/status" 
            className={`transition-colors underline-offset-4 hover:underline hover:text-primary ${isActive('/status') ? 'text-primary underline' : ''}`}
          >
            ./status
          </Link>
        </div>

          <Link 
            href="/admin"
            className="px-4 py-1.5 bg-primary/10 border border-primary/30 text-primary text-xs font-bold rounded-sm hover:bg-primary/20 transition-all flex items-center gap-2 active:scale-95"
          >
            <ShieldAlert className="w-3 h-3" />
            ADMIN PANEL
          </Link>
      </div>
    </nav>
  );
}
