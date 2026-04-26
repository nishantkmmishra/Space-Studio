import { Toaster as SonnerToaster } from "sonner";

export function Toaster() {
  return (
    <SonnerToaster
      toastOptions={{
        classNames: {
          toast: "bg-card border border-border text-foreground shadow-sm rounded-xl font-sans",
          success: "!border-accent/30",
          error: "!border-destructive/30",
          description: "text-stone text-[13px]",
        },
      }}
    />
  );
}
