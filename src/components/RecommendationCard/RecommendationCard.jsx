import './RecommendationCard.css';

function RecommendationCard({ recommendation }) {
  if (!recommendation) return null;

  const getIcon = () => {
    if (recommendation.shouldReserve) {
      return recommendation.priority === 'high' ? '✅' : '👍';
    }
    return '❌';
  };

  return (
    <div className={`recommendation-card recommendation-${recommendation.priority}`}>
      <div className="recommendation-header">
        <span className="recommendation-icon">{getIcon()}</span>
        <h3 className="recommendation-message">{recommendation.message}</h3>
      </div>
      <p className="recommendation-reason">{recommendation.reason}</p>
    </div>
  );
}

export default RecommendationCard;

