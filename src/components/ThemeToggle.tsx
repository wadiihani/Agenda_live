import React from 'react';
import { Sun, Moon } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

interface ThemeToggleProps {
  className?: string;
  showLabel?: boolean;
}

export const ThemeToggle: React.FC<ThemeToggleProps> = ({ className = '', showLabel = false }) => {
  const { toggleTheme, isDark } = useTheme();

  return (
    <button
      type="button"
      onClick={toggleTheme}
      className={`relative inline-flex items-center gap-1.5 p-1.5 sm:px-2.5 sm:py-1 rounded-full text-xs font-semibold font-label transition-all active:scale-90 select-none ${
        isDark
          ? 'bg-white/5 hover:bg-white/10 text-off-white border border-white/10 hover:border-endgame-gold/50 shadow-sm'
          : 'bg-black/5 hover:bg-black/10 text-slate-800 border border-slate-300 hover:border-endgame-gold/70 shadow-sm'
      } ${className}`}
      title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
      aria-label={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
      aria-pressed={!isDark}
    >
      <div className="relative w-4 h-4 flex items-center justify-center shrink-0">
        {isDark ? (
          <Sun className="w-4 h-4 text-endgame-gold transition-transform hover:rotate-45" />
        ) : (
          <Moon className="w-4 h-4 text-infinity-purple-light transition-transform hover:-rotate-12" />
        )}
      </div>

      {showLabel && (
        <span className="hidden xs:inline uppercase tracking-wider text-[10px] font-bold">
          {isDark ? 'Light' : 'Dark'}
        </span>
      )}
    </button>
  );
};

export default ThemeToggle;
