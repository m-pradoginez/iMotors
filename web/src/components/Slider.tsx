import { cn } from '../lib/utils';

interface SliderProps {
  label?: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  onChange: (value: number) => void;
  formatValue?: (value: number) => string;
  helperText?: string;
}

export function Slider({
  label,
  value,
  min,
  max,
  step = 1,
  onChange,
  formatValue = (v) => String(v),
  helperText,
}: SliderProps) {
  const percentage = ((value - min) / (max - min)) * 100;

  return (
    <div className="w-full">
      {label && (
        <div className="flex justify-between items-center mb-3">
          <label className="block text-sm font-bold text-slate-700 uppercase tracking-wider">
            {label}
          </label>
          <span className="text-sm font-black text-emerald-600">
            {formatValue(value)}
          </span>
        </div>
      )}
      <div className="relative h-2 bg-slate-100 rounded-full">
        <div
          className="absolute h-full bg-emerald-500 rounded-full transition-all duration-300"
          style={{ width: `${percentage}%` }}
        />
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          className={cn(
            'absolute w-full h-full opacity-0 cursor-pointer z-10'
          )}
        />
        <div
          className="absolute h-5 w-5 bg-emerald-600 rounded-full shadow-lg border-2 border-white -top-1.5 transition-all hover:scale-110"
          style={{ left: `calc(${percentage}% - 10px)` }}
        />
      </div>
      <div className="flex justify-between mt-3 text-xs font-bold text-slate-400">
        <span>{formatValue(min)}</span>
        <span>{formatValue(max)}</span>
      </div>
      {helperText && (
        <p className="mt-4 text-sm text-slate-500 leading-relaxed text-center italic">{helperText}</p>
      )}
    </div>
  );
}
