import { useMemo, useState } from 'react';
import Card from '../../components/Card/Card';
import Select from '../../components/Select/Select';
import Button from '../../components/Button/Button';
import RecommendationCard from '../../components/RecommendationCard/RecommendationCard';
import SimulationChart from '../../components/SimulationChart/SimulationChart';
import { compareReservationVsNoReservation, estimateLambdaByHour } from '../../utils/simulation';
import FerryAnimation from '../../components/FerryAnimation/FerryAnimation';
import './SimulacaoPublic.css';

function SimulacaoPublic() {
  const terminals = [
    { value: 'ponta', label: 'Ponta da Espera (São Luís)' },
    { value: 'cujupe', label: 'Cujupe (Alcântara)' }
  ];

  const [origin, setOrigin] = useState('ponta');
  const [destination, setDestination] = useState('cujupe');
  const [time, setTime] = useState('');
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [animCfg, setAnimCfg] = useState(null);

  const timeOptions = useMemo(() => {
    if (origin === 'ponta' && destination === 'cujupe') {
      return ['07:00', '08:00', '13:00', '14:00', '20:00'].map(h => ({ value: h, label: h }));
    }
    if (origin === 'cujupe' && destination === 'ponta') {
      return ['09:30', '10:30', '15:30', '16:30', '22:30'].map(h => ({ value: h, label: h }));
    }
    return [];
  }, [origin, destination]);

  const canSimulate = origin && destination && origin !== destination && time;

  const handleSimulate = () => {
    if (!canSimulate) return;
    const hour = parseInt(time.split(':')[0], 10);
    const lambda = estimateLambdaByHour(hour);

    // cálculo do intervalo real para próxima partida nessa direção
    const idx = timeOptions.findIndex(t => t.value === time);
    let scheduleGapMinutes = 120;
    if (idx !== -1) {
      const current = time;
      const next = timeOptions[(idx + 1) % timeOptions.length]?.value;
      if (next) {
        const [h1, m1] = current.split(':').map(Number);
        const [h2, m2] = next.split(':').map(Number);
        let diff = (h2 * 60 + m2) - (h1 * 60 + m1);
        if (diff <= 0) diff += 24 * 60;
        scheduleGapMinutes = diff;
      }
    }

    const params = {
      lambda,
      mu: 25,
      servers: 4,
      reservationRate: 0.3,
      peakHours: (hour >= 7 && hour < 9) || (hour >= 17 && hour < 19),
      capacityPerFerry: 50,
      cycleMinutes: 120,
      scheduledMode: true,
      scheduleGapMinutes
    };

    setAnimCfg({
      lambda,
      mu: 25,
      servers: 4,
      reservationRate: 0.3,
      peakHours: (hour >= 7 && hour < 9) || (hour >= 17 && hour < 19),
      capacityPerFerry: 50,
      cycleMinutes: 120,
      scheduledMode: true,
      scheduleGapMinutes
    });
    setLoading(true);
    setTimeout(() => {
      const comparison = compareReservationVsNoReservation(params);
      setResults(comparison);
      setLoading(false);
    }, 5000);
  };

  // Preencher horário padrão quando direção mudar
  if (!time && timeOptions.length > 0) {
    setTime(timeOptions[0].value);
  }

  return (
    <div className="simulacao-public">
      <h1>Simulação de Espera (Público)</h1>
      <p className="page-subtitle">
        Veja uma previsão de espera com valores padrão, sem precisar entender termos técnicos.
      </p>

      <div className="simulacao-grid">
        <Card title="Selecione a Direção e o Horário">
          <div className="params-form">
            <Select
              label="Origem"
              value={origin}
              onChange={(e) => { setOrigin(e.target.value); setResults(null); }}
              options={terminals}
            />
            <Select
              label="Destino"
              value={destination}
              onChange={(e) => { setDestination(e.target.value); setResults(null); }}
              options={terminals.map(t => ({ ...t, disabled: t.value === origin }))}
            />
            <Select
              label="Horário"
              value={time}
              onChange={(e) => setTime(e.target.value)}
              options={timeOptions}
            />

            {!loading ? (
              <Button onClick={handleSimulate} variant="primary" className="simulate-button" disabled={!canSimulate}>
                Simular
              </Button>
            ) : (
              <div className="loading-area">
                <FerryAnimation
                  active={loading}
                  lambda={animCfg?.lambda ?? 120}
                  mu={animCfg?.mu ?? 25}
                  servers={animCfg?.servers ?? 4}
                  reservationRate={animCfg?.reservationRate ?? 0.3}
                  peakHours={animCfg?.peakHours ?? false}
                  capacityPerFerry={animCfg?.capacityPerFerry ?? 50}
                  cycleMinutes={animCfg?.cycleMinutes ?? 120}
                  simMinutesPerSecond={0.4}
                  speedSeconds={22}
                  /* scheduled mode props */
                  /* @ts-ignore - props optionals */
                  scheduledMode={animCfg?.scheduledMode ?? false}
                  /* @ts-ignore */
                  scheduleGapMinutes={animCfg?.scheduleGapMinutes ?? 120}
                />
                <p className="loading-text">Processando simulação...</p>
              </div>
            )}
          </div>
        </Card>

        {results && (
          <>
            <Card title="Recomendação">
              <RecommendationCard recommendation={results.recommendation} />
            </Card>
            <Card title="Resultados">
              <div className="comparison-grid">
                <div className="comparison-item">
                  <h4>Sem Agendamento</h4>
                  <div className="metric">
                    <span className="metric-label">Tempo de Espera:</span>
                    <span className="metric-value">
                      {results.withoutReservation.waitTime.toFixed(1)} min
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
                </div>
              </div>
            </Card>

            <Card title="Visualização" className="chart-card">
              <SimulationChart results={results} />
            </Card>
          </>
        )}
      </div>
    </div>
  );
}

export default SimulacaoPublic;


