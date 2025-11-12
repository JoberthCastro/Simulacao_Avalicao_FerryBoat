import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';
import './DashboardChart.css';

function DashboardChart({ data, dataKey, nameKey, color, type = 'bar', yDomain }) {
  const ChartComponent = type === 'line' ? LineChart : BarChart;
  const DataComponent = type === 'line' ? Line : Bar;

  return (
    <div className="dashboard-chart">
      <ResponsiveContainer width="100%" height={300}>
        <ChartComponent data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey={nameKey} />
          <YAxis {...(yDomain ? { domain: yDomain } : {})} />
          <Tooltip />
          <Legend />
          {Array.isArray(dataKey) ? (
            dataKey.map((key, index) => (
              <DataComponent
                key={key}
                dataKey={key}
                fill={Array.isArray(color) ? color[index] : color}
                name={key === 'real' ? 'Real' : 'Projetado'}
              />
            ))
          ) : (
            <DataComponent dataKey={dataKey} fill={color} />
          )}
        </ChartComponent>
      </ResponsiveContainer>
    </div>
  );
}

export default DashboardChart;

