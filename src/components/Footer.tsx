import Link from "next/link";

export default function Footer() {
  return (
    <footer className="max-w-7xl mx-auto px-6 py-12 flex flex-col md:flex-row justify-between items-center gap-6 opacity-40 text-[10px] font-mono uppercase tracking-[0.2em]">
      <div className="space-y-1">
        <div>© 2026 ARCH_BOTS_MAINFRAME // ALL_RIGHTS_RESERVED</div>
        <div className="text-[8px] opacity-60">made by onlydex.</div>
      </div>
      <div className="flex gap-8">
        <Link href="/terms" className="hover:text-primary transition-colors">TERM_OF_USE</Link>
        <Link href="/privacy" className="hover:text-primary transition-colors">PRIVACY_POLICY</Link>
        <Link href="/status" className="hover:text-primary transition-colors">SYSTEM_STATUS</Link>
      </div>
    </footer>
  );
}
