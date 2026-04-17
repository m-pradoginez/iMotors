import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Wallet, 
  Gauge, 
  MapPin, 
  Car, 
  Fuel, 
  Search,
  ChevronRight,
  ChevronLeft,
  Building2,
  Road,
  Sparkles,
  CheckCircle2
} from 'lucide-react';
import { PremiumSlider } from '../components/PremiumSlider';
import { PremiumSelect } from '../components/PremiumSelect';
import { Button } from '../components/Button';
import { BRAZILIAN_STATES, VEHICLE_CATEGORIES, FUEL_TYPES, formatCurrency } from '../lib/utils';
import type { RecommendationRequest, BrazilianState, VehicleCategory, FuelType } from '../types/api';

const steps = [
  { id: 'budget', title: 'Orçamento & Uso', icon: Wallet },
  { id: 'profile', title: 'Perfil & Estilo', icon: Car },
  { id: 'location', title: 'Localização', icon: MapPin },
];

const slideVariants = {
  enter: (direction: number) => ({
    x: direction > 0 ? 50 : -50,
    opacity: 0
  }),
  center: {
    zIndex: 1,
    x: 0,
    opacity: 1
  },
  exit: (direction: number) => ({
    zIndex: 0,
    x: direction < 0 ? 50 : -50,
    opacity: 0
  })
};

