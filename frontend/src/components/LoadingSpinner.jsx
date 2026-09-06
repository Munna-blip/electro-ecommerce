export default function LoadingSpinner({ label = "Loading..." }) {
  return (
    <div className="d-flex flex-column align-items-center justify-content-center py-5">
      <div className="spinner-border text-primary mb-2" role="status" />
      <div className="text-muted small">{label}</div>
    </div>
  );
}
