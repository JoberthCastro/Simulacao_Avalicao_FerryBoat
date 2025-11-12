import { useEffect, useMemo, useState } from 'react';
import { useFerry } from '../../context/FerryContext';
import Card from '../../components/Card/Card';
import Input from '../../components/Input/Input';
import Select from '../../components/Select/Select';
import Button from '../../components/Button/Button';
import RecommendationCard from '../../components/RecommendationCard/RecommendationCard';
import { compareReservationVsNoReservation, estimateLambdaByHour } from '../../utils/simulation';
import './Agendamento.css';

function Agendamento() {
  const { addBooking, getAvailability } = useFerry();

  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    origin: '',
    destination: '',
    date: '',
    time: '',
    vehicleType: 'carro'
  });
  const [availability, setAvailability] = useState(null);
  const [submitted, setSubmitted] = useState(false);
  const [simulation, setSimulation] = useState(null);
  const [errors, setErrors] = useState({});

  const terminals = [
    { value: 'ponta', label: 'Ponta da Espera (São Luís)' },
    { value: 'cujupe', label: 'Cujupe (Alcântara)' }
  ];

  const vehicleTypes = [
    { value: 'carro', label: 'Carro' },
    { value: 'caminhao', label: 'Caminhão' }
  ];

  // Sem campo de passageiros (removido conforme solicitação)

  const timeOptions = useMemo(() => {
    // Horários fixos por direção
    if (formData.origin === 'ponta' && formData.destination === 'cujupe') {
      return ['07:00', '08:00', '13:00', '14:00', '20:00'].map(h => ({ value: h, label: h }));
    }
    if (formData.origin === 'cujupe' && formData.destination === 'ponta') {
      return ['09:30', '10:30', '15:30', '16:30', '22:30'].map(h => ({ value: h, label: h }));
    }
    // fallback (antes de escolher direção)
    const options = [];
    for (let h = 6; h <= 22; h++) {
      const hour = String(h).padStart(2, '0');
      options.push({ value: `${hour}:00`, label: `${hour}:00` });
    }
    return options;
  }, [formData.origin, formData.destination]);

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setSubmitted(false);

    // Se alterar origem e ficar igual ao destino, limpe o destino
    if (field === 'origin' && value === formData.destination) {
      setFormData(prev => ({ ...prev, destination: '' }));
    }
    
    // Verificar disponibilidade quando data e horário são preenchidos
    if (field === 'date' || field === 'time') {
      const newData = { ...formData, [field]: value };
      if (newData.date && newData.time) {
        checkAvailability(newData.date, newData.time);
      }
    }
  };

  const checkAvailability = (date, time) => {
    const avail = getAvailability(date, time);
    setAvailability(avail);
  };

  const canAdvanceStep1 = formData.origin && formData.destination && formData.origin !== formData.destination;
  const canAdvanceStep2 = formData.date && formData.time;
  const canAdvanceStep3 = !!formData.vehicleType;

  // Preenche automaticamente data (hoje) e o primeiro horário disponível ao entrar no passo 2
  useEffect(() => {
    if (step === 2) {
      setFormData(prev => ({
        ...prev,
        date: prev.date || new Date().toISOString().split('T')[0],
        time: prev.time || (timeOptions[0]?.value || '')
      }));
    }
  }, [step, timeOptions]);
  const runBackgroundSimulation = () => {
    if (!formData.time) return;
    const hour = parseInt(formData.time.split(':')[0], 10);
    const lambda = estimateLambdaByHour(hour);

    // Gap entre partidas, calculado a partir dos horários da direção selecionada
    const idx = timeOptions.findIndex(t => t.value === formData.time);
    let scheduleGapMinutes = 120;
    if (idx !== -1) {
      const current = formData.time;
      const next = timeOptions[(idx + 1) % timeOptions.length]?.value;
      if (next) {
        const [h1, m1] = current.split(':').map(Number);
        const [h2, m2] = next.split(':').map(Number);
        let diff = (h2 * 60 + m2) - (h1 * 60 + m1);
        if (diff <= 0) diff += 24 * 60; // vira o dia
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
    const result = compareReservationVsNoReservation(params);
    setSimulation(result);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    addBooking(formData);
    setSubmitted(true);
    setFormData({
      origin: '',
      destination: '',
      date: '',
      time: '',
      vehicleType: 'carro'
    });
    setAvailability(null);
    setSimulation(null);
    setStep(1);
  };

  return (
    <div className="agendamento">
      <h1>Agendamento de Viagem</h1>
      <p className="page-subtitle">
        Reserve sua travessia Ponta da Espera ↔ Cujupe
      </p>

      <div className="agendamento-grid">
        <Card title="Agende sua Travessia">
          <div className="booking-form">
            {step === 1 && (
              <>
                <Select
                  label="Origem"
                  value={formData.origin}
                  onChange={(e) => handleChange('origin', e.target.value)}
                  options={[{ value: '', label: 'Selecione a origem' }, ...terminals]}
                  required
                />
                <Select
                  label="Destino"
                  value={formData.destination}
                  onChange={(e) => handleChange('destination', e.target.value)}
                  options={[
                    { value: '', label: 'Selecione o destino' },
                    ...terminals.map(t => ({ ...t, disabled: t.value === formData.origin }))
                  ]}
                  required
                />
                {formData.origin && formData.destination && formData.origin === formData.destination && (
                  <div className="availability-status availability-limitado">
                    O destino deve ser diferente da origem.
                  </div>
                )}
                <Button
                  variant="primary"
                  disabled={!canAdvanceStep1}
                  onClick={() => setStep(2)}
                >
                  Próximo: Data e Horário
                </Button>
              </>
            )}

            {step === 2 && (
              <>
                <Input
                  label="Data"
                  type="date"
                  value={formData.date}
                  onChange={(e) => handleChange('date', e.target.value)}
                  required
                  min={new Date().toISOString().split('T')[0]}
                />
                <Select
                  label="Horário"
                  value={formData.time}
                  onChange={(e) => handleChange('time', e.target.value)}
                  options={timeOptions}
                  required
                />
                {availability && (
                  <div className={`availability-status availability-${availability.status}`}>
                    <strong>Disponibilidade:</strong>
                    <span>
                      {availability.available} de {availability.total} vagas disponíveis
                      ({availability.percentage.toFixed(1)}%)
                    </span>
                    {availability.isPeak && (
                      <span className="peak-badge">Horário de Pico</span>
                    )}
                  </div>
                )}
                <div className="wizard-actions">
                  <Button variant="secondary" onClick={() => setStep(1)}>Voltar</Button>
                  <Button
                    variant="primary"
                    disabled={!canAdvanceStep2}
                    onClick={() => { runBackgroundSimulation(); setStep(3); }}
                  >
                    Próximo: Tipo de Veículo
                  </Button>
                </div>
              </>
            )}

            {step === 3 && (
              <>
                <Select
                  label="Tipo de Veículo"
                  value={formData.vehicleType}
                  onChange={(e) => handleChange('vehicleType', e.target.value)}
                  options={vehicleTypes}
                  required
                />

                <div className="wizard-actions">
                  <Button variant="secondary" onClick={() => setStep(2)}>Voltar</Button>
                  <Button
                    variant="primary"
                    disabled={!canAdvanceStep3}
                    onClick={() => setStep(4)}
                  >
                    Próximo: Resumo
                  </Button>
                </div>
              </>
            )}

            {step === 4 && (
              <form onSubmit={handleSubmit} className="wizard-summary">
                <div className="summary-grid">
                  <div><strong>Origem:</strong> {formData.origin}</div>
                  <div><strong>Destino:</strong> {formData.destination}</div>
                  <div><strong>Data:</strong> {formData.date}</div>
                  <div><strong>Horário:</strong> {formData.time}</div>
                  <div><strong>Tipo de Veículo:</strong> {formData.vehicleType}</div>
                </div>

                {simulation && (
                  <div className="simulation-summary">
                    <h3>Previsão de Espera</h3>
                    <div className="metric">
                      <span className="metric-label">Sem Agendamento:</span>
                      <span className="metric-value">
                        {simulation.withoutReservation.waitTime.toFixed(1)} min
                      </span>
                    </div>
                    <div className="metric">
                      <span className="metric-label">Com Agendamento:</span>
                      <span className="metric-value">
                        {simulation.withReservation.waitTime.toFixed(1)} min
                      </span>
                    </div>

                    <RecommendationCard recommendation={simulation.recommendation} />
                  </div>
                )}

                <div className="wizard-actions">
                  <Button variant="secondary" onClick={() => setStep(3)} type="button">Voltar</Button>
                  <Button
                    type="submit"
                    variant="primary"
                    className="submit-button"
                  >
                    Confirmar Agendamento
                  </Button>
                </div>

                {submitted && (
                  <div className="success-message">
                    ✅ Agendamento realizado com sucesso!
                  </div>
                )}
              </form>
            )}
          </div>
        </Card>

        <Card title="Informações">
          <div className="info-section">
            <h3>Como funciona?</h3>
            <ul>
              <li>Escolha origem e destino</li>
              <li>Selecione data e horário</li>
              <li>Selecione o tipo de veículo</li>
              <li>Revise e confirme</li>
            </ul>

            <h3>Tarifas (exemplo)</h3>
            <ul>
              <li>Carro — R$ 50,00</li>
              <li>Caminhão — R$ 120,00</li>
            </ul>
          </div>
        </Card>
      </div>
    </div>
  );
}

export default Agendamento;

