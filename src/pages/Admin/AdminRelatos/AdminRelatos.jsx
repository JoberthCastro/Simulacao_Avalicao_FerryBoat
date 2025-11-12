import { useFerry } from '../../../context/FerryContext';
import Card from '../../../components/Card/Card';
import Button from '../../../components/Button/Button';
import Select from '../../../components/Select/Select';
import './AdminRelatos.css';

function AdminRelatos() {
  const { reports, updateReportStatus } = useFerry();

  const handleStatusChange = (reportId, newStatus) => {
    updateReportStatus(reportId, newStatus);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'resolvido':
        return 'success';
      case 'urgente':
        return 'danger';
      case 'pendente':
        return 'warning';
      default:
        return 'secondary';
    }
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case 'fila':
        return '🚗';
      case 'problema':
        return '⚠️';
      case 'sugestao':
        return '💡';
      default:
        return '📝';
    }
  };

  const statusOptions = [
    { value: 'pendente', label: 'Pendente' },
    { value: 'urgente', label: 'Urgente' },
    { value: 'resolvido', label: 'Resolvido' }
  ];

  const filteredReports = reports.length > 0 ? reports : [];

  return (
    <div className="admin-relatos">
      <h1>Gestão de Relatos</h1>
      <p className="page-subtitle">
        Gerencie e responda aos relatos enviados pelos usuários
      </p>

      {filteredReports.length === 0 ? (
        <Card>
          <div className="empty-state">
            <p>Nenhum relato encontrado.</p>
          </div>
        </Card>
      ) : (
        <div className="reports-grid">
          {filteredReports.map(report => (
            <Card key={report.id} className="report-card">
              <div className="report-header">
                <div className="report-type">
                  <span className="report-icon">{getTypeIcon(report.type)}</span>
                  <span className="report-type-label">
                    {report.type === 'fila' && 'Fila Exagerada'}
                    {report.type === 'problema' && 'Problema Técnico'}
                    {report.type === 'sugestao' && 'Sugestão'}
                    {report.type === 'outro' && 'Outro'}
                  </span>
                </div>
                <div className={`status-badge status-${getStatusColor(report.status)}`}>
                  {report.status}
                </div>
              </div>

              {report.location && (
                <div className="report-location">
                  <strong>Localização:</strong> {report.location}
                </div>
              )}

              <div className="report-description">
                <strong>Descrição:</strong>
                <p>{report.description}</p>
              </div>

              <div className="report-footer">
                <div className="report-date">
                  {new Date(report.createdAt).toLocaleString('pt-BR')}
                </div>
                <div className="report-actions">
                  <Select
                    value={report.status}
                    onChange={(e) => handleStatusChange(report.id, e.target.value)}
                    options={statusOptions}
                    className="status-select"
                  />
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      <Card title="Estatísticas">
        <div className="stats-grid">
          <div className="stat-item">
            <span className="stat-label">Total de Relatos</span>
            <span className="stat-value">{filteredReports.length}</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">Pendentes</span>
            <span className="stat-value">
              {filteredReports.filter(r => r.status === 'pendente').length}
            </span>
          </div>
          <div className="stat-item">
            <span className="stat-label">Urgentes</span>
            <span className="stat-value">
              {filteredReports.filter(r => r.status === 'urgente').length}
            </span>
          </div>
          <div className="stat-item">
            <span className="stat-label">Resolvidos</span>
            <span className="stat-value">
              {filteredReports.filter(r => r.status === 'resolvido').length}
            </span>
          </div>
        </div>
      </Card>
    </div>
  );
}

export default AdminRelatos;

