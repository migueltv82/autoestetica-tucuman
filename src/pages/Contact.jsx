import { useState } from "react";
import "../styles/Contact.css";

export default function Contact() {
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    message: "",
  });

  const [feedback, setFeedback] = useState("");

  function handleChange(e) {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  }

  function handleSubmit(e) {
    e.preventDefault();

    setFeedback("Tu consulta fue registrada. Pronto nos pondremos en contacto.");

    setFormData({
      name: "",
      phone: "",
      message: "",
    });
  }

  return (
    <section className="contact-page">
      <div className="container py-5">
        <div className="contact-hero">
          <span className="contact-eyebrow">Contacto</span>
          <h1 className="contact-title">Estamos para ayudarte con tu próxima reserva</h1>
          <p className="contact-subtitle">
            Si tenés dudas sobre los servicios, el vehículo o los turnos disponibles,
            dejános tu consulta y te respondemos a la brevedad.
          </p>
        </div>

        {feedback && (
          <div className="alert alert-info contact-alert" role="alert">
            {feedback}
          </div>
        )}

        <div className="row g-4">
          <div className="col-lg-7">
            <form className="contact-form-card" onSubmit={handleSubmit}>
              <div className="contact-section">
                <h3 className="contact-section-title">Enviá tu consulta</h3>

                <div className="row g-3">
                  <div className="col-md-6">
                    <label className="form-label">Nombre</label>
                    <input
                      type="text"
                      className="form-control contact-input"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  <div className="col-md-6">
                    <label className="form-label">Teléfono</label>
                    <input
                      type="text"
                      className="form-control contact-input"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  <div className="col-12">
                    <label className="form-label">Mensaje</label>
                    <textarea
                      className="form-control contact-input"
                      rows="6"
                      name="message"
                      value={formData.message}
                      onChange={handleChange}
                      placeholder="Contanos qué servicio te interesa o qué consulta querés hacer."
                      required
                    />
                  </div>
                </div>
              </div>

              <div className="contact-submit-wrap">
                <button type="submit" className="btn contact-submit-btn">
                  Enviar consulta
                </button>
              </div>
            </form>
          </div>

          <div className="col-lg-5">
            <aside className="contact-info-card">
              <h3 className="contact-info-title">Información útil</h3>

              <div className="contact-info-list">
                <div className="contact-info-item">
                  <span>Atención</span>
                  <strong>Lunes a viernes</strong>
                </div>

                <div className="contact-info-item">
                  <span>Horario</span>
                  <strong>09:30 a 16:30</strong>
                </div>

                <div className="contact-info-item">
                  <span>Modalidad</span>
                  <strong>Atención en taller</strong>
                </div>

                <div className="contact-info-item">
                  <span>Ubicación</span>
                  <strong>San Miguel de Tucumán</strong>
                </div>
              </div>

              <div className="contact-note">
                <h4>Respuesta clara y rápida</h4>
                <p>
                  Si querés avanzar con una reserva, lo más directo es usar la sección
                  de turnos. Si necesitás orientación antes, escribinos por acá.
                </p>
              </div>

              <a
                href="https://wa.me/5493815448147"
                target="_blank"
                rel="noreferrer"
                className="btn contact-whatsapp-btn"
              >
                Escribir por WhatsApp
              </a>
            </aside>
          </div>
        </div>
      </div>
    </section>
  );
}