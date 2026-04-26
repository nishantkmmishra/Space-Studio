import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Icon } from "@/components/Icon";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (error) {
      if (error.message.toLowerCase().includes("email not confirmed")) {
        toast.error("Email not confirmed", {
          description: "Check your inbox and click the confirmation link first.",
          action: {
            label: "Resend email",
            onClick: () => supabase.auth.resend({ type: "signup", email })
              .then(() => toast.success("Confirmation email resent!")),
          },
        });
      } else if (error.message.toLowerCase().includes("invalid login")) {
        toast.error("Wrong email or password");
      } else {
        toast.error("Sign in failed", { description: error.message });
      }
    } else {
      navigate("/app/knowledge");
    }
  };

  const onDiscord = async () => {
    await supabase.auth.signInWithOAuth({
      provider: "discord",
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
        scopes: "identify email guilds",
      },
    });
  };

  return (
    <div className="min-h-screen grid lg:grid-cols-2 bg-background">
      <div className="flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-[400px]">
          <Link to="/" className="inline-flex items-center gap-2.5 mb-12">
            <div className="w-9 h-9 rounded-lg bg-foreground text-background flex items-center justify-center">
              <Icon name="sparkle" size={16} strokeWidth={1.8} />
            </div>
            <span className="font-serif-display text-[19px]">Space</span>
          </Link>

          <div className="mb-8">
            <h1 className="font-serif-display text-[42px] leading-[1.1] text-foreground tracking-tight mb-3">
              Welcome back.
            </h1>
            <p className="text-[15px] text-olive leading-relaxed">
              Sign in to your studio. The bot is waiting patiently in the channel.
            </p>
          </div>

          <form onSubmit={onSubmit} className="flex flex-col gap-4">
            <label className="block">
              <span className="text-[12px] font-medium text-dark-warm mb-1.5 block">Email</span>
              <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
                placeholder="you@studio.com" className="input-claude" />
            </label>
            <label className="block">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[12px] font-medium text-dark-warm">Password</span>
                <Link
                  to="/forgot-password"
                  className="text-[11.5px] text-stone hover:text-accent transition-colors"
                >
                  Forgot?
                </Link>
              </div>
              <input type="password" required value={password} onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••" className="input-claude" />
            </label>

            <button type="submit" disabled={loading}
              className="mt-2 h-11 rounded-lg bg-accent text-accent-foreground font-medium text-[14px] hover:bg-[hsl(var(--brand-hover))] transition-colors disabled:opacity-60 flex items-center justify-center gap-2">
              {loading ? "Signing in…" : (<>Sign in <Icon name="arrowRight" size={14} strokeWidth={2} /></>)}
            </button>

            <div className="flex items-center gap-3 my-2">
              <div className="flex-1 h-px bg-border" />
              <span className="text-[11px] uppercase tracking-wider text-stone">or</span>
              <div className="flex-1 h-px bg-border" />
            </div>

            <button type="button" onClick={onDiscord}
              className="h-11 rounded-lg bg-card border border-border text-foreground font-medium text-[14px] hover:bg-secondary transition-colors flex items-center justify-center gap-2.5">
              <Icon name="discord" size={15} strokeWidth={1.6} />
              Continue with Discord
            </button>
          </form>

          <p className="text-[13px] text-olive mt-8">
            New here?{" "}
            <Link to="/register" className="text-foreground font-medium underline decoration-border hover:decoration-accent underline-offset-4">
              Create an account
            </Link>
          </p>
        </div>
      </div>

      {/* Right panel */}
      <div className="hidden lg:flex items-center justify-center bg-foreground text-background p-12 relative overflow-hidden">
        <svg viewBox="0 0 600 600" className="absolute inset-0 w-full h-full opacity-90">
          <defs>
            <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="hsl(48 7% 67% / 0.06)" strokeWidth="1" />
            </pattern>
          </defs>
          <rect width="600" height="600" fill="url(#grid)" />
        </svg>
        <div className="relative z-10 max-w-md text-center">
          <svg viewBox="0 0 240 200" className="w-full max-w-[280px] mx-auto mb-10">
            <circle cx="180" cy="55" r="22" fill="hsl(17 54% 53%)" />
            <g stroke="hsl(17 54% 53%)" strokeWidth="2" strokeLinecap="round">
              <line x1="180" y1="20" x2="180" y2="10" /><line x1="180" y1="100" x2="180" y2="90" />
              <line x1="220" y1="55" x2="230" y2="55" /><line x1="130" y1="55" x2="140" y2="55" />
            </g>
            <path d="M0 130 Q 60 120, 120 130 T 240 130" stroke="hsl(48 7% 67%)" strokeWidth="1.5" fill="none" />
            <path d="M20 130 L60 80 L100 130 Z" fill="hsl(48 7% 67% / 0.2)" stroke="hsl(48 33% 97%)" strokeWidth="1.5" strokeLinejoin="round" />
            <path d="M70 130 L110 70 L150 130 Z" fill="hsl(17 54% 53% / 0.15)" stroke="hsl(48 33% 97%)" strokeWidth="1.5" strokeLinejoin="round" />
            <g transform="translate(95 145)">
              <rect x="0" y="0" width="50" height="36" rx="2" fill="hsl(48 33% 97%)" stroke="hsl(48 33% 97%)" strokeWidth="1.5" />
              <line x1="25" y1="0" x2="25" y2="36" stroke="hsl(60 3% 8%)" strokeWidth="1" />
              <line x1="6" y1="8" x2="20" y2="8" stroke="hsl(60 3% 8%)" strokeWidth="0.8" />
              <line x1="6" y1="14" x2="20" y2="14" stroke="hsl(60 3% 8%)" strokeWidth="0.8" />
            </g>
          </svg>
          <blockquote className="font-serif-display text-[26px] leading-[1.25] text-background mb-6">
            "A library is a hospital for the mind."
          </blockquote>
          <div className="text-[12px] uppercase tracking-[0.18em] text-warm-silver">
            — bot, on its third coffee
          </div>
        </div>
      </div>
    </div>
  );
}
