interface VehiclePlaceholderProps {
  brand: string;
  model: string;
  className?: string;
}

export function VehiclePlaceholder({ brand, model, className = '' }: VehiclePlaceholderProps) {
  const initials = `${brand.charAt(0)}${model.charAt(0)}`.toUpperCase();
  
  return (
    <div className={`w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-900 ${className}`}>
      <svg
        className="w-16 h-16 text-slate-300 dark:text-slate-600 mb-3"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={1.5}
          d="M19 9l-7 7-7-7"
        />
        <circle cx="12" cy="12" r="9" strokeWidth={1.5} />
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={1.5}
          d="M8 12h8"
        />
      </svg>
      <div className="text-2xl font-black text-slate-400 dark:text-slate-500 tracking-tighter">
        {initials}
      </div>
      <div className="text-xs font-medium text-slate-400 dark:text-slate-500 mt-1 uppercase tracking-wider">
        {brand} {model}
      </div>
    </div>
  );
}
