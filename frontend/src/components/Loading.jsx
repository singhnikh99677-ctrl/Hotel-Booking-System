export default function Loading({ text = 'Loading...' }) {
  return (
    <div className="loading-box">
      <div className="spinner" />
      <p>{text}</p>
    </div>
  );
}
