import './HeatMapChart.css';

function HeatMapChart({ data }) {
  const hours = [...new Set(data.map(d => d.hour))].sort();
  const days = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'];

  const getCellValue = (hour, day) => {
    const item = data.find(d => d.hour === hour && d.day === day);
    return item ? item.value : 0;
  };

  const getColorClass = (value) => {
    if (value === 0) return 'heatmap-empty';
    if (value < 30) return 'heatmap-low';
    if (value < 60) return 'heatmap-medium';
    if (value < 80) return 'heatmap-high';
    return 'heatmap-very-high';
  };

  return (
    <div className="heatmap-chart">
      <div className="heatmap-container">
        <div className="heatmap-header">
          <div className="heatmap-corner"></div>
          {hours.map(hour => (
            <div key={hour} className="heatmap-hour">
              {hour}
            </div>
          ))}
        </div>
        {days.map(day => (
          <div key={day} className="heatmap-row">
            <div className="heatmap-day">{day}</div>
            {hours.map(hour => {
              const value = getCellValue(hour, day);
              return (
                <div
                  key={`${day}-${hour}`}
                  className={`heatmap-cell ${getColorClass(value)}`}
                  title={`${day} ${hour}: ${value}%`}
                >
                  {value > 0 && value}
                </div>
              );
            })}
          </div>
        ))}
      </div>
      <div className="heatmap-legend">
        <span>Baixo</span>
        <div className="heatmap-legend-colors">
          <div className="heatmap-legend-color heatmap-low"></div>
          <div className="heatmap-legend-color heatmap-medium"></div>
          <div className="heatmap-legend-color heatmap-high"></div>
          <div className="heatmap-legend-color heatmap-very-high"></div>
        </div>
        <span>Alto</span>
      </div>
    </div>
  );
}

export default HeatMapChart;

