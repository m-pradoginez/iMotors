import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, Check } from 'lucide-react';
import { cn } from '../lib/utils';

interface PremiumSelectProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: { value: string; label: string }[];
  placeholder?: string;
  icon: React.ReactNode;
  className?: string;
}

export function PremiumSelect({ 
  label, 
  value, 
  onChange, 
  options, 
  placeholder, 
  icon,
  className 
}: PremiumSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const selected = options.find(o => o.value === value);

  return (
    <div className={cn("relative", className)}>
      <div className="glass-card p-5 group hover:border-emerald-500/30 transition-colors">
        <div className="flex items-center space-x-2 mb-3">
          <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-500">
            {icon}
          </div>
          <span className="text-xs font-bold text-muted-foreground uppercase tracking-widest">{label}</span>
        </div>
        
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="w-full flex items-center justify-between p-4 rounded-xl bg-muted/50 hover:bg-muted transition-all active:scale-[0.99] border border-transparent focus:border-emerald-500/30 outline-none"
        >
          <span className="font-bold text-foreground truncate">
            {selected?.label || placeholder || 'Selecionar...'}
          </span>
          <ChevronDown className={cn("h-5 w-5 text-muted-foreground transition-transform duration-300", isOpen && "rotate-180")} />
        </button>
      </div>
      
      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              initial={{ opacity: 0, y: -10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              className="absolute z-50 w-full mt-2 glass-card border border-emerald-500/20 overflow-hidden shadow-2xl"
            >
              <div className="max-h-60 overflow-auto p-2 space-y-1">
                {options.map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => {
                      onChange(option.value);
                      setIsOpen(false);
                    }}
                    className={cn(
                      "w-full flex items-center justify-between px-4 py-3 rounded-lg text-left transition-colors",
                      value === option.value 
                        ? "bg-emerald-500 text-white font-bold" 
                        : "text-foreground hover:bg-emerald-500/10"
                    )}
                  >
                    <span className="truncate">{option.label}</span>
                    {value === option.value && <Check className="h-4 w-4" />}
                  </button>
                ))}
              </div>
            </motion.div>
            <div 
              className="fixed inset-0 z-40 bg-black/5 backdrop-blur-[2px]" 
              onClick={() => setIsOpen(false)}
            />
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
