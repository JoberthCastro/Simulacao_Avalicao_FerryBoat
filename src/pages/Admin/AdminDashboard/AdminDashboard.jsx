import { useFerry } from '../../../context/FerryContext';
import Card from '../../../components/Card/Card';
import DashboardChart from '../../../components/DashboardChart/DashboardChart';
import HeatMapChart from '../../../components/HeatMapChart/HeatMapChart';
import './AdminDashboard.css';
import { estimateLambdaByHour, scheduledWait } from '../../../utils/simulation';

function AdminDashboard() {
  const { bookings, ferries } = useFerry();

  // Calcular métricas
  const totalBookings = bookings.length;
  const todayBookings = bookings.filter(b => {
    const bookingDate = new Date(b.date);
    const today = new Date();
    return bookingDate.toDateString() === today.toDateString();
  }).length;

  // Distribuição simulada de VEÍCULOS por ferry (moto e pessoas removidos)
  const DAILY_VEHICLES = 1200; // conforme conjunto de dados
  // Se houver um proxy operacional (f.trips), usa como peso; senão, distribui uniformemente
  const ferryCount = Math.max(1, ferries.length);
  const totalWeight = ferries.reduce((sum, f) => sum + (f.trips || 0), 0);
  let occupancyData = [];
  if (totalWeight > 0) {
    occupancyData = ferries.map((ferry) => ({
      name: ferry.name,
      'Veículos Transportados': Math.round(DAILY_VEHICLES * ((ferry.trips || 0) / totalWeight)),
      status: ferry.status
    }));
    // Ajuste de soma exata
    const diffPax = DAILY_VEHICLES - occupancyData.reduce((s, d) => s + d['Veículos Transportados'], 0);
    if (diffPax !== 0 && occupancyData.length > 0) {
      occupancyData[0]['Veículos Transportados'] += diffPax;
    }
  } else {
    const perFerry = Math.floor(DAILY_VEHICLES / ferryCount);
    const remainder = DAILY_VEHICLES - perFerry * ferryCount;
    occupancyData = ferries.map((ferry, idx) => ({
      name: ferry.name,
      'Veículos Transportados': perFerry + (idx < remainder ? 1 : 0),
      status: ferry.status
    }));
  }

  // Tempo médio de espera por horário (simulado via M/M/c com fallback robusto)
  const hours = ['06:00','07:00','08:00','09:00','10:00','11:00','12:00','13:00','14:00','15:00','16:00','17:00','18:00','19:00'];
  const waitTimeData = hours.map(h => {
    const hour = parseInt(h.split(':')[0], 10);
    const lambda = estimateLambdaByHour(hour);
    const peakHours = (hour >= 7 && hour < 9) || (hour >= 17 && hour < 19);
    // Usa modelo de partida programada para refletir 20 min fora de pico e ~90 min no pico
    const sim = scheduledWait(lambda, {
      peakHours,
      capacityPerDeparture: 50,
      scheduleGapMinutes: 120,
      reserved: false
    });
    return { hour: h, waitTime: Math.round(sim.waitTime) };
  });

  // Dados de tempo de travessia (mock)
  const crossingTimeData = [
    { ferry: 'Ferry 1', avgTime: 25 },
    { ferry: 'Ferry 2', avgTime: 28 },
    { ferry: 'Ferry 3', avgTime: 24 },
    { ferry: 'Ferry 4', avgTime: 26 }
  ];

  // Dados de carregamento (mock)
  const loadingData = [
    { ferry: 'Ferry 1', real: 42, projected: 45 },
    { ferry: 'Ferry 2', real: 38, projected: 40 },
    { ferry: 'Ferry 3', real: 45, projected: 48 },
    { ferry: 'Ferry 4', real: 35, projected: 38 }
  ];

  // Mapa de calor de horários de pico (gerado para a semana inteira)
  const heatHours = ['06:00','07:00','08:00','09:00','17:00','18:00'];
  const baseIntensity = {
    '06:00': 20,
    '07:00': 85,
    '08:00': 95,
    '09:00': 70,
    '17:00': 90,
    '18:00': 88
  };
  const daysOfWeek = ['Seg','Ter','Qua','Qui','Sex','Sáb','Dom'];
  const dayAdjust = [0, -5, 3, 1, -2, -8, -10]; // variação estável por dia
  const heatMapData = daysOfWeek.flatMap((day, idx) =>
    heatHours.map(h => ({
      hour: h,
      day,
      value: Math.max(0, Math.min(100, (baseIntensity[h] || 0) + dayAdjust[idx]))
    }))
  );

  return (
    <div className="admin-dashboard">
      <h1>Dashboard de Métricas</h1>
      <p className="page-subtitle">
        Visão geral das operações e indicadores de performance
      </p>

      <div className="metrics-grid">
        <Card className="metric-card">
          <h3>Total de Agendamentos</h3>
          <div className="metric-value">{totalBookings}</div>
        </Card>

        <Card className="metric-card">
          <h3>Agendamentos Hoje</h3>
          <div className="metric-value">{todayBookings}</div>
        </Card>

        <Card className="metric-card">
          <h3>Ferries Ativos</h3>
          <div className="metric-value">{ferries.length}</div>
        </Card>

        <Card className="metric-card">
          <h3>Taxa de Ocupação Média</h3>
          <div className="metric-value">78%</div>
        </Card>
      </div>

      <div className="charts-grid">
        <Card title="Ocupação por Ferry">
          <DashboardChart
            data={occupancyData}
            dataKey="Veículos Transportados"
            nameKey="name"
            color="#3b82f6"
            yDomain={[0, 500]}
          />
        </Card>

        <Card title="Tempo Médio de Espera por Horário">
          <DashboardChart
            data={waitTimeData}
            dataKey="waitTime"
            nameKey="hour"
            color="#ef4444"
            yDomain={[0, 120]}
          />
        </Card>

        <Card title="Tempo de Travessia por Ferry">
          <DashboardChart
            data={crossingTimeData}
            dataKey="avgTime"
            nameKey="ferry"
            color="#10b981"
          />
        </Card>

        <Card title="Carregamento Real vs. Projetado">
          <DashboardChart
            data={loadingData}
            dataKey={['real', 'projected']}
            nameKey="ferry"
            color={['#3b82f6', '#10b981']}
            type="multi"
          />
        </Card>
      </div>

      <Card title="Mapa de Calor - Horários de Pico">
        <HeatMapChart data={heatMapData} />
      </Card>
    </div>
  );
}

export default AdminDashboard;

