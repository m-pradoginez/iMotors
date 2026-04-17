import { useState, useCallback, useMemo } from 'react';
import { Wallet, BadgeCheck, ChevronRight, HelpCircle, Info } from 'lucide-react';
import { formatCurrency } from '../lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

interface BudgetStepProps {
  initialValue?: number;
  onNext: (budget: number) => void;
}

const MIN_BUDGET = 500;
const MAX_BUDGET = 10000;
const STEP = 100;

export function BudgetStep({ initialValue = 2500, onNext }: BudgetStepProps) {
  const [budget, setBudget] = useState(initialValue);
  const [showTooltip, setShowTooltip] = useState(false);

  // Simple live feedback calculation (mock logic for UX)
  const vehicleTier = useMemo(() => {
    if (budget < 1500) return { label: 'Econômico', color: 'text-blue-500', bg: 'bg-blue-50' };
    if (budget < 3500) return { label: 'Intermediário', color: 'text-emerald-500', bg: 'bg-emerald-50' };
    return { label: 'Premium / SUV', color: 'text-purple-500', bg: 'bg-purple-50' };
  }, [budget]);

  const handleSliderChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setBudget(Number(e.target.value));
  }, []);

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const rawValue = e.target.value.replace(/\D/g, '');
    const numericValue = parseInt(rawValue, 10) || 0;
    const clampedValue = Math.max(MIN_BUDGET, Math.min(MAX_BUDGET, numericValue));
    setBudget(clampedValue);
  }, []);

  const handleNext = useCallback(() => {
    onNext(budget);
  }, [budget, onNext]);

  return (
    <div className="w-full max-w-[480px]">
      {/* Header & Step Indicator */}
      <div className="mb-8 px-2">
        <div className="flex justify-between items-end mb-3">
          <span className="text-sm font-medium text-slate-500 uppercase tracking-wider">
            Passo 1 de 3
          </span>
          <span className="text-sm font-semibold text-emerald-600">
            Orçamento
          </span>
        </div>
        <div className="h-1.5 w-full bg-slate-200 rounded-full overflow-hidden">
          <div 
            className="h-full bg-emerald-500 rounded-full transition-all duration-500"
            style={{ width: '33.33%' }}
          />
        </div>
      </div>

      {/* Main Card */}
      <div className="bg-white rounded-[32px] shadow-2xl shadow-slate-200/60 border border-slate-100 p-8 md:p-12 flex flex-col gap-10">
        {/* Question Area */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-emerald-50 rounded-2xl text-emerald-600">
                <Wallet className="w-6 h-6" />
              </div>
              <h2 className="text-2xl font-bold text-slate-900 tracking-tight leading-tight">
                Qual seu orçamento mensal?
              </h2>
            </div>
            <button 
              onMouseEnter={() => setShowTooltip(true)}
              onMouseLeave={() => setShowTooltip(false)}
              className="text-slate-300 hover:text-emerald-500 transition-colors"
            >
              <HelpCircle className="w-5 h-5" />
            </button>
          </div>
          
          <div className="relative">
            <AnimatePresence>
              {showTooltip && (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  className="absolute z-50 bottom-full left-0 mb-4 p-4 bg-slate-900 text-white text-xs rounded-2xl shadow-xl w-64 leading-relaxed"
                >
                  <p>O TCO (Custo Total) inclui não apenas a parcela, mas também combustível, seguro, manutenção e a desvalorização do carro.</p>
                  <div className="absolute -bottom-2 left-6 w-4 h-4 bg-slate-900 rotate-45" />
                </motion.div>
              )}
            </AnimatePresence>
            <p className="text-slate-500 leading-relaxed ml-16">
              Defina o valor máximo que você pode investir mensalmente no seu veículo.
            </p>
          </div>
        </div>

        {/* Input & Slider Controls */}
        <div className="space-y-10">
          <div className="flex flex-col items-center gap-2">
            <input
              type="text"
              inputMode="numeric"
              value={formatCurrency(budget)}
              onChange={handleInputChange}
              className="text-5xl font-black text-slate-900 bg-transparent border-none text-center focus:ring-0 w-full tracking-tighter"
            />
            
            {/* Live Feedback Badge */}
            <motion.div 
              key={vehicleTier.label}
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className={`${vehicleTier.bg} ${vehicleTier.color} px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-widest`}
            >
              Categoria: {vehicleTier.label}
            </motion.div>
          </div>

          <div className="space-y-4">
            <input
              type="range"
              min={MIN_BUDGET}
              max={MAX_BUDGET}
              step={STEP}
              value={budget}
              onChange={handleSliderChange}
              className="w-full h-2 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-emerald-500"
            />
            <div className="flex justify-between text-xs font-bold text-slate-400">
              <span>{formatCurrency(MIN_BUDGET)}</span>
              <span>{formatCurrency(MAX_BUDGET)}</span>
            </div>
          </div>
        </div>

        {/* Real-time TCO Feedback */}
        <div className="bg-slate-50 rounded-3xl p-6 border border-slate-100 flex items-start gap-4">
          <div className="p-2 bg-white rounded-xl shadow-sm">
            <Info className="w-5 h-5 text-emerald-500" />
          </div>
          <div className="space-y-1">
            <p className="text-sm font-bold text-slate-700">Estimativa em tempo real</p>
            <p className="text-xs text-slate-500 leading-relaxed">
              Com {formatCurrency(budget)}/mês, você terá acesso a veículos com valor de mercado de até <span className="font-bold text-emerald-600">{formatCurrency(budget * 45)}</span>.
            </p>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="pt-8 border-t border-slate-100 flex flex-col gap-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-slate-400">
              <BadgeCheck className="w-4 h-4 text-emerald-500" />
              <span className="text-[10px] font-medium uppercase tracking-wider">
                Dados verificados FIPE & INMETRO
              </span>
            </div>
            
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleNext}
              className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-8 py-4 rounded-2xl font-bold transition-all hover:shadow-lg hover:shadow-emerald-200"
            >
              Próximo
              <ChevronRight className="w-5 h-5" />
            </motion.button>
          </div>
        </div>
      </div>

      {/* Brand Footer */}
      <div className="mt-8 text-center">
        <p className="text-sm font-semibold text-slate-400 tracking-tight">
          iMotors Consultant Wizard
        </p>
      </div>
    </div>
  );
}
