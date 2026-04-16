import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/Button';
import { Select } from '../components/Select';
import { Slider } from '../components/Slider';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/Card';
import { BRAZILIAN_STATES, VEHICLE_CATEGORIES, FUEL_TYPES, formatCurrency } from '../lib/utils';
import type { RecommendationRequest, BrazilianState, VehicleCategory, FuelType } from '../types/api';

export function ConstraintForm() {
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
    
    // Store form data in sessionStorage to pass to report page
    sessionStorage.setItem('recommendationRequest', JSON.stringify(formData));
    
    // Navigate to report page
    navigate('/report');
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <Card>
        <CardHeader>
          <CardTitle>Encontre seu carro ideal</CardTitle>
          <CardDescription>
            Preencha suas preferências e descubra os melhores veículos baseado no Custo Total de Propriedade (TCO)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-4">
              <Slider
                label="Orçamento mensal"
                value={formData.budget_monthly}
                min={500}
                max={10000}
                step={100}
                onChange={(value) => setFormData({ ...formData, budget_monthly: value })}
                formatValue={(v) => formatCurrency(v)}
                helperText="Inclui combustível, IPVA, seguro, manutenção e depreciação"
              />

              <Slider
                label="Quilometragem anual"
                value={formData.mileage_annual_km}
                min={1000}
                max={50000}
                step={1000}
                onChange={(value) => setFormData({ ...formData, mileage_annual_km: value })}
                formatValue={(v) => `${(v / 1000).toFixed(0)}k km/ano`}
              />

              <Slider
                label="Percentual de uso na cidade"
                value={Math.round(formData.city_highway_ratio * 100)}
                min={0}
                max={100}
                step={5}
                onChange={(value) => setFormData({ ...formData, city_highway_ratio: value / 100 })}
                formatValue={(v) => `${v}%`}
                helperText="O restante será considerado uso em estrada"
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Select
                  label="Estado"
                  value={formData.state}
                  onChange={(e) => setFormData({ ...formData, state: e.target.value as BrazilianState })}
                  options={BRAZILIAN_STATES.map(s => ({ value: s.code, label: `${s.code} - ${s.name}` }))}
                  required
                />

                <Select
                  label="Categoria (opcional)"
                  value={formData.category || ''}
                  onChange={(e) => setFormData({ ...formData, category: (e.target.value as VehicleCategory) || undefined })}
                  options={[...VEHICLE_CATEGORIES]}
                  placeholder="Todas as categorias"
                />
              </div>

              <Select
                label="Combustível preferido (opcional)"
                value={formData.fuel_preference || ''}
                onChange={(e) => setFormData({ ...formData, fuel_preference: (e.target.value as FuelType) || undefined })}
                options={[...FUEL_TYPES]}
                placeholder="Qualquer combustível"
              />
            </div>

            <Button
              type="submit"
              size="lg"
              className="w-full"
              isLoading={isLoading}
            >
              Buscar recomendações
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
