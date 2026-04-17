import { motion, type Variants } from 'framer-motion';
import { 
  TrendingDown, 
  Fuel, 
  Shield, 
  Wrench, 
  ArrowRight,
  ChevronRight,
  BarChart3
} from 'lucide-react';
import { Link } from 'react-router-dom';

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.2 }
  }
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] }
  }
};

export default function LandingPage() {
  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="relative pt-20 pb-32 overflow-hidden">
        {/* Background Elements */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-full -z-10">
          <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] bg-emerald-500/10 blur-[120px] rounded-full" />
          <div className="absolute bottom-[10%] left-[-10%] w-[40%] h-[40%] bg-blue-500/10 blur-[100px] rounded-full" />
        </div>

        <div className="container mx-auto px-4 text-center">
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="max-w-4xl mx-auto space-y-8"
          >
            <motion.div variants={itemVariants} className="inline-flex items-center space-x-2 px-4 py-2 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-sm font-bold tracking-tight">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span>Inteligência Automotiva Baseada em Dados</span>
            </motion.div>

            <motion.h1 
              variants={itemVariants}
              className="text-5xl md:text-7xl font-black text-foreground tracking-tighter leading-[1.1]"
            >
              Não compre apenas um carro, <br />
              <span className="text-gradient">invista na sua mobilidade.</span>
            </motion.h1>

            <motion.p 
              variants={itemVariants}
              className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed"
            >
              Descubra o custo real de propriedade (TCO) e encontre os veículos que melhor se adaptam ao seu orçamento mensal, considerando depreciação, combustível e manutenção.
            </motion.p>

            <motion.div 
              variants={itemVariants}
              className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4"
            >
              <Link 
                to="/consultancy"
                className="group w-full sm:w-auto flex items-center justify-center px-8 py-4 rounded-2xl bg-emerald-500 text-white font-bold text-lg shadow-xl shadow-emerald-500/25 hover:bg-emerald-600 hover:scale-105 transition-all"
              >
                Começar Consultoria
                <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </Link>
              <a 
                href="#tco-explainer"
                className="w-full sm:w-auto flex items-center justify-center px-8 py-4 rounded-2xl bg-secondary text-secondary-foreground font-bold text-lg hover:bg-secondary/80 transition-all"
              >
                O que é TCO?
              </a>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* TCO Visual Section */}
      <section id="tco-explainer" className="py-32 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div className="space-y-8">
              <div className="space-y-4">
                <h2 className="text-4xl font-black text-foreground tracking-tight leading-none">
                  Entenda o Iceberg dos <br /> Custos Automotivos
                </h2>
                <p className="text-lg text-muted-foreground leading-relaxed">
                  O preço de compra é apenas a ponta do iceberg. Nossa inteligência cruza dados da Tabela FIPE e INMETRO para revelar o custo invisível.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {[
                  { icon: TrendingDown, label: 'Depreciação', desc: 'Perda de valor anual baseada na FIPE' },
                  { icon: Fuel, label: 'Combustível', desc: 'Consumo real baseado no seu perfil de uso' },
                  { icon: Shield, label: 'IPVA & Seguro', desc: 'Estimativas precisas por estado e categoria' },
                  { icon: Wrench, label: 'Manutenção', desc: 'Reserva preventiva para cada modelo' }
                ].map((item, idx) => (
                  <div key={idx} className="glass-card p-6 space-y-3">
                    <div className="p-3 w-fit rounded-xl bg-emerald-500/10 text-emerald-500">
                      <item.icon className="h-6 w-6" />
                    </div>
                    <h3 className="font-bold text-foreground">{item.label}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">{item.desc}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="relative">
              <div className="absolute -inset-4 bg-emerald-500/20 blur-3xl rounded-full -z-10" />
              <div className="glass-card p-8 md:p-12 space-y-8 border-white/40 dark:border-white/5">
                <div className="flex items-center justify-between">
                  <h3 className="text-2xl font-black text-foreground">Exemplo TCO</h3>
                  <BarChart3 className="text-emerald-500" />
                </div>
                
                <div className="space-y-6">
                  {[
                    { label: 'Depreciação', value: 45, color: 'bg-emerald-500' },
                    { label: 'Combustível', value: 30, color: 'bg-blue-500' },
                    { label: 'Seguro & IPVA', value: 15, color: 'bg-indigo-500' },
                    { label: 'Manutenção', value: 10, color: 'bg-slate-400' }
                  ].map((bar, idx) => (
                    <div key={idx} className="space-y-2">
                      <div className="flex justify-between text-sm font-bold uppercase tracking-wider">
                        <span className="text-muted-foreground">{bar.label}</span>
                        <span className="text-foreground">{bar.value}%</span>
                      </div>
                      <div className="h-3 w-full bg-muted rounded-full overflow-hidden">
                        <motion.div 
                          initial={{ width: 0 }}
                          whileInView={{ width: `${bar.value}%` }}
                          transition={{ duration: 1, delay: idx * 0.1 }}
                          className={`h-full ${bar.color} rounded-full`}
                        />
                      </div>
                    </div>
                  ))}
                </div>

                <div className="pt-8 border-t border-border flex items-center justify-between">
                  <div className="space-y-1">
                    <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Gasto Mensal Real</p>
                    <p className="text-3xl font-black text-foreground">R$ 2.450</p>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] font-black text-emerald-500 uppercase tracking-widest bg-emerald-500/10 px-3 py-1 rounded-full">SUV Compacto</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Trust & Stats */}
      <section className="py-24">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { label: 'Veículos', value: '1.200+' },
              { label: 'Dados FIPE', value: 'Atualizados' },
              { label: 'Inmetro PBE', value: '2024 V1' },
              { label: 'Precisão', value: '98%' }
            ].map((stat, idx) => (
              <div key={idx} className="text-center space-y-2">
                <p className="text-4xl font-black text-foreground tracking-tighter">{stat.value}</p>
                <p className="text-sm font-bold text-muted-foreground uppercase tracking-widest">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-32 relative">
        <div className="container mx-auto px-4 max-w-5xl">
          <div className="bg-emerald-600 rounded-[40px] p-12 md:p-20 overflow-hidden relative shadow-2xl shadow-emerald-500/20">
            <div className="absolute top-0 right-0 w-1/2 h-full bg-emerald-500/20 skew-x-12 translate-x-1/2" />
            
            <div className="relative z-10 text-center space-y-8">
              <h2 className="text-4xl md:text-5xl font-black text-white tracking-tight">
                Pronto para encontrar seu <br /> próximo carro?
              </h2>
              <p className="text-emerald-100 text-lg max-w-xl mx-auto">
                Leva menos de 2 minutos. Gratuito, rápido e baseado 100% em dados oficiais.
              </p>
              <div className="pt-4">
                <Link 
                  to="/consultancy"
                  className="inline-flex items-center justify-center px-10 py-5 rounded-2xl bg-white text-emerald-600 font-black text-xl hover:scale-105 transition-all shadow-xl"
                >
                  Começar agora
                  <ChevronRight className="ml-2 h-6 w-6" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
