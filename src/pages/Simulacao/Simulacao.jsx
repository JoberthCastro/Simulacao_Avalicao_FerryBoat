import { useState } from 'react';
import { compareReservationVsNoReservation } from '../../utils/simulation';
import Card from '../../components/Card/Card';
import Input from '../../components/Input/Input';
import Select from '../../components/Select/Select';
import Button from '../../components/Button/Button';
import RecommendationCard from '../../components/RecommendationCard/RecommendationCard';
import SimulationChart from '../../components/SimulationChart/SimulationChart';
import './Simulacao.css';

function Simulacao() {
  const [params, setParams] = useState({
    scenario: 'normal', // normal | pico | feriado
    servers: 4,
    reservationRate: 0.3,
    capacityPerFerry: 50
  });

  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);

  const scenarioOptions = [
    { value: 'normal', label: 'Dia Normal (Fora do Pico)' },
    { value: 'pico', label: 'Horário de Pico' },
    { value: 'feriado', label: 'Feriado (Caos)' }
  ];

  const scenarioPresets = {
    normal: { lambda: 60, mu: 25, peakHours: false },
    pico: { lambda: 120, mu: 25, peakHours: true },
    feriado: { lambda: 150, mu: 25, peakHours: true }
  };

  const handleParamChange = (field, value) => {
    if (field === 'scenario') {
      setParams(prev => ({ ...prev, scenario: value }));
      return;
    }
    setParams(prev => ({ ...prev, [field]: parseFloat(value) || 0 }));
  };

  const handleSimulate = () => {
    const preset = scenarioPresets[params.scenario] || scenarioPresets.normal;
    const simParams = {
      lambda: preset.lambda,
      mu: preset.mu,
      peakHours: preset.peakHours,
      servers: params.servers,
      reservationRate: params.reservationRate,
      capacityPerFerry: params.capacityPerFerry
    };

    setLoading(true);
    setTimeout(() => {
      const comparison = compareReservationVsNoReservation(simParams);
      setResults(comparison);
      setLoading(false);
    }, 1200);
  };

  return (
    <div className="simulacao">
      <h1>Simulação Inteligente de Tempo de Espera</h1>
      <p className="page-subtitle">
        Configure os parâmetros e veja a diferença entre agendar ou não sua viagem
      </p>

      <div className="simulacao-grid">
        <Card title="Parâmetros da Simulação">
          <div className="params-form">
            <Select
              label="Cenário de Simulação"
              value={params.scenario}
              onChange={(e) => handleParamChange('scenario', e.target.value)}
              options={scenarioOptions}
            />

            <Input
              label="Número de Ferries"
              type="number"
              value={params.servers}
              onChange={(e) => handleParamChange('servers', e.target.value)}
              placeholder="Ex: 4"
            />

            <Input
              label="Taxa de Reserva (%)"
              type="number"
              value={params.reservationRate * 100}
              onChange={(e) => handleParamChange('reservationRate', e.target.value / 100)}
              placeholder="Ex: 30"
              min="0"
              max="100"
            />

            {!loading ? (
              <Button onClick={handleSimulate} variant="primary" className="simulate-button">
                Simular
              </Button>
            ) : (
              <div className="loading-area">
                <div className="ferry-spinner" aria-label="Carregando simulação">
                  <span className="ferry-emoji" role="img" aria-hidden>⛴️</span>
                </div>
                <p className="loading-text">Processando simulação...</p>
              </div>
            )}
          </div>
        </Card>

        {results && (
          <>
            <Card title="Recomendação Automatizada">
              <RecommendationCard recommendation={results.recommendation} />
            </Card>

            <Card title="Comparação de Cenários">
              <div className="comparison-grid">
                <div className="comparison-item">
                  <h4>Sem Agendamento</h4>
                  <div className="metric">
                    <span className="metric-label">Tempo de Espera:</span>
                    <span className="metric-value">
                      {results.withoutReservation.waitTime.toFixed(1)} min
                    </span>
                  </div>
                  <div className="metric">
                    <span className="metric-label">Fila Média:</span>
                    <span className="metric-value">
                      {results.withoutReservation.queueLength.toFixed(1)} veículos
                    </span>
                  </div>
                  <div className="metric">
                    <span className="metric-label">Ocupação:</span>
                    <span className="metric-value">
                      {(results.withoutReservation.utilization * 100).toFixed(1)}%
                    </span>
                  </div>
                </div>

                <div className="comparison-item">
                  <h4>Com Agendamento</h4>
                  <div className="metric">
                    <span className="metric-label">Tempo de Espera:</span>
                    <span className="metric-value">
                      {results.withReservation.waitTime.toFixed(1)} min
                    </span>
                  </div>
                  <div className="metric">
                    <span className="metric-label">Fila Média:</span>
                    <span className="metric-value">
                      {results.withReservation.queueLength.toFixed(1)} veículos
                    </span>
                  </div>
                  <div className="metric">
                    <span className="metric-label">Ocupação:</span>
                    <span className="metric-value">
                      {(results.withReservation.utilization * 100).toFixed(1)}%
                    </span>
                  </div>
                </div>
              </div>

              <div className="differences">
                <h4>Diferenças</h4>
                <div className="difference-item positive">
                  <span>Economia de Tempo:</span>
                  <strong>
                    {results.differences.waitTimeMinutes.toFixed(1)} min
                    ({results.differences.waitTimePercent.toFixed(1)}%)
                  </strong>
                </div>
                <div className="difference-item positive">
                  <span>Redução da Fila:</span>
                  <strong>
                    {results.differences.queueLength.toFixed(1)} veículos
                    ({results.differences.queueLengthPercent.toFixed(1)}%)
                  </strong>
                </div>
              </div>
            </Card>

            <Card title="Visualização Gráfica" className="chart-card">
              <SimulationChart results={results} />
            </Card>
          </>
        )}
      </div>
    </div>
  );
}

export default Simulacao;

