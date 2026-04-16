import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, type Variants } from 'framer-motion';
import { 
  Wallet, 
  Gauge, 
  MapPin, 
  Car, 
  Fuel, 
  Search,
  ChevronDown,
  Building2,
  Road
} from 'lucide-react';
import { ThemeToggle } from '../components/ThemeToggle';
import { BRAZILIAN_STATES, VEHICLE_CATEGORIES, FUEL_TYPES, formatCurrency } from '../lib/utils';
import type { RecommendationRequest, BrazilianState, VehicleCategory, FuelType } from '../types/api';

// Animation variants
const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.1
    }
  }
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4 }
  }
};

interface SliderWithInputProps {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  onChange: (value: number) => void;
  formatValue?: (value: number) => string;
  icon: React.ReactNode;
  helperText?: string;
}

function SliderWithInput({ label, value, min, max, step, onChange, formatValue, icon, helperText }: SliderWithInputProps) {
  const displayValue = formatValue ? formatValue(value) : value.toString();
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const numValue = parseInt(e.target.value.replace(/\D/g, ''), 10) || min;
    const clamped = Math.max(min, Math.min(max, numValue));
    onChange(clamped);
  };

  const percentage = ((value - min) / (max - min)) * 100;

  return (
    <div className="glass-card p-5 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <div className="p-2 rounded-lg bg-primary/10 text-primary">
            {icon}
          </div>
          <span className="font-semibold text-foreground">{label}</span>
        </div>
        <div className="flex items-center space-x-2">
          <input
            type="text"
            value={displayValue}
            onChange={handleInputChange}
            className="w-28 text-right px-2 py-1 text-sm font-semibold bg-transparent border-b border-border focus:border-primary focus:outline-none transition-colors"
          />
        </div>
      </div>
      
      <div className="relative pt-1">
        <div className="relative h-2 bg-muted rounded-full overflow-hidden">
          <motion.div 
            className="absolute h-full bg-gradient-to-r from-primary to-primary-light rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${percentage}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          className="absolute w-full h-full top-0 opacity-0 cursor-pointer"
        />
        <div className="flex justify-between mt-1 text-xs text-muted-foreground">
          <span>{formatValue ? formatValue(min) : min}</span>
          <span>{formatValue ? formatValue(max) : max}</span>
        </div>
      </div>
      
      {helperText && (
        <p className="text-xs text-muted-foreground">{helperText}</p>
      )}
    </div>
  );
}

interface CustomSelectProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: { value: string; label: string }[];
  placeholder?: string;
  icon: React.ReactNode;
}

function CustomSelect({ label, value, onChange, options, placeholder, icon }: CustomSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const selected = options.find(o => o.value === value);

  return (
    <div className="relative">
      <div className="glass-card p-4">
        <div className="flex items-center space-x-2 mb-2">
          <div className="p-1.5 rounded-md bg-primary/10 text-primary">
            {icon}
          </div>
          <span className="text-sm font-medium text-muted-foreground">{label}</span>
        </div>
        
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="w-full flex items-center justify-between p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
        >
          <span className="font-semibold text-foreground">
            {selected?.label || placeholder || 'Selecionar...'}
          </span>
          <ChevronDown className={`h-5 w-5 text-muted-foreground transition-transform ${isOpen ? 'rotate-180' : ''}`} />
        </button>
      </div>
      
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className="absolute z-50 w-full mt-1 glass-card max-h-60 overflow-auto"
        >
          {options.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => {
                onChange(option.value);
                setIsOpen(false);
              }}
              className={`w-full text-left px-4 py-3 hover:bg-muted/50 transition-colors ${
                value === option.value ? 'bg-primary/10 text-primary' : ''
              }`}
            >
              {option.label}
            </button>
          ))}
        </motion.div>
      )}
      
      {isOpen && (
        <div 
          className="fixed inset-0 z-40" 
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  );
}

