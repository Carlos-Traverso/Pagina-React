import './ui.css';
import { ESTADO_LABELS, ESTADO_COLORES, ESTADO_BG } from '../../constants/estados';

// ---- Button ----
export const Button = ({ children, variant = 'primary', size = 'md', onClick, disabled, type = 'button', className = '' }) => (
  <button
    type={type}
    onClick={onClick}
    disabled={disabled}
    className={`btn btn--${variant} btn--${size} ${className}`}
  >
    {children}
  </button>
);

// ---- Badge de estado ----

export const EstadoBadge = ({ estado }) => (
  <span
    className="estado-badge"
    style={{ color: ESTADO_COLORES[estado], backgroundColor: ESTADO_BG[estado], border: `1px solid ${ESTADO_COLORES[estado]}40` }}
  >
    {ESTADO_LABELS[estado] ?? estado}
  </span>
);

// ---- Card ----
export const Card = ({ children, className = '', onClick }) => (
  <div className={`card ${onClick ? 'card--clickable' : ''} ${className}`} onClick={onClick}>
    {children}
  </div>
);

// ---- Input ----
export const Input = ({ label, error, ...props }) => (
  <div className="input-group">
    {label && <label className="input-label">{label}</label>}
    <input className={`input-field ${error ? 'input-field--error' : ''}`} {...props} />
    {error && <span className="input-error">{error}</span>}
  </div>
);

// ---- Select ----
export const Select = ({ label, error, children, ...props }) => (
  <div className="input-group">
    {label && <label className="input-label">{label}</label>}
    <select className={`input-field ${error ? 'input-field--error' : ''}`} {...props}>
      {children}
    </select>
    {error && <span className="input-error">{error}</span>}
  </div>
);

// ---- Textarea ----
export const Textarea = ({ label, error, ...props }) => (
  <div className="input-group">
    {label && <label className="input-label">{label}</label>}
    <textarea className={`input-field ${error ? 'input-field--error' : ''}`} rows={3} {...props} />
    {error && <span className="input-error">{error}</span>}
  </div>
);

// ---- Modal ----
export const Modal = ({ open, onClose, title, children, width = '540px' }) => {
  if (!open) return null;
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-box" style={{ maxWidth: width }} onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{title}</h2>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>
        <div className="modal-body">{children}</div>
      </div>
    </div>
  );
};

// ---- Alerta ----
export const Alerta = ({ tipo = 'info', children }) => {
  const colores = {
    info:       { bg: 'rgba(59,130,246,0.12)', border: '#3b82f6', text: '#93c5fd' },
    advertencia:{ bg: 'rgba(245,158,11,0.12)', border: '#f59e0b', text: '#fcd34d' },
    error:      { bg: 'rgba(239,68,68,0.12)',  border: '#ef4444', text: '#fca5a5' },
    exito:      { bg: 'rgba(16,185,129,0.12)', border: '#10b981', text: '#6ee7b7' },
  };
  const c = colores[tipo];
  return (
    <div className="alerta" style={{ background: c.bg, borderColor: c.border, color: c.text }}>
      {children}
    </div>
  );
};

// ---- Spinner ----
export const Spinner = () => <div className="spinner" />;

// ---- Empty State ----
export const EmptyState = ({ icon = '📭', title, description }) => (
  <div className="empty-state">
    <span className="empty-state__icon">{icon}</span>
    <h3>{title}</h3>
    {description && <p>{description}</p>}
  </div>
);

// ---- Stat Card ----
export const StatCard = ({ icon, label, value, sublabel, color = '#f97316' }) => (
  <div className="stat-card" style={{ '--accent': color }}>
    <div className="stat-card__icon">{icon}</div>
    <div className="stat-card__info">
      <span className="stat-card__label">{label}</span>
      <span className="stat-card__value">{value}</span>
      {sublabel && <span className="stat-card__sublabel">{sublabel}</span>}
    </div>
  </div>
);
