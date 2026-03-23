import { Link } from 'react-router-dom';
import RevealOnScroll from '../components/ui/RevealOnScroll.jsx';
import "../styles/Home.css";
function Home() {
  const testimonials = [
    {
      name: 'Cliente frecuente',
      text: 'Muy buena atención, trabajo prolijo y una diferencia real en cómo quedó el vehículo.',
    },
    {
      name: 'Atención personalizada',
      text: 'Se nota el cuidado en los detalles y la predisposición para coordinar rápido.',
    },
    {
      name: 'Resultado premium',
      text: 'El auto quedó mucho mejor de lo que esperaba. Muy recomendable.',
    },
  ];

  const galleryItems = [
    {
      image: '/images/service-interior.jpg',
      title: 'Interior',
      subtitle: 'Limpieza y terminación cuidada',
    },
    {
      image: '/images/service-polish.jpg',
      title: 'Pulido',
      subtitle: 'Brillo y mejor presencia visual',
    },
    {
      image: '/images/service-motor.jpg',
      title: 'Motor',
      subtitle: 'Detalle y presentación general',
    },
    {
      image: '/images/hero-autoestetica.jpg',
      title: 'Resultado final',
      subtitle: 'Imagen premium del vehículo',
    },
  ];

  return (
    <>
      <RevealOnScroll>
        <section className="home-hero-section premium-home-hero">
          <div className="container py-5">
            <div className="row align-items-center g-5 min-vh-75">
              <div className="col-lg-6">
                <span className="home-hero-badge mb-3 d-inline-flex">
                  Estética vehicular premium en Tucumán
                </span>

                <h1 className="home-hero-title mb-3">
                  Hacemos que tu vehículo vuelva a destacar.
                </h1>

                <p className="home-hero-text mb-4">
                  En Autoestética Tucumán trabajamos cada detalle con enfoque profesional,
                  atención personalizada y una experiencia simple para reservar.
                </p>

                <div className="d-flex flex-wrap gap-3 mb-4">
                  <Link className="btn btn-brand btn-lg" to="/reservas">
                    Reservar turno
                  </Link>

                  <Link className="btn btn-outline-light btn-lg" to="/servicios">
                    Ver servicios
                  </Link>
                </div>

                <div className="home-hero-stats">
                  <div className="home-hero-stat-card">
                    <strong>Atención personalizada</strong>
                    <span>Cada vehículo recibe un cuidado a medida.</span>
                  </div>

                  <div className="home-hero-stat-card">
                    <strong>Reservas rápidas</strong>
                    <span>Coordinación simple desde la web y WhatsApp.</span>
                  </div>
                </div>
              </div>

              <div className="col-lg-6">
                <div className="home-image-showcase">
                  <div className="home-main-image-card">
                    <img
                      src="/images/hero-autoestetica.jpg"
                      alt="Autoestética Tucumán"
                      className="home-main-image"
                    />

                    <div className="home-main-image-overlay">
                      <span className="overlay-chip">Detalle premium</span>
                      <h3>Terminación, presencia y cuidado visual</h3>
                      <p>
                        Una imagen profesional para mostrar el tipo de servicio que ofrecés.
                      </p>
                    </div>
                  </div>

                  <div className="home-floating-mini-card top-card">
                    <i className="bi bi-shield-check"></i>
                    <div>
                      <strong>Trabajo profesional</strong>
                      <span>Resultados prolijos y confiables</span>
                    </div>
                  </div>

                  <div className="home-floating-mini-card bottom-card">
                    <i className="bi bi-whatsapp"></i>
                    <div>
                      <strong>Contacto directo</strong>
                      <span>Coordinación rápida por WhatsApp</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </RevealOnScroll>

      <RevealOnScroll delay={60}>
        <section className="page-section">
          <div className="container py-5">
            <div className="text-center mb-5">
              <span className="section-mini-label">Por qué elegirnos</span>
              <h2 className="section-title">Una experiencia simple, profesional y cuidada</h2>
              <p className="section-text mx-auto home-section-text">
                No se trata solo de limpiar un vehículo. Se trata de devolverle presencia,
                mantenerlo cuidado y ofrecerte una atención clara y directa.
              </p>
            </div>

            <div className="row g-4">
              <div className="col-md-4">
                <div className="home-feature-card h-100">
                  <div className="home-feature-icon">
                    <i className="bi bi-droplet-half"></i>
                  </div>
                  <h4>Cuidado detallado</h4>
                  <p>
                    Trabajamos cada sector con foco en terminación, limpieza y buena presentación.
                  </p>
                </div>
              </div>

              <div className="col-md-4">
                <div className="home-feature-card h-100">
                  <div className="home-feature-icon">
                    <i className="bi bi-clock-history"></i>
                  </div>
                  <h4>Coordinación ágil</h4>
                  <p>
                    Consultás, elegís el servicio y coordinás el turno sin vueltas ni procesos largos.
                  </p>
                </div>
              </div>

              <div className="col-md-4">
                <div className="home-feature-card h-100">
                  <div className="home-feature-icon">
                    <i className="bi bi-gem"></i>
                  </div>
                  <h4>Imagen premium</h4>
                  <p>
                    Buscamos que el resultado final se vea prolijo, fino y alineado a un servicio de nivel.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>
      </RevealOnScroll>

      <RevealOnScroll delay={90}>
        <section className="home-gallery-strip-section">
          <div className="container py-5">
            <div className="d-flex justify-content-between align-items-end flex-wrap gap-3 mb-4">
              <div>
                <span className="section-mini-label">Galería</span>
                <h2 className="section-title mb-0">Resultados que transmiten calidad</h2>
              </div>
              <p className="section-text mb-0 home-gallery-intro">
                Usá acá fotos reales del taller para reforzar confianza y mostrar el nivel del trabajo.
              </p>
            </div>

            <div className="row g-4">
              {galleryItems.map((item, index) => (
                <div className="col-md-6 col-xl-3" key={index}>
                  <div className="gallery-premium-card">
                    <img src={item.image} alt={item.title} />
                    <div className="gallery-premium-overlay">
                      <strong>{item.title}</strong>
                      <span>{item.subtitle}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </RevealOnScroll>

      <RevealOnScroll delay={120}>
        <section className="home-testimonials-section">
          <div className="container py-5">
            <div className="text-center mb-5">
              <span className="section-mini-label">Confianza</span>
              <h2 className="section-title">Lo que transmite un buen servicio</h2>
              <p className="section-text mx-auto home-section-text">
                Estos textos pueden reemplazarse después por opiniones reales de clientes.
              </p>
            </div>

            <div className="row g-4">
              {testimonials.map((item, index) => (
                <div className="col-md-4" key={index}>
                  <div className="testimonial-card h-100">
                    <div className="testimonial-stars mb-3">
                      <i className="bi bi-star-fill"></i>
                      <i className="bi bi-star-fill"></i>
                      <i className="bi bi-star-fill"></i>
                      <i className="bi bi-star-fill"></i>
                      <i className="bi bi-star-fill"></i>
                    </div>

                    <p className="testimonial-text">
                      “{item.text}”
                    </p>

                    <div className="testimonial-author">
                      <strong>{item.name}</strong>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </RevealOnScroll>

      <RevealOnScroll delay={140}>
        <section className="home-cta-section">
          <div className="container py-5">
            <div className="home-cta-box">
              <div className="row align-items-center g-4">
                <div className="col-lg-8">
                  <span className="section-mini-label">Reservá fácil</span>
                  <h2 className="section-title mb-3">
                    Tu próximo turno se puede coordinar en minutos.
                  </h2>
                  <p className="section-text mb-0">
                    Elegí el vehículo, seleccioná el servicio y enviá tu consulta para coordinar disponibilidad.
                  </p>
                </div>

                <div className="col-lg-4 text-lg-end">
                  <Link className="btn btn-brand btn-lg" to="/reservas">
                    Ir a reservas
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>
      </RevealOnScroll>
    </>
  );
}

export default Home;