import { NavLink } from 'react-router-dom';

function AdminLayout({ title, subtitle, children }) {
  return (
    <section className="admin-layout-section">
      <div className="container-fluid py-4">
        <div className="row g-4">
          <div className="col-lg-3 col-xl-2">
            <aside className="admin-sidebar">
              <div className="admin-sidebar-brand">
                <div className="admin-sidebar-brand-mark">
                  <i className="bi bi-grid-1x2-fill"></i>
                </div>
                <div>
                  <strong>Panel Admin</strong>
                  <span>Autoestética Tucumán</span>
                </div>
              </div>

              <nav className="admin-sidebar-nav">
                <NavLink to="/dashboard" className="admin-sidebar-link">
                  <i className="bi bi-speedometer2"></i>
                  <span>Dashboard</span>
                </NavLink>

                <NavLink to="/agenda" className="admin-sidebar-link">
                  <i className="bi bi-calendar3"></i>
                  <span>Agenda</span>
                </NavLink>

                <NavLink to="/estadisticas" className="admin-sidebar-link">
                  <i className="bi bi-bar-chart-line"></i>
                  <span>Estadísticas</span>
                </NavLink>

                <NavLink to="/caja" className="admin-sidebar-link">
                  <i className="bi bi-cash-stack"></i>
                  <span>Caja</span>
                </NavLink>
              </nav>
            </aside>
          </div>

          <div className="col-lg-9 col-xl-10">
            <div className="admin-main-panel">
              <div className="admin-page-header">
                <div>
                  <h1 className="admin-page-title">{title}</h1>
                  {subtitle && <p className="admin-page-subtitle mb-0">{subtitle}</p>}
                </div>
              </div>

              <div className="admin-page-content">
                {children}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default AdminLayout;