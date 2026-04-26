import { type ReactNode } from "react";

interface PageHeaderProps {
  category: string;
  title: string;
  subtitle?: string;
  children?: ReactNode;
}

export function PageHeader({ category, title, subtitle, children }: PageHeaderProps) {
  return (
    <div className="flex items-start justify-between gap-4 mb-8">
      <div>
        <div className="text-[10.5px] uppercase tracking-[0.18em] text-stone font-medium mb-1.5">
          {category}
        </div>
        <h1 className="font-serif-display text-[38px] leading-tight text-foreground tracking-tight">
          {title}
        </h1>
        {subtitle && (
          <p className="text-[14px] text-olive mt-2 max-w-[560px] leading-relaxed">{subtitle}</p>
        )}
      </div>
      {children && (
        <div className="flex items-center gap-2 shrink-0 mt-1">{children}</div>
      )}
    </div>
  );
}
