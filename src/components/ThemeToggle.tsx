
import * as React from "react";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";

const ThemeToggle = () => {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
    // Set initial theme to dark
    setTheme('dark');
  }, []);

  if (!mounted) return null;

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={() => setTheme(theme === "light" ? "dark" : "light")}
      className="rounded-full border border-primary/20 hover:border-primary/50 
                bg-background/50 backdrop-blur-sm transition-all duration-300"
      aria-label="Toggle theme"
    >
      <Sun className="h-5 w-5 rotate-0 scale-100 transition-all duration-300 
                     dark:-rotate-90 dark:scale-0 text-primary neon-text" />
      <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all duration-300 
                      dark:rotate-0 dark:scale-100 text-primary neon-text" />
      <span className="sr-only">Toggle theme</span>
    </Button>
  );
};

export default ThemeToggle;
