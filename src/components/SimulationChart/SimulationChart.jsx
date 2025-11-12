import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';
import './SimulationChart.css';

function SimulationChart({ results }) {
  if (!results) return null;

  const chartData = [
    {
      name: 'Sem Agendamento',
      'Tempo de Espera (min)': results.withoutReservation.waitTime,
      'Fila Média': results.withoutReservation.queueLength,
      'Ocupação (%)': results.withoutReservation.utilization * 100
    },
    {
      name: 'Com Agendamento',
      'Tempo de Espera (min)': results.withReservation.waitTime,
      'Fila Média': results.withReservation.queueLength,
      'Ocupação (%)': results.withReservation.utilization * 100
    }
  ];

  return (
    <div className="simulation-chart">
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Bar dataKey="Tempo de Espera (min)" fill="#ef4444" />
          <Bar dataKey="Fila Média" fill="#3b82f6" />
          <Bar dataKey="Ocupação (%)" fill="#10b981" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

export default SimulationChart;

