import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Icon } from "@/components/Icon";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";

export default function ResetPassword() {
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [ready, setReady] = useState(false);
  const [expired, setExpired] = useState(false);

  // Supabase puts the recovery token in the URL hash — wait for the
  // auth state change that fires once the token is parsed.
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event) => {
        if (event === "PASSWORD_RECOVERY") {
          setReady(true);
        }
      }
    );
    // Also handle if token is already invalid
    const timeout = setTimeout(() => {
      if (!ready) setExpired(true);
    }, 5000);
    return () => {
      subscription.unsubscribe();
      clearTimeout(timeout);
    };
  }, [ready]);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 8) {
      toast.error("Password must be at least 8 characters");
      return;
    }
    if (password !== confirm) {
      toast.error("Passwords don't match");
      return;
    }
    setLoading(true);
    const { error } = await supabase.auth.updateUser({ password });
    setLoading(false);
    if (error) {
      toast.error("Failed to update password", { description: error.message });
    } else {
      toast.success("Password updated! Signing you in…");
      setTimeout(() => navigate("/app/knowledge"), 1200);
    }
  };

  // Token expired or invalid
  if (expired && !ready) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background px-6">
        <div className="w-full max-w-[420px] text-center">
          <div className="w-14 h-14 rounded-2xl bg-red-50 text-red-500 flex items-center justify-center mx-auto mb-6">
            <Icon name="alertCircle" size={24} strokeWidth={1.5} />
          </div>
          <h1 className="font-serif-display text-[34px] text-foreground tracking-tight mb-3">
            Link expired.
          </h1>
          <p className="text-[14.5px] text-olive leading-relaxed mb-8">
            This password reset link has expired or already been used. Request a new one.
          </p>
          <Link
            to="/forgot-password"
            className="inline-flex items-center gap-2 h-11 px-6 rounded-lg bg-accent text-accent-foreground font-medium text-[14px] hover:bg-[hsl(var(--brand-hover))] transition-colors"
          >
            Request new link <Icon name="arrowRight" size={14} strokeWidth={2} />
          </Link>
        </div>
      </div>
    );
  }

  // Waiting for Supabase to parse the hash token
  if (!ready) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex items-center gap-3 text-olive">
          <div className="w-4 h-4 border-2 border-accent border-t-transparent rounded-full animate-spin" />
          <span className="text-[14px]">Verifying reset link…</span>
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
            New password.
          </h1>
          <p className="text-[15px] text-olive leading-relaxed">
            Choose a strong password. You'll be signed in automatically after.
          </p>
        </div>

        <form onSubmit={onSubmit} className="flex flex-col gap-4">
          <label className="block">
            <span className="text-[12px] font-medium text-dark-warm mb-1.5 block">
              New password
            </span>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Min. 8 characters"
              className="input-claude"
              autoFocus
            />
          </label>

          <label className="block">
            <span className="text-[12px] font-medium text-dark-warm mb-1.5 block">
              Confirm new password
            </span>
            <input
              type="password"
              required
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              placeholder="Same as above"
              className={`input-claude ${confirm && confirm !== password ? "border-red-400 focus:ring-red-300" : ""}`}
            />
            {confirm && confirm !== password && (
              <p className="text-[12px] text-red-500 mt-1.5">Passwords don't match</p>
            )}
          </label>

          {/* Password strength indicator */}
          {password && (
            <div className="flex gap-1">
              {[1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className={`h-1 flex-1 rounded-full transition-colors ${
                    password.length >= i * 3
                      ? i <= 1 ? "bg-red-400"
                        : i <= 2 ? "bg-amber-400"
                        : i <= 3 ? "bg-yellow-400"
                        : "bg-green-500"
                      : "bg-border"
                  }`}
                />
              ))}
            </div>
          )}

          <button
            type="submit"
            disabled={loading || (confirm.length > 0 && password !== confirm)}
            className="mt-2 h-11 rounded-lg bg-accent text-accent-foreground font-medium text-[14px] hover:bg-[hsl(var(--brand-hover))] transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
          >
            {loading ? "Updating…" : (
              <> Set new password <Icon name="arrowRight" size={14} strokeWidth={2} /> </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