export function ConsultantForm() {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(0);
  const [direction, setDirection] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  
  const [formData, setFormData] = useState<RecommendationRequest>({
    budget_monthly: 2500,
    mileage_annual_km: 15000,
    city_highway_ratio: 0.6,
    state: 'SP',
  });

  const nextStep = () => {
    if (currentStep < steps.length - 1) {
      setDirection(1);
      setCurrentStep(prev => prev + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setDirection(-1);
      setCurrentStep(prev => prev - 1);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    sessionStorage.setItem('recommendationRequest', JSON.stringify(formData));
    
    // Simulate processing for "premium" feel
    setTimeout(() => {
      navigate('/report');
    }, 1500);
  };

  return (
    <div className="min-h-[calc(100vh-80px)] pt-12 pb-24 px-4 relative overflow-hidden">
      {/* Background Decorative Elements */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-4xl h-full -z-10">
        <div className="absolute top-10 left-10 w-64 h-64 bg-emerald-500/5 blur-[100px] rounded-full" />
        <div className="absolute bottom-10 right-10 w-64 h-64 bg-blue-500/5 blur-[100px] rounded-full" />
      </div>

      <div className="max-w-3xl mx-auto space-y-12">
        {/* Progress Header */}
        <div className="space-y-6">
          <div className="flex justify-between items-center px-2">
            {steps.map((step, idx) => (
              <div 
                key={step.id} 
                className={`flex flex-col items-center space-y-2 transition-all duration-500 ${
                  idx <= currentStep ? 'opacity-100' : 'opacity-30'
                }`}
              >
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${
                  idx === currentStep 
                    ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20 scale-110' 
                    : idx < currentStep 
                      ? 'bg-emerald-500/20 text-emerald-600'
                      : 'bg-muted text-muted-foreground'
                }`}>
                  {idx < currentStep ? <CheckCircle2 className="w-6 h-6" /> : <step.icon className="w-5 h-5" />}
                </div>
                <span className="text-[10px] font-black uppercase tracking-widest text-foreground">
                  {step.title}
                </span>
              </div>
            ))}
          </div>
          <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
            <motion.div 
              className="h-full bg-emerald-500 rounded-full"
              initial={{ width: '0%' }}
              animate={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
              transition={{ duration: 0.5, ease: "circOut" }}
            />
          </div>
        </div>

        {/* Form Container */}
        <div className="relative">
          <AnimatePresence mode="wait" custom={direction}>
            <motion.div
              key={currentStep}
              custom={direction}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
              className="space-y-8"
            >
              {currentStep === 0 && (
                <div className="space-y-6">
                  <div className="space-y-2">
                    <h2 className="text-3xl font-black text-foreground tracking-tight">Qual seu potencial de investimento?</h2>
                    <p className="text-muted-foreground leading-relaxed">Defina quanto você planeja gastar mensalmente com seu novo veículo.</p>
                  </div>
                  
                  <PremiumSlider
                    label="Orçamento mensal"
                    value={formData.budget_monthly}
                    min={500}
                    max={10000}
                    step={100}
                    onChange={(v) => setFormData({ ...formData, budget_monthly: v })}
                    formatValue={formatCurrency}
                    icon={<Wallet className="h-5 w-5" />}
                    helperText="Inclui parcelas, combustível, seguro e manutenção"
                  />

                  <PremiumSlider
                    label="Uso anual estimado"
                    value={formData.mileage_annual_km}
                    min={1000}
                    max={50000}
                    step={1000}
                    onChange={(v) => setFormData({ ...formData, mileage_annual_km: v })}
                    formatValue={(v) => `${(v / 1000).toFixed(0)}.000 km`}
                    icon={<Gauge className="h-5 w-5" />}
                    helperText="Média de quilometragem rodada por ano"
                  />

                  <div className="p-6 bg-emerald-500/5 border border-emerald-500/10 rounded-2xl flex items-start space-x-4">
                    <div className="p-2 rounded-lg bg-white dark:bg-slate-900 shadow-sm">
                      <Sparkles className="h-5 w-5 text-emerald-500" />
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm font-bold text-foreground">Dica de Especialista</p>
                      <p className="text-xs text-muted-foreground leading-relaxed">
                        Um orçamento de <span className="text-emerald-500 font-bold">{formatCurrency(formData.budget_monthly)}</span> permite manter com tranquilidade veículos de até <span className="text-foreground font-bold">{formatCurrency(formData.budget_monthly * 48)}</span> de valor de mercado.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {currentStep === 1 && (
                <div className="space-y-6">
                  <div className="space-y-2">
                    <h2 className="text-3xl font-black text-foreground tracking-tight">Qual o seu estilo de condução?</h2>
                    <p className="text-muted-foreground leading-relaxed">Isso nos ajuda a calcular o consumo de combustível e a depreciação ideal.</p>
                  </div>

                  <div className="glass-card p-6 space-y-6">
                    <div className="flex items-center space-x-3">
                      <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-500">
                        <Road className="h-5 w-5" />
                      </div>
                      <span className="font-bold text-foreground tracking-tight">Perfil de Uso (Cidade vs. Estrada)</span>
                    </div>

                    <div className="space-y-8">
                      <div className="relative pt-2">
                        <div className="relative h-3 bg-muted rounded-full overflow-hidden">
                          <motion.div 
                            className="absolute h-full bg-gradient-to-r from-emerald-500 to-blue-500 rounded-full"
                            animate={{ width: `${formData.city_highway_ratio * 100}%` }}
                          />
                        </div>
                        <input
                          type="range"
                          min={0}
                          max={100}
                          step={5}
                          value={formData.city_highway_ratio * 100}
                          onChange={(e) => setFormData({ ...formData, city_highway_ratio: Number(e.target.value) / 100 })}
                          className="absolute w-full h-full top-0 opacity-0 cursor-pointer z-10"
                        />
                      </div>
                      
                      <div className="flex justify-between items-center">
                        <div className="flex flex-col items-start">
                          <div className="flex items-center space-x-2 text-emerald-500">
                            <Building2 className="w-4 h-4" />
                            <span className="text-xs font-black uppercase tracking-widest">Predominante Urbano</span>
                          </div>
                          <span className="text-2xl font-black text-foreground">{Math.round(formData.city_highway_ratio * 100)}%</span>
                        </div>
                        <div className="flex flex-col items-end">
                          <div className="flex items-center space-x-2 text-blue-500">
                            <span className="text-xs font-black uppercase tracking-widest">Predominante Rodoviário</span>
                            <Road className="w-4 h-4" />
                          </div>
                          <span className="text-2xl font-black text-foreground">{Math.round((1 - formData.city_highway_ratio) * 100)}%</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <PremiumSelect
                    label="Categoria do Veículo"
                    value={formData.category || ''}
                    onChange={(v) => setFormData({ ...formData, category: (v as VehicleCategory) || undefined })}
                    options={[{ value: '', label: 'Qualquer Categoria' }, ...VEHICLE_CATEGORIES]}
                    icon={<Car className="h-5 w-5" />}
                    placeholder="Selecione uma preferência"
                  />
                </div>
              )}

              {currentStep === 2 && (
                <div className="space-y-6">
                  <div className="space-y-2">
                    <h2 className="text-3xl font-black text-foreground tracking-tight">Detalhes finais</h2>
                    <p className="text-muted-foreground leading-relaxed">Sua localização influencia no IPVA e os preços regionais.</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <PremiumSelect
                      label="Estado de Registro"
                      value={formData.state}
                      onChange={(v) => setFormData({ ...formData, state: v as BrazilianState })}
                      options={BRAZILIAN_STATES.map(s => ({ value: s.code, label: s.name }))}
                      icon={<MapPin className="h-5 w-5" />}
                    />

                    <PremiumSelect
                      label="Tipo de Combustível"
                      value={formData.fuel_preference || ''}
                      onChange={(v) => setFormData({ ...formData, fuel_preference: (v as FuelType) || undefined })}
                      options={[{ value: '', label: 'Qualquer um' }, ...FUEL_TYPES]}
                      icon={<Fuel className="h-5 w-5" />}
                    />
                  </div>

                  <div className="glass-card p-8 text-center space-y-6 border-emerald-500/20 bg-emerald-500/5">
                    <div className="inline-flex p-4 rounded-3xl bg-emerald-500 text-white shadow-xl shadow-emerald-500/20">
                      <Sparkles className="w-8 h-8" />
                    </div>
                    <div className="space-y-2">
                      <h3 className="text-xl font-bold text-foreground">Tudo Pronto!</h3>
                      <p className="text-sm text-muted-foreground max-w-sm mx-auto leading-relaxed">
                        Nossa IA vai cruzar mais de 1.200 modelos para encontrar as 3 melhores opções de TCO para você.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-8 border-t border-border">
          <Button
            variant="ghost"
            onClick={prevStep}
            className={`w-full sm:w-auto ${currentStep === 0 ? 'invisible' : ''}`}
          >
            <ChevronLeft className="mr-2 h-5 w-5" />
            Voltar
          </Button>

          {currentStep === steps.length - 1 ? (
            <Button
              variant="premium"
              onClick={handleSubmit}
              isLoading={isLoading}
              className="w-full sm:w-auto h-16 px-12 text-lg rounded-[24px]"
            >
              <Search className="mr-2 h-5 w-5" />
              Ver Recomendações
            </Button>
          ) : (
            <Button
              onClick={nextStep}
              className="w-full sm:w-auto h-16 px-12 text-lg rounded-[24px]"
            >
              Continuar
              <ChevronRight className="ml-2 h-5 w-5" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
