import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabase";

/**
 * /auth/callback
 * Supabase redirects here after Discord (or any OAuth) login.
 * It reads the hash tokens, establishes the session, then sends
 * the user into the app.
 */
export default function AuthCallback() {
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Supabase puts the access_token in the URL hash after OAuth.
    // getSession() will parse it automatically.
    supabase.auth.getSession().then(({ data, error }) => {
      if (error || !data.session) {
        // Also try exchanging the code if present (PKCE flow)
        const params = new URLSearchParams(window.location.search);
        const code = params.get("code");
        if (code) {
          supabase.auth.exchangeCodeForSession(code).then(({ error: e }) => {
            if (e) {
              setError(e.message);
            } else {
              navigate("/app/knowledge", { replace: true });
            }
          });
        } else {
          setError(error?.message || "No session found. Try signing in again.");
        }
      } else {
        navigate("/app/knowledge", { replace: true });
      }
    });
  }, [navigate]);

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background px-6">
        <div className="w-full max-w-[400px] text-center">
          <div className="text-4xl mb-4">⚠️</div>
          <h1 className="font-serif-display text-[28px] text-foreground mb-3">
            Sign in failed
          </h1>
          <p className="text-[14px] text-olive mb-6">{error}</p>
          <a
            href="/login"
            className="inline-flex items-center gap-2 h-11 px-6 rounded-lg bg-accent text-accent-foreground font-medium text-[14px]"
          >
            Try again
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="flex flex-col items-center gap-4">
        <div className="w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin" />
        <p className="text-[14px] text-olive">Signing you in with Discord…</p>
      </div>
    </div>
  );
}
