import { NavLink, useLocation } from 'react-router-dom';
import './layout.css';

const NAV_ITEMS = [
  { to: '/dashboard',  icon: '📊', label: 'Dashboard' },
  { to: '/pedidos',    icon: '📋', label: 'Pedidos' },
  { to: '/clientes',   icon: '👥', label: 'Clientes' },
  { to: '/productos',  icon: '🍝', label: 'Productos' },
  { to: '/stock',      icon: '📦', label: 'Stock' },
  { to: '/produccion', icon: '🏭', label: 'Producción' },
];

export const Sidebar = ({ open, onClose }) => {
  return (
    <>
      {open && <div className="sidebar-overlay" onClick={onClose} />}
      <aside className={`sidebar ${open ? 'sidebar--open' : ''}`}>
        {/* Logo */}
        <div className="sidebar__logo">
          <span className="sidebar__logo-icon">🍝</span>
          <div>
            <span className="sidebar__logo-title">PastaERP</span>
            <span className="sidebar__logo-sub">Sistema de Gestión</span>
          </div>
        </div>

        {/* Nav */}
        <nav className="sidebar__nav">
          <span className="sidebar__nav-label">Módulos</span>
          {NAV_ITEMS.map(item => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) => `sidebar__link ${isActive ? 'sidebar__link--active' : ''}`}
              onClick={onClose}
            >
              <span className="sidebar__link-icon">{item.icon}</span>
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>

        {/* Footer */}
        <div className="sidebar__footer">
          <div className="sidebar__user">
            <div className="sidebar__user-avatar">CA</div>
            <div>
              <p className="sidebar__user-name">Carlos Admin</p>
              <p className="sidebar__user-role">Administrador</p>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};
