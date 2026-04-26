import { Link } from "react-router-dom";
import { Icon } from "@/components/Icon";

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center max-w-[480px] px-8">
        <div className="font-serif-display text-[120px] leading-none text-foreground/10 select-none mb-6">404</div>
        <h1 className="font-serif-display text-[36px] text-foreground tracking-tight mb-3">Page not found.</h1>
        <p className="text-[14px] text-olive leading-relaxed mb-8">
          The page you're looking for has wandered off. It might have been moved or doesn't exist.
        </p>
        <Link to="/app/knowledge" className="inline-flex items-center gap-2 h-10 px-5 rounded-lg bg-accent text-accent-foreground text-[13.5px] font-medium hover:bg-[hsl(var(--brand-hover))] transition-colors">
          <Icon name="arrowLeft" size={14} strokeWidth={2} /> Back to dashboard
        </Link>
      </div>
    </div>
  );
}
