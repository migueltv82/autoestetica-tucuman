import { Link, NavLink, useNavigate } from 'react-router-dom';

function Navbar() {
  const navigate = useNavigate();
  const isAdminAuth = localStorage.getItem('isAdminAuth') === 'true';

  const handleLogout = () => {
    localStorage.removeItem('isAdminAuth');
    navigate('/');
  };

  return (
    <nav className="navbar navbar-expand-lg custom-navbar sticky-top">
      <div className="container">
        <Link className="navbar-brand brand-text" to="/">
          Autoestética Tucumán
        </Link>

        <button
          className="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#mainNavbar"
          aria-controls="mainNavbar"
          aria-expanded="false"
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon"></span>
        </button>

        <div className="collapse navbar-collapse" id="mainNavbar">
          <ul className="navbar-nav ms-auto align-items-lg-center gap-lg-3">
            <li className="nav-item">
              <NavLink className="nav-link" to="/">
                Inicio
              </NavLink>
            </li>

            <li className="nav-item">
              <NavLink className="nav-link" to="/servicios">
                Servicios
              </NavLink>
            </li>

            <li className="nav-item">
              <NavLink className="nav-link" to="/reservas">
                Reservas
              </NavLink>
            </li>

            <li className="nav-item">
              <NavLink className="nav-link" to="/contacto">
                Contacto
              </NavLink>
            </li>

            {isAdminAuth && (
              <>
                <li className="nav-item">
                  <NavLink className="nav-link" to="/agenda">
                    Agenda
                  </NavLink>
                </li>
                <li className="nav-item">
  <NavLink className="nav-link" to="/estadisticas">
    Estadísticas
  </NavLink>
</li>
<li className="nav-item">
  <NavLink className="nav-link" to="/caja">
    Caja
  </NavLink>
</li>

                <li className="nav-item">
                  <button
                    type="button"
                    className="btn btn-outline-light"
                    onClick={handleLogout}
                  >
                    Salir
                  </button>
                </li>
              </>
            )}

            <li className="nav-item">
              <a
                className="btn btn-brand"
                href="https://wa.me/5493815448147"
                target="_blank"
                rel="noreferrer"
              >
                WhatsApp
              </a>
            </li>
          </ul>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;