export function ConsultantForm() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState<RecommendationRequest>({
    budget_monthly: 2500,
    mileage_annual_km: 15000,
    city_highway_ratio: 0.6,
    state: 'SP',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    sessionStorage.setItem('recommendationRequest', JSON.stringify(formData));
    
    setTimeout(() => {
      navigate('/report');
    }, 500);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 via-slate-50 to-slate-200 dark:from-slate-900 dark:via-slate-800 dark:to-slate-950 py-8 px-4">
      <motion.div 
        className="max-w-2xl mx-auto"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Header */}
        <motion.div variants={itemVariants} className="text-center mb-8">
          <div className="flex items-center justify-between mb-6">
            <div className="w-10" /> {/* Spacer for alignment */}
            <div className="inline-flex items-center justify-center p-3 rounded-2xl bg-primary/10">
              <Car className="h-8 w-8 text-primary" />
            </div>
            <ThemeToggle />
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">
            Encontre seu carro ideal
          </h1>
          <p className="text-muted-foreground text-lg">
            Consultoria especializada em TCO (Custo Total de Propriedade)
          </p>
        </motion.div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <motion.div variants={itemVariants}>
            <SliderWithInput
              label="Orçamento mensal"
              value={formData.budget_monthly}
              min={500}
              max={10000}
              step={100}
              onChange={(value) => setFormData({ ...formData, budget_monthly: value })}
              formatValue={formatCurrency}
              icon={<Wallet className="h-5 w-5" />}
              helperText="Inclui: combustível, IPVA, seguro, manutenção e depreciação"
            />
          </motion.div>

          <motion.div variants={itemVariants}>
            <SliderWithInput
              label="Quilometragem anual"
              value={formData.mileage_annual_km}
              min={1000}
              max={50000}
              step={1000}
              onChange={(value) => setFormData({ ...formData, mileage_annual_km: value })}
              formatValue={(v) => `${(v / 1000).toFixed(0)}.000 km`}
              icon={<Gauge className="h-5 w-5" />}
              helperText="Estimativa de km rodados por ano"
            />
          </motion.div>

          <motion.div variants={itemVariants}>
            <div className="glass-card p-5">
              <div className="flex items-center space-x-2 mb-4">
                <div className="p-2 rounded-lg bg-primary/10 text-primary">
                  <Road className="h-5 w-5" />
                </div>
                <span className="font-semibold text-foreground">Perfil de uso</span>
              </div>
              
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-2">
                  <Building2 className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">Cidade</span>
                </div>
                <span className="text-sm font-semibold text-foreground">
                  {Math.round(formData.city_highway_ratio * 100)}%
                </span>
                <div className="flex items-center space-x-2">
                  <Road className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">Estrada</span>
                </div>
              </div>
              
              <div className="relative pt-1">
                <div className="relative h-2 bg-muted rounded-full overflow-hidden">
                  <motion.div 
                    className="absolute h-full bg-gradient-to-r from-emerald-500 to-primary rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: `${formData.city_highway_ratio * 100}%` }}
                    transition={{ duration: 0.3 }}
                  />
                </div>
                <input
                  type="range"
                  min={0}
                  max={100}
                  step={5}
                  value={Math.round(formData.city_highway_ratio * 100)}
                  onChange={(e) => setFormData({ ...formData, city_highway_ratio: Number(e.target.value) / 100 })}
                  className="absolute w-full h-full top-0 opacity-0 cursor-pointer"
                />
              </div>
            </div>
          </motion.div>

          <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <CustomSelect
              label="Estado"
              value={formData.state}
              onChange={(value) => setFormData({ ...formData, state: value as BrazilianState })}
              options={BRAZILIAN_STATES.map(s => ({ value: s.code, label: s.name }))}
              placeholder="Selecione o estado"
              icon={<MapPin className="h-4 w-4" />}
            />

            <CustomSelect
              label="Categoria (opcional)"
              value={formData.category || ''}
              onChange={(value) => setFormData({ ...formData, category: (value as VehicleCategory) || undefined })}
              options={[{ value: '', label: 'Todas as categorias' }, ...VEHICLE_CATEGORIES]}
              placeholder="Todas as categorias"
              icon={<Car className="h-4 w-4" />}
            />
          </motion.div>

          <motion.div variants={itemVariants}>
            <CustomSelect
              label="Combustível preferido (opcional)"
              value={formData.fuel_preference || ''}
              onChange={(value) => setFormData({ ...formData, fuel_preference: (value as FuelType) || undefined })}
              options={[{ value: '', label: 'Qualquer combustível' }, ...FUEL_TYPES]}
              placeholder="Qualquer combustível"
              icon={<Fuel className="h-4 w-4" />}
            />
          </motion.div>

          <motion.div variants={itemVariants}>
            <motion.button
              type="submit"
              disabled={isLoading}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="w-full py-4 px-6 rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-600 text-white font-semibold text-lg shadow-lg shadow-emerald-500/25 hover:shadow-emerald-500/40 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
            >
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white" />
                  <span>Buscando...</span>
                </>
              ) : (
                <>
                  <Search className="h-5 w-5" />
                  <span>Buscar recomendações</span>
                </>
              )}
            </motion.button>
          </motion.div>
        </form>

        {/* Trust Indicators */}
        <motion.div 
          variants={itemVariants}
          className="mt-8 grid grid-cols-3 gap-4 text-center"
        >
          <div className="glass-card p-4">
            <p className="text-2xl font-bold text-primary">100+</p>
            <p className="text-xs text-muted-foreground">Veículos catalogados</p>
          </div>
          <div className="glass-card p-4">
            <p className="text-2xl font-bold text-primary">5</p>
            <p className="text-xs text-muted-foreground">Componentes TCO</p>
          </div>
          <div className="glass-card p-4">
            <p className="text-2xl font-bold text-primary">FIPE</p>
            <p className="text-xs text-muted-foreground">Preços atualizados</p>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}
