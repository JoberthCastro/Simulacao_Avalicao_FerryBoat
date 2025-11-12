import { useState } from 'react';
import { mmcQueue, simulateFailureImpact } from '../../../utils/simulation';
import Card from '../../../components/Card/Card';
import Input from '../../../components/Input/Input';
import Button from '../../../components/Button/Button';
import './AdminSimulacao.css';

function AdminSimulacao() {
  const [params, setParams] = useState({
    lambda: 120,
    mu: 30,
    servers: 4,
    availableServers: 4
  });

  const [results, setResults] = useState(null);
  const [failureResults, setFailureResults] = useState(null);

  const handleParamChange = (field, value) => {
    setParams(prev => ({
      ...prev,
      [field]: parseFloat(value) || 0
    }));
  };

  const handleSimulate = () => {
    const normal = mmcQueue(params.lambda, params.mu, params.servers);
    setResults(normal);
  };

  const handleSimulateFailure = () => {
    const impact = simulateFailureImpact(
      params.lambda,
      params.mu,
      params.availableServers,
      params.servers
    );
    setFailureResults(impact);
  };

  return (
    <div className="admin-simulacao">
      <h1>Simulação Operacional</h1>
      <p className="page-subtitle">
        Simule cenários operacionais e analise o impacto de mudanças
      </p>

      <div className="simulacao-grid">
        <Card title="Parâmetros da Simulação">
          <div className="params-form">
            <Input
              label="Taxa de Chegada (λ) - veículos/hora"
              type="number"
              value={params.lambda}
              onChange={(e) => handleParamChange('lambda', e.target.value)}
              placeholder="Ex: 120"
            />

            <Input
              label="Taxa de Serviço (μ) - veículos/hora por ferry"
              type="number"
              value={params.mu}
              onChange={(e) => handleParamChange('mu', e.target.value)}
              placeholder="Ex: 30"
            />

            <Input
              label="Total de Ferries"
              type="number"
              value={params.servers}
              onChange={(e) => handleParamChange('servers', e.target.value)}
              placeholder="Ex: 4"
            />

            <Input
              label="Ferries Disponíveis"
              type="number"
              value={params.availableServers}
              onChange={(e) => handleParamChange('availableServers', e.target.value)}
              placeholder="Ex: 4"
              max={params.servers}
            />

            <div className="button-group">
              <Button onClick={handleSimulate} variant="primary" className="simulate-button">
                Simular Operação Normal
              </Button>
              <Button onClick={handleSimulateFailure} variant="secondary" className="simulate-button">
                Simular Impacto de Falhas
              </Button>
            </div>
          </div>
        </Card>

        {results && (
          <Card title="Resultados - Operação Normal">
            <div className="results-grid">
              <div className="result-item">
                <span className="result-label">Tempo de Espera:</span>
                <span className="result-value">{results.waitTime.toFixed(1)} min</span>
              </div>
              <div className="result-item">
                <span className="result-label">Fila Média:</span>
                <span className="result-value">{results.queueLength.toFixed(1)} veículos</span>
              </div>
              <div className="result-item">
                <span className="result-label">Ocupação:</span>
                <span className="result-value">{(results.utilization * 100).toFixed(1)}%</span>
              </div>
              <div className="result-item">
                <span className="result-label">Probabilidade de Espera:</span>
                <span className="result-value">{(results.waitProbability * 100).toFixed(1)}%</span>
              </div>
            </div>
          </Card>
        )}

        {failureResults && (
          <>
            <Card title="Impacto de Falhas/Manutenção">
              <div className="failure-comparison">
                <div className="comparison-section">
                  <h4>Operação Normal</h4>
                  <div className="result-item">
                    <span>Tempo de Espera:</span>
                    <strong>{failureResults.normal.waitTime.toFixed(1)} min</strong>
                  </div>
                  <div className="result-item">
                    <span>Fila Média:</span>
                    <strong>{failureResults.normal.queueLength.toFixed(1)} veículos</strong>
                  </div>
                </div>

                <div className="comparison-section">
                  <h4>Com Indisponibilidade</h4>
                  <div className="result-item">
                    <span>Tempo de Espera:</span>
                    <strong>{failureResults.withFailure.waitTime.toFixed(1)} min</strong>
                  </div>
                  <div className="result-item">
                    <span>Fila Média:</span>
                    <strong>{failureResults.withFailure.queueLength.toFixed(1)} veículos</strong>
                  </div>
                </div>
              </div>

              <div className="impact-section">
                <h4>Impacto</h4>
                <div className="impact-item negative">
                  <span>Aumento no Tempo de Espera:</span>
                  <strong>
                    +{failureResults.impact.waitTimeIncrease.toFixed(1)} min
                    ({failureResults.impact.waitTimeIncreasePercent.toFixed(1)}%)
                  </strong>
                </div>
                <div className="impact-item negative">
                  <span>Aumento na Fila:</span>
                  <strong>
                    +{failureResults.impact.queueIncrease.toFixed(1)} veículos
                  </strong>
                </div>
              </div>
            </Card>
          </>
        )}
      </div>
    </div>
  );
}

export default AdminSimulacao;

