import Link from "next/link";
import { Code2, ChevronLeft, ShieldCheck } from "lucide-react";
import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";

export default function Privacy() {
  return (
    <div className="min-h-screen bg-background selection:bg-primary/30">
      <Navbar />

      <main className="max-w-3xl mx-auto px-6 py-24">
        <div className="flex items-center gap-4 mb-8">
            <ShieldCheck className="w-8 h-8 text-primary" />
            <h1 className="text-4xl font-bold tracking-tighter uppercase">Privacy_Policy</h1>
        </div>
        
        <div className="space-y-12 text-muted-foreground leading-relaxed">
          <section className="space-y-4">
            <h2 className="text-white font-mono text-sm tracking-widest uppercase">01. Data_Collection</h2>
            <p>
              We collect minimal data necessary for bot operation. This includes server IDs, 
              channel IDs, and user IDs required for command processing and persistent 
              storage of bot settings. We do not log message content unless explicitly 
              required by a specific bot's functionality.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-white font-mono text-sm tracking-widest uppercase">02. Information_Security</h2>
            <p>
              All data is stored on encrypted clusters in US-EAST-1. Access to production 
              databases is restricted to core system administrators and requires 
              multi-factor authentication.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-white font-mono text-sm tracking-widest uppercase">03. Third_Party_Services</h2>
            <p>
              We integrate with the Discord API and may use secondary services for 
              logging or performance monitoring. These services are vetted to ensure 
              they meet our rigorous privacy standards.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-white font-mono text-sm tracking-widest uppercase">04. Data_Retention</h2>
            <p>
              User data is retained for the duration of the bot's presence in a server. 
              Upon bot removal or data deletion request, all associated records are 
              purged from our active databases within 72 hours.
            </p>
          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
}
