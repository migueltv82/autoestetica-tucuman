import { Link } from 'react-router-dom';

function Footer() {
  return (
    <footer className="premium-footer">
      <div className="container py-5">
        <div className="row g-4 align-items-start">
          <div className="col-lg-4">
            <div className="footer-brand-block">
              <div className="footer-brand-top">
                <span className="brand-mark">
                  <i className="bi bi-stars"></i>
                </span>
                <div className="brand-copy">
                  <strong>Autoestética</strong>
                  <small>Tucumán</small>
                </div>
              </div>

              <p className="footer-text mt-3 mb-0">
                Estética vehicular con foco en detalle, buena presentación y atención
                personalizada.
              </p>
            </div>
          </div>

          <div className="col-sm-6 col-lg-2">
            <h6 className="footer-title">Sitio</h6>
            <div className="footer-links">
              <Link to="/">Inicio</Link>
              <Link to="/servicios">Servicios</Link>
              <Link to="/reservas">Reservas</Link>
              <Link to="/contacto">Contacto</Link>
            </div>
          </div>

          <div className="col-sm-6 col-lg-3">
            <h6 className="footer-title">Contacto</h6>
            <div className="footer-contact-list">
              <div className="footer-contact-item">
                <i className="bi bi-whatsapp"></i>
                <span>+54 9 381 544 8147</span>
              </div>
              <div className="footer-contact-item">
                <i className="bi bi-clock"></i>
                <span>Lunes a viernes de 9:30 a 16:30</span>
              </div>
              <div className="footer-contact-item">
                <i className="bi bi-shop"></i>
                <span>Atención exclusiva en el taller</span>
              </div>
            </div>
          </div>

          <div className="col-lg-3">
            <div className="footer-cta-card">
              <span className="section-mini-label">Reservá ahora</span>
              <h6 className="footer-cta-title mt-2">Coordiná tu turno de forma rápida</h6>
              <p className="footer-text mb-3">
                Elegí el servicio y enviá la consulta directo por WhatsApp.
              </p>
              <a
                className="btn btn-brand w-100"
                href="https://wa.me/5493815448147"
                target="_blank"
                rel="noreferrer"
              >
                Escribir por WhatsApp
              </a>
            </div>
          </div>
        </div>

        <div className="premium-footer-bottom mt-4 pt-4">
          <span>© {new Date().getFullYear()} Autoestética Tucumán</span>
          <span>Desarrollado para uso interno y comercial</span>
        </div>
      </div>
    </footer>
  );
}

export default Footer;