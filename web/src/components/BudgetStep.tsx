import { useState, useCallback } from 'react';
import { Wallet, BadgeCheck, ChevronRight } from 'lucide-react';
import { Button } from './Button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './Card';
import { cn, formatCurrency } from '../lib/utils';

interface BudgetStepProps {
  initialValue?: number;
  onNext: (budget: number) => void;
}

const MIN_BUDGET = 500;
const MAX_BUDGET = 10000;
const STEP = 100;

export function BudgetStep({ initialValue = 2500, onNext }: BudgetStepProps) {
  const [budget, setBudget] = useState(initialValue);

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

  const percentage = ((budget - MIN_BUDGET) / (MAX_BUDGET - MIN_BUDGET)) * 100;

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-xl font-semibold text-slate-900 tracking-tight">
            iMotors Consultant Wizard
          </h1>
        </div>

        {/* Step Indicator */}
        <div className="mb-8">
          <p className="text-sm text-slate-500 mb-2">
            Step 1 of 3: O Orçamento
          </p>
          <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-emerald-600 rounded-full transition-all duration-300"
              style={{ width: '33%' }}
            />
          </div>
        </div>

        {/* Main Card */}
        <Card className="bg-white border-slate-200 shadow-lg">
          <CardHeader className="pb-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-emerald-100 text-emerald-600">
                <Wallet className="h-6 w-6" />
              </div>
              <CardTitle className="text-2xl font-bold text-slate-900">
                1. Qual é o seu limite de custo mensal total?
              </CardTitle>
            </div>
            <CardDescription className="text-slate-500 ml-14">
              Defina o valor máximo que você pode investir mensalmente no seu veículo
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">
            {/* Synchronized Budget Control */}
            <div className="space-y-4">
              {/* Numeric Input */}
              <div className="flex items-center justify-center">
                <div className="relative">
                  <input
                    type="text"
                    inputMode="numeric"
                    value={formatCurrency(budget)}
                    onChange={handleInputChange}
                    className={cn(
                      'w-48 text-center text-3xl font-bold text-slate-900',
                      'bg-slate-50 border-2 border-slate-200 rounded-xl',
                      'px-4 py-3 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20',
                      'transition-all duration-200'
                    )}
                  />
                </div>
              </div>

              {/* Slider */}
              <div className="px-2">
                <div className="relative h-2 bg-slate-200 rounded-full">
                  <div
                    className="absolute h-full bg-emerald-600 rounded-full transition-all duration-150"
                    style={{ width: `${percentage}%` }}
                  />
                  <input
                    type="range"
                    min={MIN_BUDGET}
                    max={MAX_BUDGET}
                    step={STEP}
                    value={budget}
                    onChange={handleSliderChange}
                    className="absolute w-full h-full top-0 opacity-0 cursor-pointer"
                    aria-label="Limite de custo mensal"
                  />
                  <div
                    className="absolute h-5 w-5 bg-emerald-600 rounded-full border-2 border-white shadow-md -top-1.5 transition-all duration-150 pointer-events-none"
                    style={{ left: `calc(${percentage}% - 10px)` }}
                  />
                </div>
                <div className="flex justify-between mt-2 text-sm text-slate-400">
                  <span>{formatCurrency(MIN_BUDGET)}</span>
                  <span>{formatCurrency(MAX_BUDGET)}</span>
                </div>
              </div>

              {/* Context Text */}
              <p className="text-sm text-slate-500 text-center">
                Inclui: Combustível, IPVA, Seguro, Manutenção, Depreciação
              </p>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between pt-4 border-t border-slate-100">
              {/* Verified Badge */}
              <div className="flex items-center gap-2 text-xs text-slate-400">
                <BadgeCheck className="h-4 w-4 text-emerald-600" />
                <span>Verified TCO algorithm based on FIPE & INMETRO PBE datasets</span>
              </div>

              {/* Next Button */}
              <Button
                onClick={handleNext}
                className="bg-emerald-600 hover:bg-emerald-700 text-white px-6"
              >
                Próximo
                <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
