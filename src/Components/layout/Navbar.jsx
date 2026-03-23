import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useTheme } from '../../context/ThemeContext.jsx';
import "../../styles/Navbar.css";



function Navbar() {
  const navigate = useNavigate();
  const isAdminAuth = localStorage.getItem('isAdminAuth') === 'true';
  const { theme, toggleTheme } = useTheme();

  const handleLogout = () => {
    localStorage.removeItem('isAdminAuth');
    navigate('/');
  };

  return (
    <nav className="navbar navbar-expand-lg premium-navbar sticky-top">
      <div className="container">
        <Link className="navbar-brand premium-brand" to="/">
          <span className="brand-mark">
            <i className="bi bi-stars"></i>
          </span>
          <span className="brand-copy">
            <strong>Autoestética</strong>
            <small>Tucumán</small>
          </span>
        </Link>

        <button
          className="navbar-toggler premium-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#mainNavbar"
          aria-controls="mainNavbar"
          aria-expanded="false"
          aria-label="Abrir navegación"
        >
          <span className="navbar-toggler-icon"></span>
        </button>

        <div className="collapse navbar-collapse" id="mainNavbar">
          <ul className="navbar-nav ms-auto align-items-lg-center gap-lg-2 premium-nav-list">
            <li className="nav-item">
              <NavLink className="nav-link premium-nav-link" to="/">
                Inicio
              </NavLink>
            </li>

            <li className="nav-item">
              <NavLink className="nav-link premium-nav-link" to="/servicios">
                Servicios
              </NavLink>
            </li>

            <li className="nav-item">
              <NavLink className="nav-link premium-nav-link" to="/reservas">
                Reservas
              </NavLink>
            </li>

            <li className="nav-item">
              <NavLink className="nav-link premium-nav-link" to="/contacto">
                Contacto
              </NavLink>
            </li>

            {isAdminAuth && (
              <>
                <li className="nav-item">
                  <NavLink className="nav-link premium-nav-link" to="/dashboard">
                    Dashboard
                  </NavLink>
                </li>

                <li className="nav-item">
                  <NavLink className="nav-link premium-nav-link" to="/agenda">
                    Agenda
                  </NavLink>
                </li>

                <li className="nav-item">
                  <NavLink className="nav-link premium-nav-link" to="/estadisticas">
                    Estadísticas
                  </NavLink>
                </li>

                <li className="nav-item">
                  <NavLink className="nav-link premium-nav-link" to="/caja">
                    Caja
                  </NavLink>
                </li>

                <li className="nav-item">
                  <button
                    type="button"
                    className="btn btn-outline-light premium-ghost-btn"
                    onClick={handleLogout}
                  >
                    Salir
                  </button>
                </li>
              </>
            )}

            <li className="nav-item">
              <button
                type="button"
                className="btn btn-outline-light premium-ghost-btn"
                onClick={toggleTheme}
              >
                {theme === 'dark' ? 'Modo claro' : 'Modo oscuro'}
              </button>
            </li>

            <li className="nav-item">
              <a
                className="btn btn-brand premium-wa-btn"
                href="https://wa.me/5493815448147"
                target="_blank"
                rel="noreferrer"
              >
                <i className="bi bi-whatsapp"></i>
                <span>WhatsApp</span>
              </a>
            </li>
          </ul>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;