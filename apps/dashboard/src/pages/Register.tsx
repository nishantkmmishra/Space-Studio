import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Icon } from "@/components/Icon";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";

export default function Register() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [confirming, setConfirming] = useState(false);

  const onDiscord = async () => {
    await supabase.auth.signInWithOAuth({
      provider: "discord",
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
        scopes: "identify email guilds",
      },
    });
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 8) {
      toast.error("Password must be at least 8 characters");
      return;
    }
    setLoading(true);
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: name } },
    });
    setLoading(false);

    if (error) {
      // Common errors with friendly messages
      if (error.message.includes("already registered")) {
        toast.error("Email already in use", {
          description: "Try signing in instead.",
        });
      } else {
        toast.error("Registration failed", { description: error.message });
      }
      return;
    }

    if (data.session) {
      // Email confirmation is disabled — user is logged in immediately
      toast.success("Welcome! You're logged in.");
      navigate("/app/knowledge");
    } else {
      // Email confirmation is required — show the confirmation screen
      setConfirming(true);
    }
  };

  // ── Confirmation screen ──────────────────────────────────────
  if (confirming) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background px-6">
        <div className="w-full max-w-[420px] text-center">
          <div className="w-14 h-14 rounded-2xl bg-accent/10 text-accent flex items-center justify-center mx-auto mb-6">
            <Icon name="mail" size={24} strokeWidth={1.5} />
          </div>
          <h1 className="font-serif-display text-[34px] text-foreground tracking-tight mb-3">
            Check your inbox.
          </h1>
          <p className="text-[14.5px] text-olive leading-relaxed mb-2">
            We sent a confirmation link to
          </p>
          <p className="font-mono text-[14px] text-foreground font-semibold mb-6">{email}</p>
          <p className="text-[13px] text-stone mb-8">
            Click the link in the email to activate your account, then come back and sign in.
          </p>
          <Link
            to="/login"
            className="inline-flex items-center gap-2 h-11 px-6 rounded-lg bg-accent text-accent-foreground font-medium text-[14px] hover:bg-[hsl(var(--brand-hover))] transition-colors"
          >
            Go to sign in <Icon name="arrowRight" size={14} strokeWidth={2} />
          </Link>
          <p className="text-[12px] text-stone mt-6">
            No email?{" "}
            <button
              onClick={() => setConfirming(false)}
              className="text-accent underline underline-offset-2"
            >
              Try again
            </button>
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-6 py-12">
      <div className="w-full max-w-[400px]">
        <Link to="/" className="inline-flex items-center gap-2.5 mb-12">
          <div className="w-9 h-9 rounded-lg bg-foreground text-background flex items-center justify-center">
            <Icon name="sparkle" size={16} strokeWidth={1.8} />
          </div>
          <span className="font-serif-display text-[19px]">Space</span>
        </Link>

        <div className="mb-8">
          <h1 className="font-serif-display text-[42px] leading-[1.1] text-foreground tracking-tight mb-3">
            Open the studio.
          </h1>
          <p className="text-[15px] text-olive leading-relaxed">
            Create your account and start building your knowledge bot.
          </p>
        </div>

        <form onSubmit={onSubmit} className="flex flex-col gap-4">
          <label className="block">
            <span className="text-[12px] font-medium text-dark-warm mb-1.5 block">Display name</span>
            <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Your name"
              className="input-claude" />
          </label>
          <label className="block">
            <span className="text-[12px] font-medium text-dark-warm mb-1.5 block">Email</span>
            <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
              placeholder="you@studio.com" className="input-claude" />
          </label>
          <label className="block">
            <span className="text-[12px] font-medium text-dark-warm mb-1.5 block">Password</span>
            <input type="password" required value={password} onChange={(e) => setPassword(e.target.value)}
              placeholder="Min. 8 characters" className="input-claude" />
          </label>

          <button type="submit" disabled={loading}
            className="mt-2 h-11 rounded-lg bg-accent text-accent-foreground font-medium text-[14px] hover:bg-[hsl(var(--brand-hover))] transition-colors disabled:opacity-60 flex items-center justify-center gap-2">
            {loading ? "Creating account…" : (<>Create account <Icon name="arrowRight" size={14} strokeWidth={2} /></>)}
          </button>

          <div className="flex items-center gap-3 my-1">
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
          Already have an account?{" "}
          <Link to="/login" className="text-foreground font-medium underline decoration-border hover:decoration-accent underline-offset-4">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
