import { Link } from 'react-router-dom';

function Home() {
  return (
    <section className="hero-section d-flex align-items-center">
      <div className="container py-5">
        <div className="row align-items-center g-4">
          <div className="col-lg-7">
            <span className="badge hero-badge mb-3">Estética vehicular premium</span>
            <h1 className="display-5 fw-bold hero-title">
              Cuidamos cada detalle para que tu vehículo se vea impecable.
            </h1>
            <p className="lead hero-text mt-3">
              Servicios profesionales, atención personalizada y una experiencia simple para reservar.
            </p>

            <div className="d-flex flex-wrap gap-3 mt-4">
              <Link className="btn btn-brand btn-lg" to="/servicios">
                Ver servicios
              </Link>

              <Link className="btn btn-outline-light btn-lg" to="/reservas">
                Reservar turno
              </Link>
            </div>
          </div>

          <div className="col-lg-5">
            <div className="info-card">
              <div className="d-flex align-items-center gap-3 mb-3">
                <i className="bi bi-stars feature-icon"></i>
                <div>
                  <h5 className="mb-1">Atención personalizada</h5>
                  <p className="mb-0 text-muted-custom">
                    Cada vehículo recibe el cuidado que necesita.
                  </p>
                </div>
              </div>

              <div className="d-flex align-items-center gap-3 mb-3">
                <i className="bi bi-calendar-check feature-icon"></i>
                <div>
                  <h5 className="mb-1">Reservas rápidas</h5>
                  <p className="mb-0 text-muted-custom">
                    Consultá disponibilidad y coordiná por WhatsApp.
                  </p>
                </div>
              </div>

              <div className="d-flex align-items-center gap-3">
                <i className="bi bi-shield-check feature-icon"></i>
                <div>
                  <h5 className="mb-1">Trabajo profesional</h5>
                  <p className="mb-0 text-muted-custom">
                    Resultados prolijos con enfoque premium.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default Home;