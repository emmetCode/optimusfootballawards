import WinnerCard from './WinnerCard.jsx';

export default function WinnerGrid({ winners, size = 'default' }) {
  return (
    <div className={`winner-grid ${size === 'large' ? 'winner-grid--large' : ''}`}>
      {winners.map((winner) => (
        <WinnerCard key={winner.id} winner={winner} size={size} />
      ))}
    </div>
  );
}
