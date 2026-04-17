import { motion } from 'framer-motion';
import { cn } from '../lib/utils';

interface PremiumSliderProps {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  onChange: (value: number) => void;
  formatValue?: (value: number) => string;
  icon: React.ReactNode;
  helperText?: string;
  className?: string;
}

export function PremiumSlider({ 
  label, 
  value, 
  min, 
  max, 
  step, 
  onChange, 
  formatValue, 
  icon, 
  helperText,
  className
}: PremiumSliderProps) {
  const displayValue = formatValue ? formatValue(value) : value.toString();
  const percentage = ((value - min) / (max - min)) * 100;

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const numValue = parseInt(e.target.value.replace(/\D/g, ''), 10) || min;
    const clamped = Math.max(min, Math.min(max, numValue));
    onChange(clamped);
  };

  return (
    <div className={cn("glass-card p-6 space-y-5 group hover:border-emerald-500/30 transition-colors", className)}>
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-500 group-hover:scale-110 transition-transform">
            {icon}
          </div>
          <div className="flex flex-col">
            <span className="font-bold text-foreground tracking-tight">{label}</span>
            {helperText && <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-widest">{helperText}</span>}
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <input
            type="text"
            value={displayValue}
            onChange={handleInputChange}
            className="w-32 text-right px-2 py-1 text-lg font-black bg-transparent border-none focus:ring-0 text-emerald-500 tracking-tighter"
          />
        </div>
      </div>
      
      <div className="relative pt-2">
        <div className="relative h-2.5 bg-muted rounded-full overflow-hidden">
          <motion.div 
            className="absolute h-full bg-gradient-to-r from-emerald-500 to-emerald-400 rounded-full shadow-[0_0_15px_rgba(16,185,129,0.3)]"
            initial={false}
            animate={{ width: `${percentage}%` }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
          />
        </div>
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          className="absolute w-full h-full top-0 opacity-0 cursor-pointer z-10"
        />
        <div className="flex justify-between mt-3 text-[10px] font-black text-muted-foreground uppercase tracking-widest">
          <span>{formatValue ? formatValue(min) : min}</span>
          <span>{formatValue ? formatValue(max) : max}</span>
        </div>
      </div>
    </div>
  );
}
