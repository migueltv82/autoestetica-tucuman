function Contact() {
  return (
    <section className="page-section">
      <div className="container py-5">
        <div className="row justify-content-center">
          <div className="col-lg-8">
            <div className="content-card text-center">
              <h2 className="section-title mb-3">Contacto</h2>

              <div className="contact-item justify-content-center">
                <i className="bi bi-whatsapp"></i>
                <span>WhatsApp: +54 9 381 544 8147</span>
              </div>

              <div className="contact-item justify-content-center">
                <i className="bi bi-clock"></i>
                <span>Lunes a viernes de 9:30 a 16:30</span>
              </div>

              <div className="contact-item justify-content-center">
                <i className="bi bi-geo-alt"></i>
                <span>Atención exclusiva en el taller</span>
              </div>

              <div className="mt-4">
                <a
                  href="https://wa.me/5493815448147"
                  target="_blank"
                  rel="noreferrer"
                  className="btn btn-brand"
                >
                  Escribir por WhatsApp
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default Contact;