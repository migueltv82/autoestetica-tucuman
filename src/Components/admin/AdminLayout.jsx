import { NavLink, useNavigate } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";
import "../../styles/AdminLayout.css";

const navItems = [
  {
    to: "/dashboard",
    icon: "bi bi-speedometer2",
    label: "Dashboard",
    description: "Resumen general",
  },
  {
    to: "/dashboard",
    icon: "bi bi-calendar-check",
    label: "Reservas",
    description: "Agenda y gestión",
  },
  {
    to: "/clientes",
    icon: "bi bi-people",
    label: "Clientes",
    description: "Base de clientes",
  },
  {
    to: "/caja",
    icon: "bi bi-cash-coin",
    label: "Caja",
    description: "Cobros e ingresos",
  },
  {
    to: "/estadisticas",
    icon: "bi bi-bar-chart-line",
    label: "Estadísticas",
    description: "Métricas del negocio",
  },
];

function AdminLayout({ title, subtitle, children }) {
  const navigate = useNavigate();

  const [collapsed, setCollapsed] = useState(() => {
    return localStorage.getItem("adminSidebarCollapsed") === "true";
  });

  useEffect(() => {
    localStorage.setItem("adminSidebarCollapsed", String(collapsed));
  }, [collapsed]);

  const todayLabel = useMemo(() => {
    return new Date().toLocaleDateString("es-AR", {
      weekday: "long",
      day: "2-digit",
      month: "long",
      year: "numeric",
    });
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("isAdminAuth");
    navigate("/");
  };

  const handleGoSite = () => {
    navigate("/");
  };

  return (
    <section className="admin-shell">
      <div className={`admin-shell-grid ${collapsed ? "is-collapsed" : ""}`}>
        <aside className="admin-sidebar-v2">
          <div className="admin-sidebar-top">
            <div className="admin-brand-wrap">
              <div className="admin-brand-mark">
                <i className="bi bi-stars"></i>
              </div>

              {!collapsed && (
                <div className="admin-brand-text">
                  <strong>Autoestética Tucumán</strong>
                  <span>Panel de administración</span>
                </div>
              )}
            </div>

            <button
              type="button"
              className="admin-collapse-btn"
              onClick={() => setCollapsed((prev) => !prev)}
              title={collapsed ? "Expandir menú" : "Contraer menú"}
            >
              <i className={`bi ${collapsed ? "bi-chevron-right" : "bi-chevron-left"}`}></i>
            </button>
          </div>

          {!collapsed && (
            <div className="admin-sidebar-intro">
              <span className="admin-pill">Admin</span>
              <p className="mb-0">
                Gestión interna del taller, reservas, caja y seguimiento operativo.
              </p>
            </div>
          )}

          <nav className="admin-nav-v2">
            {navItems.map((item) => (
              <NavLink
                key={`${item.to}-${item.label}`}
                to={item.to}
                className={({ isActive }) =>
                  `admin-nav-link ${isActive ? "active" : ""}`
                }
              >
                <span className="admin-nav-icon">
                  <i className={item.icon}></i>
                </span>

                {!collapsed && (
                  <span className="admin-nav-copy">
                    <strong>{item.label}</strong>
                    <small>{item.description}</small>
                  </span>
                )}
              </NavLink>
            ))}
          </nav>

          <div className="admin-sidebar-bottom">
            <button
              type="button"
              className="admin-side-action admin-side-action-site"
              onClick={handleGoSite}
            >
              <i className="bi bi-house-door"></i>
              {!collapsed && <span>Ver sitio</span>}
            </button>

            <button
              type="button"
              className="admin-side-action admin-side-action-logout"
              onClick={handleLogout}
            >
              <i className="bi bi-box-arrow-right"></i>
              {!collapsed && <span>Salir</span>}
            </button>
          </div>
        </aside>

        <div className="admin-main-v2">
          <header className="admin-topbar-v2">
            <div className="admin-topbar-left">
              <span className="admin-topbar-badge">
                <i className="bi bi-shield-lock"></i>
                Panel interno
              </span>

              <div className="admin-topbar-date">{todayLabel}</div>
            </div>

            <div className="admin-topbar-right">
              <button
                type="button"
                className="admin-topbar-btn admin-topbar-btn-site"
                onClick={handleGoSite}
              >
                <i className="bi bi-box-arrow-up-right"></i>
                <span>Ir al sitio</span>
              </button>
            </div>
          </header>

          <div className="admin-page-head-v2">
            <div>
              <p className="admin-page-kicker">Administración</p>
              <h1 className="admin-page-title-v2">{title}</h1>
              {subtitle && <p className="admin-page-subtitle-v2">{subtitle}</p>}
            </div>
          </div>

          <main className="admin-content-v2">{children}</main>
        </div>
      </div>
    </section>
  );
}

export default AdminLayout;