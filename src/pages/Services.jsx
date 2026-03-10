import { Link } from 'react-router-dom';
import RevealOnScroll from '../components/ui/RevealOnScroll.jsx';

function Services() {
  const services = [
    {
      icon: 'bi bi-car-front',
      title: 'Limpieza de interior',
      description:
        'Limpieza profunda del habitáculo para recuperar prolijidad, frescura y mejor presentación general.',
      duration: '2 a 4 horas',
      vehicle: 'Autos y camionetas',
      image: '/images/service-interior.jpg',
    },
    {
      icon: 'bi bi-stars',
      title: 'Pulido y abrillantado',
      description:
        'Trabajo orientado a mejorar brillo, terminación visual y presencia exterior del vehículo.',
      duration: '4 a 8 horas',
      vehicle: 'Autos y camionetas',
      image: '/images/service-polish.jpg',
    },
    {
      icon: 'bi bi-gear-wide-connected',
      title: 'Lavado de motor',
      description:
        'Limpieza cuidadosa del compartimiento del motor con enfoque en presentación y detalle.',
      duration: '1 a 2 horas',
      vehicle: 'Autos y camionetas',
      image: '/images/service-motor.jpg',
    },
    {
      icon: 'bi bi-scooter',
      title: 'Lavado y detallado de motos',
      description:
        'Servicio pensado para mantener la moto limpia, cuidada y visualmente impecable.',
      duration: '1 a 2 horas',
      vehicle: 'Motos',
      image: '/images/hero-autoestetica.jpg',
    },
    {
      icon: 'bi bi-bicycle',
      title: 'Lavado y detallado de bicicletas',
      description:
        'Limpieza integral para mejorar la presentación y el cuidado general de la bicicleta.',
      duration: '1 hora',
      vehicle: 'Bicicletas',
      image: '/images/service-interior.jpg',
    },
  ];

  return (
    <>
      <RevealOnScroll>
        <section className="services-hero-section">
          <div className="container py-5">
            <div className="row align-items-center g-4">
              <div className="col-lg-7">
                <span className="section-mini-label">Servicios</span>
                <h1 className="services-hero-title mb-3">
                  Soluciones pensadas para que cada vehículo se vea mejor.
                </h1>
                <p className="services-hero-text mb-0">
                  Trabajamos con una propuesta enfocada en terminación, buena presencia
                  y atención personalizada. Cada servicio está pensado para adaptarse al
                  tipo de vehículo y a lo que realmente necesita.
                </p>
              </div>

              <div className="col-lg-5">
                <div className="services-hero-box">
                  <div className="services-hero-box-item">
                    <i className="bi bi-patch-check"></i>
                    <span>Trabajo prolijo y profesional</span>
                  </div>

                  <div className="services-hero-box-item">
                    <i className="bi bi-lightning-charge"></i>
                    <span>Coordinación rápida y simple</span>
                  </div>

                  <div className="services-hero-box-item">
                    <i className="bi bi-gem"></i>
                    <span>Presentación premium</span>
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
            <div className="row g-4">
              {services.map((service, index) => (
                <div className="col-md-6 col-xl-4" key={index}>
                  <div className="service-premium-card image-service-card h-100">
                    <div className="service-image-wrap">
                      <img
                        src={service.image}
                        alt={service.title}
                        className="service-card-image"
                      />
                      <span className="service-premium-tag image-tag">
                        {service.vehicle}
                      </span>
                    </div>

                    <div className="service-card-body">
                      <div className="service-premium-icon mb-3">
                        <i className={service.icon}></i>
                      </div>

                      <h3 className="service-premium-title">{service.title}</h3>

                      <p className="service-premium-description">
                        {service.description}
                      </p>

                      <div className="service-premium-divider"></div>

                      <div className="service-premium-meta">
                        <div className="service-premium-meta-item">
                          <span className="meta-label">Duración estimada</span>
                          <strong>{service.duration}</strong>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </RevealOnScroll>

      <RevealOnScroll delay={100}>
        <section className="services-process-section">
          <div className="container py-5">
            <div className="text-center mb-5">
              <span className="section-mini-label">Cómo funciona</span>
              <h2 className="section-title">Una reserva clara, rápida y sin complicaciones</h2>
              <p className="section-text mx-auto home-section-text">
                La idea es que puedas consultar y coordinar tu turno de forma simple,
                sabiendo qué servicio querés y teniendo una experiencia directa desde el inicio.
              </p>
            </div>

            <div className="row g-4">
              <div className="col-md-4">
                <div className="service-step-card h-100">
                  <div className="service-step-number">01</div>
                  <h4>Elegí el servicio</h4>
                  <p>
                    Seleccioná el tipo de vehículo y el servicio que mejor se adapta a tu necesidad.
                  </p>
                </div>
              </div>

              <div className="col-md-4">
                <div className="service-step-card h-100">
                  <div className="service-step-number">02</div>
                  <h4>Solicitá tu turno</h4>
                  <p>
                    Completá la reserva y enviá la consulta para coordinar disponibilidad.
                  </p>
                </div>
              </div>

              <div className="col-md-4">
                <div className="service-step-card h-100">
                  <div className="service-step-number">03</div>
                  <h4>Confirmá la atención</h4>
                  <p>
                    Coordinamos por WhatsApp y definimos el mejor momento para recibir tu vehículo.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>
      </RevealOnScroll>

      <RevealOnScroll delay={140}>
        <section className="services-cta-section">
          <div className="container py-5">
            <div className="home-cta-box">
              <div className="row align-items-center g-4">
                <div className="col-lg-8">
                  <span className="section-mini-label">Listo para reservar</span>
                  <h2 className="section-title mb-3">
                    Elegí el servicio y coordiná tu próximo turno.
                  </h2>
                  <p className="section-text mb-0">
                    Reservá de forma simple y avanzá directo al contacto para confirmar disponibilidad.
                  </p>
                </div>

                <div className="col-lg-4 text-lg-end">
                  <Link className="btn btn-brand btn-lg" to="/reservas">
                    Reservar ahora
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

export default Services;