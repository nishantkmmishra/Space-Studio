import { useState } from "react";
import { Link } from "react-router-dom";
import { Icon } from "@/components/Icon";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setLoading(true);
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    setLoading(false);
    if (error) {
      toast.error("Could not send reset email", { description: error.message });
    } else {
      setSent(true);
    }
  };

  if (sent) {
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
            We sent a password reset link to
          </p>
          <p className="font-mono text-[14px] text-foreground font-semibold mb-6">{email}</p>
          <p className="text-[13px] text-stone mb-8">
            Click the link in the email to choose a new password. It expires in 1 hour.
          </p>
          <Link
            to="/login"
            className="inline-flex items-center gap-2 h-11 px-6 rounded-lg bg-accent text-accent-foreground font-medium text-[14px] hover:bg-[hsl(var(--brand-hover))] transition-colors"
          >
            <Icon name="arrowLeft" size={14} strokeWidth={2} /> Back to sign in
          </Link>
          <p className="text-[12px] text-stone mt-6">
            Didn't get it?{" "}
            <button
              onClick={() => setSent(false)}
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
            Reset password.
          </h1>
          <p className="text-[15px] text-olive leading-relaxed">
            Enter the email you signed up with. We'll send you a link to set a new password.
          </p>
        </div>

        <form onSubmit={onSubmit} className="flex flex-col gap-4">
          <label className="block">
            <span className="text-[12px] font-medium text-dark-warm mb-1.5 block">Email</span>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@studio.com"
              className="input-claude"
              autoFocus
            />
          </label>

          <button
            type="submit"
            disabled={loading}
            className="mt-2 h-11 rounded-lg bg-accent text-accent-foreground font-medium text-[14px] hover:bg-[hsl(var(--brand-hover))] transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
          >
            {loading ? "Sending…" : (
              <> Send reset link <Icon name="arrowRight" size={14} strokeWidth={2} /> </>
            )}
          </button>
        </form>

        <p className="text-[13px] text-olive mt-8">
          Remembered it?{" "}
          <Link
            to="/login"
            className="text-foreground font-medium underline decoration-border hover:decoration-accent underline-offset-4"
          >
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
