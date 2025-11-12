import { useMemo } from 'react';
import { useFerry } from '../../context/FerryContext';
import Card from '../../components/Card/Card';
import './MeusAgendamentos.css';

function MeusAgendamentos() {
  const { bookings } = useFerry();

  const enhanced = useMemo(() => {
    return bookings.map(b => {
      const dateTime = new Date(`${b.date}T${b.time}`);
      const now = new Date();
      let status = 'confirmado';
      if (now < new Date(dateTime.getTime() - 60 * 60 * 1000)) {
        status = 'confirmado';
      } else if (now >= new Date(dateTime.getTime() - 60 * 60 * 1000) && now <= new Date(dateTime.getTime() + 30 * 60 * 1000)) {
        status = 'embarque em breve';
      } else if (now > new Date(dateTime.getTime() + 30 * 60 * 1000) && now <= new Date(dateTime.getTime() + 2 * 60 * 60 * 1000)) {
        status = 'em trânsito';
      } else if (now > new Date(dateTime.getTime() + 2 * 60 * 60 * 1000)) {
        status = 'concluído';
      }
      return { ...b, status };
    });
  }, [bookings]);

  return (
    <div className="meus-agendamentos">
      <h1>Meus Agendamentos</h1>
      <p className="page-subtitle">Acompanhe o status das suas viagens</p>

      {enhanced.length === 0 ? (
        <Card>
          <p>Você ainda não possui agendamentos.</p>
        </Card>
      ) : (
        <div className="bookings-grid">
          {enhanced.map(b => (
            <Card key={b.id} className="booking-card">
              <div className="booking-header">
                <h3>{b.origin} → {b.destination}</h3>
                <span className={`status-badge ${b.status.replace(' ', '-')}`}>{b.status}</span>
              </div>
              <div className="booking-info">
                <div><strong>Data:</strong> {new Date(b.date).toLocaleDateString('pt-BR')}</div>
                <div><strong>Horário:</strong> {b.time}</div>
                <div><strong>Tipo de Veículo:</strong> {b.vehicleType}</div>
              </div>
              <div className="booking-footer">
                <span>Reservado em {new Date(b.createdAt).toLocaleString('pt-BR')}</span>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

export default MeusAgendamentos;


