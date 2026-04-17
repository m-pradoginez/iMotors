import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, type Variants } from 'framer-motion';
import { 
  Fuel, 
  Shield, 
  Wrench, 
  TrendingDown, 
  ExternalLink, 
  ArrowLeft, 
  Award,
  Info,
  ChevronRight,
  Sparkles,
  Zap
} from 'lucide-react';
import { Button } from '../components/Button';
import { apiClient } from '../api/client';
import { formatCurrency, generateWebmotorsUrl, generateOlxUrl } from '../lib/utils';
import type { RecommendationResponse, RecommendationRequest } from '../types/api';

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: "easeOut" }
  }
};

export function TCOReport() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [response, setResponse] = useState<RecommendationResponse | null>(null);

  useEffect(() => {
    const fetchRecommendations = async () => {
      const storedRequest = sessionStorage.getItem('recommendationRequest');
      
      if (!storedRequest) {
        navigate('/');
        return;
      }

      try {
        const request: RecommendationRequest = JSON.parse(storedRequest);
        const data = await apiClient.getRecommendations(request);
        setResponse(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Erro ao buscar recomendações');
      } finally {
        setLoading(false);
      }
    };

    fetchRecommendations();
  }, [navigate]);

  if (loading) {
    return (
      <div className="min-h-[calc(100vh-80px)] flex items-center justify-center p-6">
        <div className="text-center space-y-6 max-w-sm">
          <div className="relative inline-block">
            <div className="absolute inset-0 bg-emerald-500 blur-2xl opacity-20 animate-pulse" />
            <div className="relative animate-spin rounded-full h-16 w-16 border-[3px] border-emerald-500 border-t-transparent mx-auto" />
          </div>
          <div className="space-y-2">
            <h2 className="text-xl font-black text-foreground tracking-tight">Analisando o mercado...</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Cruzando dados da Tabela FIPE e INMETRO para calcular o custo real de cada veículo.
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !response || response.recommendations.length === 0) {
    return (
      <div className="min-h-[calc(100vh-80px)] flex items-center justify-center p-6">
        <div className="glass-card p-12 text-center max-w-md space-y-6">
          <div className="p-4 rounded-full bg-red-500/10 text-red-500 w-fit mx-auto">
            <Info className="w-8 h-8" />
          </div>
          <div className="space-y-2">
            <h2 className="text-2xl font-black text-foreground tracking-tight">Ops! Algo deu errado.</h2>
            <p className="text-muted-foreground leading-relaxed">
              {error || 'Não encontramos veículos que atendam exatamente aos seus critérios atuais.'}
            </p>
          </div>
          <Button onClick={() => navigate('/consultancy')} variant="outline" className="w-full h-14 rounded-2xl">
            <ArrowLeft className="mr-2 h-5 w-5" />
            Ajustar minha busca
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-12 pb-32">
      {/* Header */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12"
      >
        <div className="space-y-2">
          <button 
            onClick={() => navigate('/consultancy')}
            className="flex items-center text-xs font-black text-emerald-500 uppercase tracking-widest hover:translate-x-[-4px] transition-transform mb-4"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Refinar Consultoria
          </button>
          <h1 className="text-4xl md:text-5xl font-black text-foreground tracking-tighter leading-none">
            As Melhores <span className="text-gradient">Oportunidades</span>
          </h1>
          <p className="text-muted-foreground text-lg leading-relaxed max-w-xl">
            Filtramos os veículos com o menor custo total mensal para o seu perfil.
          </p>
        </div>
        
        <div className="flex items-center space-x-2 bg-emerald-500/10 px-4 py-2 rounded-xl border border-emerald-500/20">
          <Zap className="h-4 w-4 text-emerald-500" />
          <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-tight">Cálculo TCO 100% Preciso</span>
        </div>
      </motion.div>

      {/* Recommendations Grid */}
      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="grid gap-8 lg:grid-cols-3"
      >
        {response.recommendations.map((rec, idx) => (
          <motion.div 
            key={rec.vehicle.fipe_code} 
            variants={itemVariants}
            className={`relative flex flex-col glass-card group transition-all duration-500 hover:shadow-2xl hover:shadow-emerald-500/10 ${
              idx === 0 ? 'border-emerald-500/40 ring-1 ring-emerald-500/20' : ''
            }`}
          >
            {/* Rank Badge */}
            <div className={`absolute -top-4 left-6 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-[0.2em] shadow-lg flex items-center space-x-2 ${
              idx === 0 ? 'bg-emerald-500 text-white' : 'bg-slate-800 text-white'
            }`}>
              {idx === 0 ? <Sparkles className="w-3 h-3" /> : <Award className="w-3 h-3" />}
              <span>#{rec.rank} Recomendação</span>
            </div>

            {/* Card Header */}
            <div className="p-8 pb-0 space-y-4">
              <div className="space-y-1">
                <p className="text-xs font-black text-muted-foreground uppercase tracking-widest">{rec.vehicle.brand}</p>
                <h3 className="text-3xl font-black text-foreground tracking-tighter leading-none group-hover:text-emerald-500 transition-colors">
                  {rec.vehicle.model}
                </h3>
                <div className="flex items-center space-x-3 pt-2">
                  <span className="text-xs font-bold text-slate-500 bg-muted px-2 py-1 rounded-md">{rec.vehicle.year}</span>
                  <span className="text-xs font-bold text-slate-500 bg-muted px-2 py-1 rounded-md capitalize">{rec.vehicle.fuel_type}</span>
                </div>
              </div>

              {/* TCO Highlights */}
              <div className="p-6 bg-muted/50 rounded-2xl space-y-2 border border-border/50">
                <p className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.15em]">Custo Mensal Estimado</p>
                <div className="flex items-baseline space-x-2">
                  <span className="text-4xl font-black text-foreground tracking-tighter">{formatCurrency(rec.tco_monthly)}</span>
                  <span className="text-sm font-bold text-emerald-500">/mês</span>
                </div>
              </div>
            </div>

            {/* Cost Breakdown */}
            <div className="p-8 flex-1 space-y-8">
              <div className="space-y-4">
                <h4 className="text-xs font-black text-foreground uppercase tracking-widest flex items-center">
                  <BarChart3 className="w-4 h-4 mr-2 text-emerald-500" />
                  Composição de Custos
                </h4>
                
                <div className="space-y-5">
                  {[
                    { label: 'Depreciação', value: rec.breakdown.depreciation_monthly, icon: TrendingDown, color: 'bg-slate-400' },
                    { label: 'Combustível', value: rec.breakdown.fuel_cost_monthly, icon: Fuel, color: 'bg-emerald-500' },
                    { label: 'IPVA & Taxas', value: rec.breakdown.ipva_monthly, icon: Shield, color: 'bg-blue-500' },
                    { label: 'Seguro', value: rec.breakdown.insurance_monthly, icon: Info, color: 'bg-indigo-500' },
                    { label: 'Manutenção', value: rec.breakdown.maintenance_monthly, icon: Wrench, color: 'bg-slate-500' },
                  ].map((item) => (
                    <div key={item.label} className="space-y-1.5">
                      <div className="flex justify-between text-[10px] font-bold uppercase tracking-wider">
                        <span className="text-muted-foreground flex items-center">
                          <item.icon className="w-3 h-3 mr-1.5" />
                          {item.label}
                        </span>
                        <span className="text-foreground">{formatCurrency(item.value)}</span>
                      </div>
                      <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
                        <motion.div 
                          className={`h-full ${item.color} rounded-full`}
                          initial={{ width: 0 }}
                          animate={{ width: `${(item.value / rec.tco_monthly) * 100}%` }}
                          transition={{ duration: 0.8, delay: 0.5 }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Action Links */}
              <div className="pt-8 border-t border-border flex flex-col gap-4">
                <a
                  href={generateWebmotorsUrl(rec.vehicle.brand, rec.vehicle.model, rec.vehicle.year)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full"
                >
                  <Button variant={idx === 0 ? 'default' : 'secondary'} className="w-full h-14 rounded-2xl group/btn">
                    Buscar no Webmotors
                    <ExternalLink className="ml-2 h-4 w-4 group-hover/btn:translate-x-1 group-hover/btn:-translate-y-1 transition-transform" />
                  </Button>
                </a>
                <a
                  href={generateOlxUrl(rec.vehicle.brand, rec.vehicle.model, rec.vehicle.year)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full"
                >
                  <Button variant="ghost" className="w-full h-12 rounded-xl text-xs uppercase tracking-widest font-black">
                    Ver no OLX
                    <ChevronRight className="ml-1 h-4 w-4" />
                  </Button>
                </a>
              </div>
            </div>
          </motion.div>
        ))}
      </motion.div>

      {/* Disclaimer */}
      <motion.div 
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        className="mt-20 p-8 glass-card border-emerald-500/10 bg-emerald-500/5 space-y-4 max-w-4xl mx-auto"
      >
        <div className="flex items-center space-x-3 text-emerald-500">
          <Info className="w-5 h-5" />
          <h3 className="font-bold text-foreground">Metodologia TCO iMotors</h3>
        </div>
        <p className="text-sm text-muted-foreground leading-relaxed">
          Os valores apresentados são estimativas baseadas em dados históricos de depreciação (Tabela FIPE), 
          índices oficiais de consumo (INMETRO PBE), alíquotas de IPVA estaduais e médias de mercado para seguros e manutenção. 
          O custo real pode variar dependendo do estado de conservação do veículo e negociações individuais.
        </p>
      </motion.div>
    </div>
  );
}

function BarChart3(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M3 3v18h18" />
      <path d="M18 17V9" />
      <path d="M13 17V5" />
      <path d="M8 17v-3" />
    </svg>
  );
}
