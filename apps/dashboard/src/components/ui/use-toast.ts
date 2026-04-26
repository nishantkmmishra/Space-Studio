import { toast } from "sonner";
export { toast };

export function useToast() {
  return {
    toast: (opts: { title?: string; description?: string; variant?: string }) => {
      if (opts.variant === "destructive") {
        toast.error(opts.title || "", { description: opts.description });
      } else {
        toast(opts.title || "", { description: opts.description });
      }
    },
    toasts: [] as unknown[],
    dismiss: (_id?: string) => {},
  };
}
