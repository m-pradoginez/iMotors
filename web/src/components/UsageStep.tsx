import { useState, useCallback, useMemo } from 'react';
import { Gauge, Road, ChevronRight, ChevronLeft, HelpCircle, Info } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface UsageStepProps {
  initialMileage?: number;
  initialRatio?: number;
  onNext: (data: { mileage: number; ratio: number }) => void;
  onBack: () => void;
}

const MIN_MILEAGE = 1000;
const MAX_MILEAGE = 50000;
const STEP = 1000;

export function UsageStep({ 
  initialMileage = 15000, 
  initialRatio = 0.6, 
  onNext, 
  onBack 
}: UsageStepProps) {
  const [mileage, setMileage] = useState(initialMileage);
  const [ratio, setRatio] = useState(initialRatio);
  const [showTooltip, setShowTooltip] = useState(false);

  const usageProfile = useMemo(() => {
    if (ratio >= 0.8) return { label: 'Urbano Intenso', icon: '🏙️' };
    if (ratio <= 0.3) return { label: 'Estradeiro', icon: '🛣️' };
    return { label: 'Misto', icon: '🔄' };
  }, [ratio]);

  const handleMileageChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setMileage(Number(e.target.value));
  }, []);

  const handleRatioChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setRatio(Number(e.target.value) / 100);
  }, []);

  const handleNext = useCallback(() => {
    onNext({ mileage, ratio });
  }, [mileage, ratio, onNext]);

  return (
    <div className="w-full max-w-[480px]">
      {/* Header & Step Indicator */}
      <div className="mb-8 px-2">
        <div className="flex justify-between items-end mb-3">
          <span className="text-sm font-medium text-slate-500 uppercase tracking-wider">
            Passo 2 de 3
          </span>
          <span className="text-sm font-semibold text-emerald-600">
            Perfil de Uso
          </span>
        </div>
        <div className="h-1.5 w-full bg-slate-200 rounded-full overflow-hidden">
          <div 
            className="h-full bg-emerald-500 rounded-full transition-all duration-500"
            style={{ width: '66.66%' }}
          />
        </div>
      </div>

      {/* Main Card */}
      <div className="bg-white rounded-[32px] shadow-2xl shadow-slate-200/60 border border-slate-100 p-8 md:p-12 flex flex-col gap-10">
        
        {/* Mileage Section */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-emerald-50 rounded-2xl text-emerald-600">
                <Gauge className="w-6 h-6" />
              </div>
              <h2 className="text-2xl font-bold text-slate-900 tracking-tight leading-tight">
                Uso anual estimado
              </h2>
            </div>
          </div>
          
          <div className="flex flex-col items-center gap-2">
            <h3 className="text-5xl font-black text-slate-900 tracking-tighter">
              {(mileage / 1000).toFixed(0)}.000
            </h3>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">
              km por ano
            </span>
          </div>

          <div className="space-y-4">
            <input
              type="range"
              min={MIN_MILEAGE}
              max={MAX_MILEAGE}
              step={STEP}
              value={mileage}
              onChange={handleMileageChange}
              className="w-full h-2 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-emerald-500"
            />
            <div className="flex justify-between text-xs font-bold text-slate-400">
              <span>1.000 km</span>
              <span>50.000 km</span>
            </div>
          </div>
        </div>

        {/* Usage Ratio Section */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-emerald-50 rounded-2xl text-emerald-600">
                <Road className="w-6 h-6" />
              </div>
              <h2 className="text-2xl font-bold text-slate-900 tracking-tight leading-tight">
                Perfil de direção
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
                  <p>Isso impacta diretamente no cálculo de combustível e manutenção. Carros híbridos ou 1.0 são melhores para cidade, enquanto motores maiores performam melhor em estrada.</p>
                  <div className="absolute -bottom-2 left-6 w-4 h-4 bg-slate-900 rotate-45" />
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className={`p-4 rounded-3xl border-2 transition-all flex flex-col items-center gap-1 ${ratio >= 0.5 ? 'border-emerald-500 bg-emerald-50' : 'border-slate-100 bg-slate-50 opacity-60'}`}>
              <span className="text-2xl font-black text-slate-900">{Math.round(ratio * 100)}%</span>
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Cidade</span>
            </div>
            <div className={`p-4 rounded-3xl border-2 transition-all flex flex-col items-center gap-1 ${ratio < 0.5 ? 'border-emerald-500 bg-emerald-50' : 'border-slate-100 bg-slate-50 opacity-60'}`}>
              <span className="text-2xl font-black text-slate-900">{Math.round((1 - ratio) * 100)}%</span>
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Estrada</span>
            </div>
          </div>

          <div className="space-y-4">
            <input
              type="range"
              min={0}
              max={100}
              step={5}
              value={ratio * 100}
              onChange={handleRatioChange}
              className="w-full h-2 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-emerald-500"
            />
            <div className="flex items-center justify-center gap-2">
              <span className="text-sm font-bold text-slate-700">{usageProfile.icon} Perfil: {usageProfile.label}</span>
            </div>
          </div>
        </div>

        {/* Dynamic Insight */}
        <div className="bg-blue-50 rounded-3xl p-6 border border-blue-100 flex items-start gap-4">
          <div className="p-2 bg-white rounded-xl shadow-sm">
            <Info className="w-5 h-5 text-blue-500" />
          </div>
          <div className="space-y-1">
            <p className="text-sm font-bold text-blue-700">Sabia que?</p>
            <p className="text-xs text-blue-600/80 leading-relaxed">
              Com {mileage.toLocaleString()}km anuais, o custo de combustível pode variar até <span className="font-bold">40%</span> dependendo da sua escolha entre Flex, Diesel ou Elétrico.
            </p>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="pt-8 border-t border-slate-100 flex flex-col gap-6">
          <div className="flex items-center justify-between">
            <button
              onClick={onBack}
              className="flex items-center gap-2 text-slate-400 hover:text-slate-600 font-bold transition-colors"
            >
              <ChevronLeft className="w-5 h-5" />
              Voltar
            </button>
            
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
