import Link from "next/link";
import { Code2, ChevronLeft } from "lucide-react";
import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";

export default function Terms() {
  return (
    <div className="min-h-screen bg-background selection:bg-primary/30">
      <Navbar />

      <main className="max-w-3xl mx-auto px-6 py-24">
        <h1 className="text-4xl font-bold tracking-tighter mb-12 uppercase">Term_Of_Use</h1>
        
        <div className="space-y-12 text-muted-foreground leading-relaxed">
          <section className="space-y-4">
            <h2 className="text-white font-mono text-sm tracking-widest uppercase">01. Acceptance_Of_Terms</h2>
            <p>
              By accessing the ARCH_BOTS mainframe, you agree to be bound by these Terms of Use. 
              Our systems are provided "as is" and your use of our agents constitutes an agreement 
              to follow all security protocols and operational guidelines.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-white font-mono text-sm tracking-widest uppercase">02. License_Usage</h2>
            <p>
              We grant you a limited, non-exclusive license to deploy our bots within your Discord 
              communities. Any attempt to reverse-engineer, decompile, or bypass our security 
              measures will result in immediate termination of access.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-white font-mono text-sm tracking-widest uppercase">03. Operational_Conduct</h2>
            <p>
              Users are responsible for the behavior of bots deployed in their servers. ARCH_BOTS 
              is not liable for any disruptions caused by improper configuration or misuse of 
              the provided API endpoints.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-white font-mono text-sm tracking-widest uppercase">04. Limitation_Of_Liability</h2>
            <p>
              In no event shall ARCH_BOTS_MAINFRAME be liable for any indirect, incidental, 
              special, or consequential damages arising out of or in connection with the use 
              of our services.
            </p>
          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
}
