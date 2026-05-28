export default function Alert({ type = "error", message, children }) {
  const content = message || children;
  if (!content) return null;
  return <div className={`alert alert-${type}`}>{content}</div>;
}