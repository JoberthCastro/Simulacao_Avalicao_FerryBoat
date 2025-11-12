import { useFerry } from '../../../context/FerryContext';
import { calculateMaintenanceStatus } from '../../../utils/simulation';
import Card from '../../../components/Card/Card';
import Input from '../../../components/Input/Input';
import Button from '../../../components/Button/Button';
import './AdminManutencao.css';

function AdminManutencao() {
  const { ferries, updateFerryStatus } = useFerry();

  const handleUpdateTrips = (ferryId, trips) => {
    updateFerryStatus(ferryId, { trips: parseInt(trips) || 0 });
  };

  const handleResetTrips = (ferryId) => {
    updateFerryStatus(ferryId, { trips: 0 });
  };

  return (
    <div className="admin-manutencao">
      <h1>Painel de Manutenção</h1>
      <p className="page-subtitle">
        Gerencie o status de manutenção das embarcações usando MTBF
      </p>

      <div className="ferries-grid">
        {ferries.map(ferry => {
          const maintenance = calculateMaintenanceStatus(ferry.trips);
          
          return (
            <Card key={ferry.id} className="ferry-card">
              <div className="ferry-header">
                <h3>{ferry.name}</h3>
                <div className={`status-badge status-${maintenance.status.toLowerCase().replace(' ', '-')}`}>
                  {maintenance.status}
                </div>
              </div>

              <div className="ferry-metrics">
                <div className="metric">
                  <span className="metric-label">Viagens Realizadas:</span>
                  <span className="metric-value">{ferry.trips}</span>
                </div>
                <div className="metric">
                  <span className="metric-label">Próxima Manutenção:</span>
                  <span className="metric-value">
                    {maintenance.nextMaintenance > 0 
                      ? `Em ${maintenance.nextMaintenance} viagens`
                      : 'Urgente'
                    }
                  </span>
                </div>
              </div>

              <div className={`maintenance-message maintenance-${maintenance.color}`}>
                {maintenance.message}
              </div>

              <div className="ferry-actions">
                <Input
                  label="Atualizar Número de Viagens"
                  type="number"
                  value={ferry.trips}
                  onChange={(e) => handleUpdateTrips(ferry.id, e.target.value)}
                  min="0"
                  className="trips-input"
                />
                <Button
                  onClick={() => handleResetTrips(ferry.id)}
                  variant="secondary"
                  className="reset-button"
                >
                  Resetar Contador
                </Button>
              </div>
            </Card>
          );
        })}
      </div>

      <Card title="Informações sobre MTBF">
        <div className="info-section">
          <p>
            <strong>MTBF (Mean Time Between Failures)</strong> é usado para prever quando uma
            embarcação pode precisar de manutenção baseado no número de viagens realizadas.
          </p>
          <ul>
            <li><strong>OK:</strong> Embarcação em bom estado (menos de 70% do MTBF)</li>
            <li><strong>Atenção:</strong> Manutenção preventiva recomendada (70-90% do MTBF)</li>
            <li><strong>Risco de falha:</strong> Manutenção urgente necessária (mais de 90% do MTBF)</li>
          </ul>
          <p className="mtbf-note">
            MTBF base configurado: 1000 viagens
          </p>
        </div>
      </Card>
    </div>
  );
}

export default AdminManutencao;

