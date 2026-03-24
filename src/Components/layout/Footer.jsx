import { Link } from "react-router-dom";
import "../../styles/Footer.css";

export default function Footer() {
  return (
    <footer className="site-footer">
      <div className="container py-5">
        <div className="site-footer-grid">
          <div className="site-footer-brand">
            <div className="site-footer-mark">AT</div>
            <h3>Autoestética Tucumán</h3>
            <p>
              Servicio de estética vehicular con una experiencia más clara, más
              prolija y enfocada en el detalle.
            </p>
          </div>

          <div className="site-footer-column">
            <h4>Navegación</h4>
            <ul>
              <li><Link to="/">Inicio</Link></li>
              <li><Link to="/servicios">Servicios</Link></li>
              <li><Link to="/reservas">Reservas</Link></li>
              <li><Link to="/contacto">Contacto</Link></li>
            </ul>
          </div>

          <div className="site-footer-column">
            <h4>Atención</h4>
            <ul>
              <li>Lunes a viernes</li>
              <li>09:30 a 16:30</li>
              <li>Atención en taller</li>
            </ul>
          </div>

          <div className="site-footer-column">
            <h4>Contacto</h4>
            <ul>
              <li>WhatsApp</li>
              <li>Consultas por turno</li>
              <li>San Miguel de Tucumán</li>
            </ul>
          </div>
        </div>

        <div className="site-footer-bottom">
          <span>© 2026 Autoestética Tucumán</span>
          <span>Diseño limpio, experiencia clara.</span>
        </div>
      </div>
    </footer>
  );
}