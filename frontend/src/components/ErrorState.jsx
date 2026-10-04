export default function ErrorState({ message = 'Something went wrong.', onRetry }) {
  return (
    <div className="state error">
      <p>{message}</p>
      {onRetry && <button className="btn" onClick={onRetry}>Try Again</button>}
    </div>
  );
}
