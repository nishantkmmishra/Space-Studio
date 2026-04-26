import { type ReactNode } from "react";
import { Icon, type IconName } from "./Icon";

interface EmptyStateProps {
  icon: IconName;
  title: string;
  description: string;
  action?: ReactNode;
}

export function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <div className="w-14 h-14 rounded-2xl bg-secondary border border-border-warm flex items-center justify-center text-stone mb-5">
        <Icon name={icon} size={22} strokeWidth={1.5} />
      </div>
      <h2 className="font-serif-display text-[26px] text-foreground mb-2">{title}</h2>
      <p className="text-[14px] text-olive max-w-[400px] leading-relaxed mb-6">{description}</p>
      {action}
    </div>
  );
}
