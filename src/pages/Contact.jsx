import { Link } from 'react-router-dom';
import RevealOnScroll from '../components/ui/RevealOnScroll.jsx';
import "../styles/Contact.css"

function Contact() {
  return (
    <>
      <RevealOnScroll>
        <section className="contact-hero-section">
          <div className="container py-5">
            <div className="row align-items-center g-4">
              <div className="col-lg-7">
                <span className="section-mini-label">Contacto</span>
                <h1 className="contact-hero-title mb-3">
                  Estamos listos para ayudarte a coordinar tu próximo turno.
                </h1>
                <p className="contact-hero-text mb-0">
                  Si querés consultar disponibilidad, conocer más sobre un servicio o avanzar con una reserva,
                  podés comunicarte de forma simple y directa.
                </p>
              </div>

              <div className="col-lg-5">
                <div className="contact-hero-box">
                  <div className="contact-hero-item">
                    <i className="bi bi-whatsapp"></i>
                    <span>Atención por WhatsApp</span>
                  </div>

                  <div className="contact-hero-item">
                    <i className="bi bi-clock-history"></i>
                    <span>Lunes a viernes de 9:30 a 16:30</span>
                  </div>

                  <div className="contact-hero-item">
                    <i className="bi bi-geo-alt"></i>
                    <span>Atención exclusiva en el taller</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </RevealOnScroll>

      <RevealOnScroll delay={70}>
        <section className="page-section">
          <div className="container py-5">
            <div className="row g-4">
              <div className="col-lg-7">
                <div className="contact-main-card">
                  <div className="contact-image-wrap mb-4">
                    <img
                      src="/images/contact-cover.jpg"
                      alt="Contacto Autoestética Tucumán"
                      className="contact-main-image"
                    />
                    <div className="contact-image-overlay">
                      <span className="overlay-chip">Contacto directo</span>
                      <h3>Coordinación simple, rápida y clara</h3>
                      <p>Una atención cercana para resolver consultas y reservas sin vueltas.</p>
                    </div>
                  </div>

                  <span className="section-mini-label">Canales disponibles</span>
                  <h2 className="section-title mt-2 mb-3">
                    Elegí la forma más rápida para contactarnos
                  </h2>
                  <p className="section-text mb-4">
                    La vía principal de atención es WhatsApp. Ahí coordinamos consultas,
                    reservas y disponibilidad de manera más directa.
                  </p>

                  <div className="contact-info-list">
                    <div className="contact-info-card">
                      <div className="contact-info-icon">
                        <i className="bi bi-whatsapp"></i>
                      </div>
                      <div>
                        <h4>WhatsApp</h4>
                        <p>+54 9 381 544 8147</p>
                      </div>
                    </div>

                    <div className="contact-info-card">
                      <div className="contact-info-icon">
                        <i className="bi bi-clock"></i>
                      </div>
                      <div>
                        <h4>Horario de atención</h4>
                        <p>Lunes a viernes de 9:30 a 16:30</p>
                      </div>
                    </div>

                    <div className="contact-info-card">
                      <div className="contact-info-icon">
                        <i className="bi bi-shop"></i>
                      </div>
                      <div>
                        <h4>Modalidad de atención</h4>
                        <p>Atención presencial exclusiva en el taller</p>
                      </div>
                    </div>
                  </div>

                  <div className="mt-4">
                    <a
                      href="https://wa.me/5493815448147"
                      target="_blank"
                      rel="noreferrer"
                      className="btn btn-brand btn-lg"
                    >
                      Escribir por WhatsApp
                    </a>
                  </div>
                </div>
              </div>

              <div className="col-lg-5">
                <div className="contact-side-card">
                  <span className="section-mini-label">Antes de escribirnos</span>
                  <h3 className="contact-side-title mt-2 mb-3">
                    Para agilizar la atención, tené a mano estos datos
                  </h3>

                  <div className="contact-check-list">
                    <div className="contact-check-item">
                      <i className="bi bi-check2-circle"></i>
                      <span>Tipo de vehículo</span>
                    </div>

                    <div className="contact-check-item">
                      <i className="bi bi-check2-circle"></i>
                      <span>Servicio que querés consultar</span>
                    </div>

                    <div className="contact-check-item">
                      <i className="bi bi-check2-circle"></i>
                      <span>Fecha de preferencia</span>
                    </div>

                    <div className="contact-check-item">
                      <i className="bi bi-check2-circle"></i>
                      <span>Turno estimado: mañana o tarde</span>
                    </div>

                    <div className="contact-check-item">
                      <i className="bi bi-check2-circle"></i>
                      <span>Alguna observación importante del vehículo</span>
                    </div>
                  </div>

                  <div className="contact-note-box mt-4">
                    <strong>Importante:</strong> la confirmación final del turno siempre se
                    coordina por WhatsApp según disponibilidad real del taller.
                  </div>

                  <div className="contact-secondary-cta mt-4">
                    <Link to="/reservas" className="btn btn-outline-light w-100">
                      Ir directo a reservas
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </RevealOnScroll>
    </>
  );
}

export default Contact;