import { NavLink, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';

function AdminLayout({ title, subtitle, children }) {
  const navigate = useNavigate();

  const [collapsed, setCollapsed] = useState(() => {
    return localStorage.getItem('adminSidebarCollapsed') === 'true';
  });

  useEffect(() => {
    localStorage.setItem('adminSidebarCollapsed', collapsed);
  }, [collapsed]);

  const today = new Date().toLocaleDateString('es-AR', {
    weekday: 'long',
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });

  const handleLogout = () => {
    localStorage.removeItem('isAdminAuth');
    navigate('/');
  };

  const handleGoSite = () => {
    navigate('/');
  };

  return (
    <section className="admin-layout-section">
      <div className="container-fluid py-4">
        <div className={`admin-layout-grid ${collapsed ? 'sidebar-collapsed' : ''}`}>
          <aside className="admin-sidebar">
            <div className="admin-sidebar-brand-row">
              <div className="admin-sidebar-brand">
                <div className="admin-sidebar-brand-mark">
                  <i className="bi bi-grid-1x2-fill"></i>
                </div>

                {!collapsed && (
                  <div>
                    <strong>Panel Admin</strong>
                    <span>Autoestética Tucumán</span>
                  </div>
                )}
              </div>

              <button
                type="button"
                className="admin-sidebar-toggle"
                onClick={() => setCollapsed((prev) => !prev)}
                title={collapsed ? 'Expandir menú' : 'Contraer menú'}
              >
                <i className={`bi ${collapsed ? 'bi-chevron-right' : 'bi-chevron-left'}`}></i>
              </button>
            </div>

            <nav className="admin-sidebar-nav">
              <NavLink to="/dashboard" className="admin-sidebar-link">
                <i className="bi bi-speedometer2"></i>
                {!collapsed && <span>Dashboard</span>}
              </NavLink>

              <NavLink to="/agenda" className="admin-sidebar-link">
                <i className="bi bi-calendar3"></i>
                {!collapsed && <span>Agenda</span>}
              </NavLink>

              <NavLink to="/estadisticas" className="admin-sidebar-link">
                <i className="bi bi-bar-chart-line"></i>
                {!collapsed && <span>Estadísticas</span>}
              </NavLink>

              <NavLink to="/caja" className="admin-sidebar-link">
                <i className="bi bi-cash-stack"></i>
                {!collapsed && <span>Caja</span>}
              </NavLink>
            </nav>

            <div className="admin-sidebar-bottom">
              <button
                type="button"
                className="admin-sidebar-action"
                onClick={handleGoSite}
              >
                <i className="bi bi-house-door"></i>
                {!collapsed && <span>Ver sitio</span>}
              </button>

              <a
                href="https://wa.me/5493815448147"
                target="_blank"
                rel="noreferrer"
                className="admin-sidebar-action"
              >
                <i className="bi bi-whatsapp"></i>
                {!collapsed && <span>WhatsApp</span>}
              </a>

              <button
                type="button"
                className="admin-sidebar-action danger"
                onClick={handleLogout}
              >
                <i className="bi bi-box-arrow-right"></i>
                {!collapsed && <span>Salir</span>}
              </button>
            </div>
          </aside>

          <div className="admin-main-panel">
            <div className="admin-topbar">
              <div className="admin-topbar-left">
                <div className="admin-topbar-badge">
                  <i className="bi bi-person-check-fill"></i>
                  <span>Administrador</span>
                </div>

                <div className="admin-topbar-date">
                  <i className="bi bi-calendar-event"></i>
                  <span>{today}</span>
                </div>
              </div>

              <div className="admin-topbar-actions">
                <a
                  href="https://wa.me/5493815448147"
                  target="_blank"
                  rel="noreferrer"
                  className="btn btn-outline-light admin-topbar-btn"
                >
                  <i className="bi bi-whatsapp"></i>
                  <span>WhatsApp</span>
                </a>

                <button
                  type="button"
                  className="btn btn-outline-light admin-topbar-btn"
                  onClick={handleGoSite}
                >
                  <i className="bi bi-house-door"></i>
                  <span>Ver sitio</span>
                </button>

                <button
                  type="button"
                  className="btn btn-outline-danger admin-topbar-btn"
                  onClick={handleLogout}
                >
                  <i className="bi bi-box-arrow-right"></i>
                  <span>Salir</span>
                </button>
              </div>
            </div>

            <div className="admin-page-header">
              <div>
                <h1 className="admin-page-title">{title}</h1>
                {subtitle && <p className="admin-page-subtitle mb-0">{subtitle}</p>}
              </div>
            </div>

            <div className="admin-page-content">{children}</div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default AdminLayout;