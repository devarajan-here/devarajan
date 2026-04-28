import { Moon, Sun } from 'lucide-react';
import { useEffect, useState } from 'react';

const STORAGE_KEY = 'portfolio-theme';

export function ThemeToggle() {
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');

  useEffect(() => {
    const savedTheme = localStorage.getItem(STORAGE_KEY);
    const nextTheme = savedTheme === 'light' ? 'light' : 'dark';
    setTheme(nextTheme);
    document.documentElement.classList.toggle('dark', nextTheme === 'dark');
    document.documentElement.classList.toggle('portfolio-light', nextTheme === 'light');
  }, []);

  const toggleTheme = () => {
    const nextTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(nextTheme);
    localStorage.setItem(STORAGE_KEY, nextTheme);
    document.documentElement.classList.toggle('dark', nextTheme === 'dark');
    document.documentElement.classList.toggle('portfolio-light', nextTheme === 'light');
  };

  const isDark = theme === 'dark';

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={isDark ? 'Switch to white mode' : 'Switch to dark mode'}
      title={isDark ? 'White mode' : 'Dark mode'}
      className="fixed right-6 top-6 z-[90] flex h-12 w-12 items-center justify-center rounded-full border border-white/20 bg-black/70 text-white shadow-lg backdrop-blur-md transition-all duration-300 hover:scale-110 hover:bg-white hover:text-black portfolio-theme-toggle"
    >
      {isDark ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
    </button>
  );
}
