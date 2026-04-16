import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Car, Fuel, Shield, Wrench, TrendingDown, ExternalLink, ArrowLeft, Award } from 'lucide-react';
import { Button } from '../components/Button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/Card';
import { apiClient } from '../api/client';
import { formatCurrency, generateWebmotorsUrl, generateOlxUrl } from '../lib/utils';
import type { RecommendationResponse, RecommendationRequest } from '../types/api';

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
      <div className="container mx-auto px-4 py-16 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Calculando as melhores opções...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <Card className="border-danger">
          <CardHeader>
            <CardTitle className="text-danger">Erro</CardTitle>
            <CardDescription>{error}</CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => navigate('/')} variant="outline">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Voltar ao formulário
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!response || response.recommendations.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <Card>
          <CardHeader>
            <CardTitle>Nenhuma recomendação encontrada</CardTitle>
            <CardDescription>
              Não encontramos veículos que atendam aos seus critérios. Tente ajustar seu orçamento ou filtros.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => navigate('/')} variant="outline">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Voltar ao formulário
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <Button onClick={() => navigate('/')} variant="ghost" className="mb-4">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Nova busca
        </Button>
        <h1 className="text-3xl font-bold text-foreground mb-2">Top 3 Recomendações</h1>
        <p className="text-muted-foreground">
          Baseado no Custo Total de Propriedade (TCO) mensal
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {response.recommendations.map((rec) => (
          <Card key={rec.vehicle.fipe_code} className="flex flex-col">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between mb-2">
                <span className={`
                  inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                  ${rec.rank === 1 ? 'bg-success/10 text-success' : ''}
                  ${rec.rank === 2 ? 'bg-warning/10 text-warning' : ''}
                  ${rec.rank === 3 ? 'bg-secondary/10 text-secondary' : ''}
                `}>
                  <Award className="mr-1 h-3 w-3" />
                  #{rec.rank} Recomendado
                </span>
                <span className="text-xs text-muted-foreground capitalize">
                  {rec.vehicle.fuel_type}
                </span>
              </div>
              <CardTitle className="text-xl">
                {rec.vehicle.brand} {rec.vehicle.model}
              </CardTitle>
              <CardDescription>
                {rec.vehicle.year} • {rec.vehicle.match_confidence === 'exact' ? 'Dados completos' : 'Dados parciais'}
              </CardDescription>
            </CardHeader>
            <CardContent className="flex-1 space-y-4">
              <div className="text-center p-4 bg-muted rounded-lg">
                <p className="text-sm text-muted-foreground mb-1">Custo mensal total</p>
                <p className="text-3xl font-bold text-primary">
                  {formatCurrency(rec.tco_monthly)}
                </p>
              </div>

              <div className="space-y-2">
                <h4 className="text-sm font-medium text-foreground">Detalhamento mensal:</h4>
                
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center text-muted-foreground">
                    <TrendingDown className="mr-2 h-4 w-4" />
                    Depreciação
                  </div>
                  <span>{formatCurrency(rec.breakdown.depreciation_monthly)}</span>
                </div>

                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center text-muted-foreground">
                    <Fuel className="mr-2 h-4 w-4" />
                    Combustível
                  </div>
                  <span>{formatCurrency(rec.breakdown.fuel_cost_monthly)}</span>
                </div>

                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center text-muted-foreground">
                    <Car className="mr-2 h-4 w-4" />
                    IPVA
                  </div>
                  <span>{formatCurrency(rec.breakdown.ipva_monthly)}</span>
                </div>

                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center text-muted-foreground">
                    <Shield className="mr-2 h-4 w-4" />
                    Seguro
                  </div>
                  <span>{formatCurrency(rec.breakdown.insurance_monthly)}</span>
                </div>

                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center text-muted-foreground">
                    <Wrench className="mr-2 h-4 w-4" />
                    Manutenção
                  </div>
                  <span>{formatCurrency(rec.breakdown.maintenance_monthly)}</span>
                </div>
              </div>

              <div className="pt-4 space-y-2 border-t border-border">
                <a
                  href={generateWebmotorsUrl(rec.vehicle.brand, rec.vehicle.model, rec.vehicle.year)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block"
                >
                  <Button variant="outline" className="w-full" size="sm">
                    Ver no Webmotors
                    <ExternalLink className="ml-2 h-4 w-4" />
                  </Button>
                </a>
                <a
                  href={generateOlxUrl(rec.vehicle.brand, rec.vehicle.model, rec.vehicle.year)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block"
                >
                  <Button variant="ghost" className="w-full" size="sm">
                    Ver no OLX
                    <ExternalLink className="ml-2 h-4 w-4" />
                  </Button>
                </a>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="mt-12 p-6 bg-muted rounded-lg">
        <h3 className="text-lg font-semibold mb-2">Sobre o Cálculo TCO</h3>
        <p className="text-sm text-muted-foreground">
          O Custo Total de Propriedade (TCO) inclui todos os custos mensais estimados: 
          depreciação do veículo, combustível baseado na sua quilometragem e perfil de uso, 
          IPVA proporcional, seguro estimado e reserva para manutenção. 
          Os preços de veículos são baseados na tabela FIPE.
        </p>
      </div>
    </div>
  );
}
