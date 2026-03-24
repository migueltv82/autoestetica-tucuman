import { Link, NavLink } from "react-router-dom";
import { useState } from "react";
import "../../styles/Navbar.css";

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);

  const closeMenu = () => setIsOpen(false);

  return (
    <header className="site-navbar-wrap">
      <nav className="navbar navbar-expand-lg site-navbar">
        <div className="container">
          <Link to="/" className="site-brand" onClick={closeMenu}>
            <div className="site-brand-mark">AT</div>
            <div className="site-brand-text">
              <span className="site-brand-title">Autoestética Tucumán</span>
              <span className="site-brand-subtitle">Detailing & cuidado premium</span>
            </div>
          </Link>

          <button
            className="navbar-toggler site-navbar-toggler"
            type="button"
            onClick={() => setIsOpen(!isOpen)}
            aria-label="Abrir menú"
          >
            <span className="site-navbar-toggler-icon"></span>
          </button>

          <div className={`collapse navbar-collapse ${isOpen ? "show" : ""}`}>
            <ul className="navbar-nav ms-auto align-items-lg-center site-navbar-links">
              <li className="nav-item">
                <NavLink to="/" className="nav-link site-nav-link" onClick={closeMenu}>
                  Inicio
                </NavLink>
              </li>

              <li className="nav-item">
                <NavLink
                  to="/servicios"
                  className="nav-link site-nav-link"
                  onClick={closeMenu}
                >
                  Servicios
                </NavLink>
              </li>

              <li className="nav-item">
                <NavLink
                  to="/reservas"
                  className="nav-link site-nav-link"
                  onClick={closeMenu}
                >
                  Reservas
                </NavLink>
              </li>

              <li className="nav-item">
                <NavLink
                  to="/contacto"
                  className="nav-link site-nav-link"
                  onClick={closeMenu}
                >
                  Contacto
                </NavLink>
              </li>

              <li className="nav-item site-navbar-cta-wrap">
                <Link
                  to="/reservas"
                  className="btn site-navbar-cta"
                  onClick={closeMenu}
                >
                  Reservar turno
                </Link>
              </li>
            </ul>
          </div>
        </div>
      </nav>
    </header>
  );
}