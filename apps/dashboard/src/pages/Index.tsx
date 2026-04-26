import { Link } from "react-router-dom";
import { Icon } from "@/components/Icon";

export default function Index() {
  return (
    <div className="min-h-screen bg-background selection:bg-accent/20">
      {/* Navigation */}
      <header className="fixed top-0 left-0 right-0 z-50 backdrop-blur-xl bg-background/70 border-b border-border/40">
        <div className="px-8 py-5 flex items-center justify-between max-w-[1400px] mx-auto">
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-xl bg-background border border-border overflow-hidden shadow-sm flex items-center justify-center p-1 group-hover:scale-105 transition-transform">
              <img src="/logo.png" alt="Space Studio Logo" className="w-full h-full object-contain" />
            </div>
            <span className="font-serif-display text-[24px] text-foreground tracking-tight">Space Studio</span>
          </Link>
          
          <nav className="flex items-center gap-6">
            <Link to="/login" className="text-[13.5px] font-bold text-stone hover:text-foreground transition-colors">
              Sign In
            </Link>
            <Link to="/register" className="h-11 px-6 rounded-xl bg-foreground text-background text-[13.5px] font-bold hover:opacity-90 transition-all shadow-md flex items-center">
              Get Started
            </Link>
          </nav>
        </div>
      </header>

      <main className="pt-32 pb-32 overflow-hidden">
        {/* Hero Section */}
        <section className="max-w-[1200px] mx-auto px-8">
          <div className="max-w-[840px]">
            <div className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full bg-accent/5 border border-accent/10 text-accent text-[11px] font-black uppercase tracking-[0.2em] mb-10 animate-fade-in">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-accent"></span>
              </span>
              AI-Powered Community Operations
            </div>
            
            <h1 className="font-serif-display text-[72px] md:text-[88px] leading-[0.95] text-foreground tracking-tighter mb-10 animate-slide-up">
              A quiet studio for <span className="text-stone italic">louder</span> servers.
            </h1>
            
            <p className="text-[20px] md:text-[24px] text-olive leading-[1.5] mb-12 max-w-[640px] font-medium opacity-80 animate-slide-up animation-delay-200">
              Space is a professional dashboard for Discord bots. Manage your knowledge base, review conversations, and monitor system health in an interface designed for clarity.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 animate-slide-up animation-delay-300">
              <Link to="/register" className="h-14 px-8 rounded-2xl bg-accent text-accent-foreground text-[16px] font-bold hover:bg-[hsl(var(--brand-hover))] flex items-center justify-center gap-3 transition-all shadow-xl shadow-accent/20">
                Get Started <Icon name="arrowRight" size={18} strokeWidth={3} />
              </Link>
              <Link to="/login" className="h-14 px-8 rounded-2xl bg-card border border-border text-foreground text-[16px] font-bold hover:bg-secondary flex items-center justify-center transition-all shadow-sm">
                Sign In
              </Link>
            </div>
          </div>
        </section>

        {/* Feature Grid */}
        <section className="max-w-[1240px] mx-auto px-8 mt-40">
          <div className="grid md:grid-cols-3 gap-8">
            <FeatureCard 
              icon="book" 
              title="Knowledge Engine" 
              body="Drop in raw documentation. Edit passages in real-time and witness the bot's cognition adapt instantly." 
            />
            <FeatureCard 
              icon="message" 
              title="Audit Interface" 
              body="Every interaction is recorded and reviewable. Refine drifting logic to calibrate future decision making." 
            />
            <FeatureCard 
              icon="terminal" 
              title="Runtime Console" 
              body="Watch the bot think. Live tail log streams, execute administrative commands, and monitor instance health." 
            />
          </div>
        </section>

        {/* Visual Teaser */}
        <section className="max-w-[1240px] mx-auto px-8 mt-40">
          <div className="relative aspect-[16/9] rounded-[32px] overflow-hidden border border-border shadow-2xl group">
            <div className="absolute inset-0 bg-gradient-to-tr from-foreground/10 to-transparent pointer-events-none z-10" />
            <div className="absolute inset-0 bg-card/40 backdrop-blur-[2px] transition-all group-hover:backdrop-blur-0" />
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center z-20">
                <div className="w-20 h-20 rounded-3xl bg-background border border-border flex items-center justify-center mx-auto mb-6 shadow-2xl">
                  <Icon name="sparkle" size={32} className="text-accent" />
                </div>
                <h3 className="font-serif-display text-[32px]">Interface for Excellence.</h3>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-border py-12">
        <div className="max-w-[1240px] mx-auto px-8 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-3">
            <Icon name="sparkle" size={16} className="text-stone" />
            <span className="text-[14px] font-serif-display text-stone">Space Studio</span>
          </div>
          <p className="text-[12px] text-stone font-bold uppercase tracking-widest">
            Developed by Nishant Kumar Mishra
          </p>
          <div className="text-[12px] text-stone font-medium">
            © 2026 Operational Intelligence.
          </div>
        </div>
      </footer>
    </div>
  );
}

function FeatureCard({ icon, title, body }: { icon: any; title: string; body: string }) {
  return (
    <div className="card-elevated p-10 border-none shadow-sm hover:shadow-xl transition-all group hover:-translate-y-1">
      <div className="w-12 h-12 rounded-2xl bg-secondary/50 border border-border flex items-center justify-center text-accent mb-8 group-hover:bg-accent group-hover:text-background transition-all">
        <Icon name={icon} size={20} strokeWidth={2.5} />
      </div>
      <h3 className="font-serif-display text-[26px] text-foreground mb-4 leading-tight">{title}</h3>
      <p className="text-[15px] text-olive leading-relaxed font-medium opacity-70">{body}</p>
    </div>
  );
}
