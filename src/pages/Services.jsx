function Services() {
  const services = [
    {
      title: 'Limpieza de interior',
      description: 'Limpieza profunda de paneles, tapizados, alfombras y detalles internos.',
      duration: '2 a 4 horas',
      icon: 'bi bi-car-front-fill',
    },
    {
      title: 'Pulido y abrillantado',
      description: 'Mejora visual de la pintura, brillo y terminación estética del vehículo.',
      duration: 'Según el estado',
      icon: 'bi bi-brightness-high-fill',
    },
    {
      title: 'Lavado de motor',
      description: 'Limpieza cuidada del compartimiento del motor con tratamiento adecuado.',
      duration: '1 a 2 horas',
      icon: 'bi bi-gear-wide-connected',
    },
    {
      title: 'Lavado y detallado de motos',
      description: 'Limpieza detallada para motos con terminación prolija.',
      duration: '1 a 2 horas',
      icon: 'bi bi-bicycle',
    },
    {
      title: 'Lavado y detallado de bicicletas',
      description: 'Cuidado completo para bicicletas urbanas o deportivas.',
      duration: '1 hora',
      icon: 'bi bi-bicycle',
    },
  ];

  return (
    <section id="servicios" className="page-section">
      <div className="container py-5">
        <div className="text-center mb-5">
          <h2 className="section-title">Servicios</h2>
          <p className="section-text">
            Soluciones pensadas para mantener tu vehículo limpio, cuidado y con una imagen impecable.
          </p>
        </div>

        <div className="row g-4">
          {services.map((service, index) => (
            <div className="col-md-6 col-lg-4" key={index}>
              <div className="service-card h-100">
                <i className={`${service.icon} service-icon`}></i>
                <h4>{service.title}</h4>
                <p>{service.description}</p>
                <span className="service-duration">
                  Duración estimada: {service.duration}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default Services;