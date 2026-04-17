import { useState, useCallback } from 'react';
import { MapPin, Settings, BadgeCheck, Check, ChevronLeft, Search, HelpCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { BRAZILIAN_STATES, VEHICLE_CATEGORIES, FUEL_TYPES } from '../lib/utils';
import type { BrazilianState, VehicleCategory, FuelType } from '../types/api';

interface LocationStepProps {
  initialState?: BrazilianState;
  initialCategory?: VehicleCategory;
  initialFuel?: FuelType;
  onBack: () => void;
  onSubmit: (data: { state: BrazilianState; category?: VehicleCategory; fuel?: FuelType }) => void;
  isLoading?: boolean;
}

export function LocationStep({
  initialState = 'SP',
  initialCategory,
  initialFuel,
  onBack,
  onSubmit,
  isLoading = false
}: LocationStepProps) {
  const [state, setState] = useState<BrazilianState>(initialState);
  const [category, setCategory] = useState<VehicleCategory | undefined>(initialCategory);
  const [fuel, setFuel] = useState<FuelType | undefined>(initialFuel);
  const [showTooltip, setShowTooltip] = useState(false);

  const handleSubmit = useCallback(() => {
    onSubmit({ state, category, fuel });
  }, [state, category, fuel, onSubmit]);

  return (
    <div className="w-full max-w-[480px]">
      {/* Header & Step Indicator */}
      <div className="mb-8 px-2">
        <div className="flex justify-between items-end mb-3">
          <span className="text-sm font-medium text-slate-500 uppercase tracking-wider">
            Passo 3 de 3
          </span>
          <span className="text-sm font-semibold text-emerald-600">
            Localização & Preferências
          </span>
        </div>
        <div className="h-1.5 w-full bg-slate-200 rounded-full overflow-hidden">
          <div 
            className="h-full bg-emerald-500 rounded-full transition-all duration-500"
            style={{ width: '100%' }}
          />
        </div>
      </div>

      {/* Main Card */}
      <div className="bg-white rounded-[32px] shadow-2xl shadow-slate-200/60 border border-slate-100 p-8 md:p-12 flex flex-col gap-10">
        
        {/* State Selection */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-emerald-50 rounded-2xl text-emerald-600">
                <MapPin className="w-6 h-6" />
              </div>
              <h2 className="text-2xl font-bold text-slate-900 tracking-tight leading-tight">
                Onde você mora?
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
                  <p>O estado influencia no valor do IPVA e também na disponibilidade regional de certos combustíveis (como o GNV ou Etanol).</p>
                  <div className="absolute -bottom-2 left-6 w-4 h-4 bg-slate-900 rotate-45" />
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div className="relative group">
            <select 
              value={state}
              onChange={(e) => setState(e.target.value as BrazilianState)}
              className="w-full h-16 px-6 bg-slate-50 border-2 border-slate-100 rounded-2xl font-bold text-slate-900 appearance-none focus:border-emerald-500 focus:bg-white transition-all outline-none cursor-pointer"
            >
              {BRAZILIAN_STATES.map((s) => (
                <option key={s.code} value={s.code}>{s.name} ({s.code})</option>
              ))}
            </select>
            <div className="absolute right-6 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400 group-hover:text-emerald-500 transition-colors">
              <Check className="w-5 h-5" />
            </div>
          </div>
        </div>

        {/* Preferences Section */}
        <div className="space-y-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-emerald-50 rounded-2xl text-emerald-600">
              <Settings className="w-6 h-6" />
            </div>
            <h2 className="text-2xl font-bold text-slate-900 tracking-tight leading-tight">
              Deseja filtrar algo?
            </h2>
          </div>

          <div className="space-y-4">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] block">Categoria</label>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setCategory(undefined)}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${!category ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-200' : 'bg-slate-50 text-slate-500 hover:bg-slate-100'}`}
              >
                Todas
              </button>
              {VEHICLE_CATEGORIES.map((cat) => (
                <button
                  key={cat.value}
                  onClick={() => setCategory(cat.value as VehicleCategory)}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${category === cat.value ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-200' : 'bg-slate-50 text-slate-500 hover:bg-slate-100'}`}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-4">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] block">Combustível</label>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setFuel(undefined)}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${!fuel ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-200' : 'bg-slate-50 text-slate-500 hover:bg-slate-100'}`}
              >
                Todos
              </button>
              {FUEL_TYPES.map((f) => (
                <button
                  key={f.value}
                  onClick={() => setFuel(f.value as FuelType)}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${fuel === f.value ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-200' : 'bg-slate-50 text-slate-500 hover:bg-slate-100'}`}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="pt-8 border-t border-slate-100 flex flex-col gap-6">
          <div className="flex items-center justify-between">
            <button
              onClick={onBack}
              disabled={isLoading}
              className="flex items-center gap-2 text-slate-400 hover:text-slate-600 font-bold transition-colors disabled:opacity-50"
            >
              <ChevronLeft className="w-5 h-5" />
              Voltar
            </button>
            
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleSubmit}
              disabled={isLoading}
              className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-8 py-4 rounded-2xl font-bold transition-all hover:shadow-lg hover:shadow-emerald-200 active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white" />
                  Calculando...
                </>
              ) : (
                <>
                  Finalizar
                  <Search className="w-5 h-5" />
                </>
              )}
            </motion.button>
          </div>
        </div>
      </div>

      {/* Brand Footer */}
      <div className="mt-8 text-center px-4">
        <div className="flex items-center justify-center gap-2 text-slate-400 mb-2">
          <BadgeCheck className="w-4 h-4 text-emerald-500" />
          <span className="text-[10px] font-medium uppercase tracking-widest">
            Algoritmo TCO verificado baseado em FIPE & INMETRO PBE
          </span>
        </div>
        <p className="text-sm font-semibold text-slate-400 tracking-tight">
          iMotors Consultant Wizard
        </p>
      </div>
    </div>
  );
}
