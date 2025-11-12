import { useFerry } from '../../context/FerryContext';
import Card from '../Card/Card';
import './NotificationCard.css';

function NotificationCard({ notification }) {
  const { removeNotification } = useFerry();

  const getIcon = () => {
    switch (notification.type) {
      case 'delay':
        return '⏰';
      case 'maintenance':
        return '🔧';
      case 'capacity':
        return '📊';
      case 'best-time':
        return '⭐';
      default:
        return '📢';
    }
  };

  const getColor = () => {
    switch (notification.type) {
      case 'delay':
        return 'warning';
      case 'maintenance':
        return 'info';
      case 'capacity':
        return 'danger';
      case 'best-time':
        return 'success';
      default:
        return 'default';
    }
  };

  return (
    <Card className={`notification-card notification-${getColor()}`}>
      <div className="notification-header">
        <span className="notification-icon">{getIcon()}</span>
        <button
          className="notification-close"
          onClick={() => removeNotification(notification.id)}
          aria-label="Fechar notificação"
        >
          ×
        </button>
      </div>
      <p className="notification-message">{notification.message}</p>
      {notification.timestamp && (
        <span className="notification-time">
          {new Date(notification.timestamp).toLocaleString('pt-BR')}
        </span>
      )}
    </Card>
  );
}

export default NotificationCard;

