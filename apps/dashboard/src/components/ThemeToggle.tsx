import { useTheme } from "./ThemeProvider";
import { Icon } from "./Icon";
import { Button } from "./ui/button";

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={() => setTheme(theme === "light" ? "dark" : "light")}
      className="rounded-xl h-9 w-9 text-stone hover:text-foreground"
    >
      <Icon name={theme === "light" ? "star" : "sparkle"} size={18} />
      <span className="sr-only">Toggle theme</span>
    </Button>
  );
}
