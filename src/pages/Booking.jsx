import { useMemo, useState } from 'react';
import { CalendarDays, CarFront, Bike, Sparkles, MessageCircle, Phone } from 'lucide-react';

function Booking() {
  const serviceOptions = {
    Auto: [
      { name: 'Limpieza de interior', priceLabel: 'Consultar' },
      { name: 'Pulido y abrillantado', priceLabel: 'Consultar' },
      { name: 'Lavado de motor', priceLabel: 'Consultar' },
    ],
    Camioneta: [
      { name: 'Limpieza de interior', priceLabel: 'Consultar' },
      { name: 'Pulido y abrillantado', priceLabel: 'Consultar' },
      { name: 'Lavado de motor', priceLabel: 'Consultar' },
    ],
    Moto: [{ name: 'Lavado y detallado de motos', priceLabel: 'Consultar' }],
    Bicicleta: [{ name: 'Lavado y detallado de bicicletas', priceLabel: 'Consultar' }],
  };

  const [formData, setFormData] = useState({
    client: '',
    phone: '',
    vehicle: '',
    services: [],
    startDate: '',
    endDate: '',
    notes: '',
  });

  const availableServices = useMemo(() => {
    return formData.vehicle ? serviceOptions[formData.vehicle] || [] : [];
  }, [formData.vehicle]);

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === 'vehicle') {
      setFormData((prev) => ({
        ...prev,
        vehicle: value,
        services: [],
      }));
      return;
    }

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleServiceToggle = (serviceName) => {
    setFormData((prev) => {
      const exists = prev.services.includes(serviceName);

      return {
        ...prev,
        services: exists
          ? prev.services.filter((item) => item !== serviceName)
          : [...prev.services, serviceName],
      };
    });
  };

  const formatDate = (date) => {
    if (!date) return '';
    return new Date(`${date}T00:00:00`).toLocaleDateString('es-AR');
  };

  const handleWhatsAppBooking = () => {
    const { client, phone, vehicle, services, startDate, endDate, notes } = formData;

    if (!client || !phone || !vehicle || services.length === 0 || !startDate) {
      alert('Completá nombre, teléfono, vehículo, fechas y al menos un servicio.');
      return;
    }

    const finalEndDate = endDate || startDate;

    if (finalEndDate < startDate) {
      alert('La fecha hasta no puede ser anterior a la fecha desde.');
      return;
    }

    const message = `Hola, quiero solicitar una reserva en Autoestética Tucumán.
Nombre: ${client}
Teléfono: ${phone}
Vehículo: ${vehicle}
Servicios: ${services.join(', ')}
Fecha desde: ${formatDate(startDate)}
Fecha hasta: ${formatDate(finalEndDate)}
Observaciones: ${notes || 'Sin observaciones'}`;

    const url = `https://wa.me/5493815448147?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank');
  };

  return (
    <section className="page-section">
      <div className="container py-5">
        <div className="text-center mb-5">
          <span className="section-badge">
            <CalendarDays size={16} />
            Reservas
          </span>
          <h2 className="section-title mt-3">Solicitá tu servicio</h2>
          <p className="section-text mx-auto" style={{ maxWidth: '760px' }}>
            Algunos trabajos pueden demorar más de un día. Por eso ahora podés indicar
            una fecha de inicio y una fecha estimada de finalización.
          </p>
        </div>

        <div className="row g-4 align-items-start">
          <div className="col-lg-7">
            <div className="content-card booking-card">
              <h3 className="mb-4">Datos de la reserva</h3>

              <div className="row g-3">
                <div className="col-md-6">
                  <label className="form-label">Nombre y apellido</label>
                  <input
                    type="text"
                    name="client"
                    className="form-control custom-input"
                    placeholder="Ej: Juan Pérez"
                    value={formData.client}
                    onChange={handleChange}
                  />
                </div>

                <div className="col-md-6">
                  <label className="form-label">Teléfono</label>
                  <input
                    type="text"
                    name="phone"
                    className="form-control custom-input"
                    placeholder="Ej: 3811234567"
                    value={formData.phone}
                    onChange={handleChange}
                  />
                </div>

                <div className="col-md-6">
                  <label className="form-label">Vehículo</label>
                  <select
                    name="vehicle"
                    className="form-select custom-input"
                    value={formData.vehicle}
                    onChange={handleChange}
                  >
                    <option value="">Seleccioná un vehículo</option>
                    <option value="Auto">Auto</option>
                    <option value="Camioneta">Camioneta</option>
                    <option value="Moto">Moto</option>
                    <option value="Bicicleta">Bicicleta</option>
                  </select>
                </div>

                <div className="col-md-6">
                  <label className="form-label">Observaciones</label>
                  <input
                    type="text"
                    name="notes"
                    className="form-control custom-input"
                    placeholder="Ej: interior muy sucio / manchas / etc."
                    value={formData.notes}
                    onChange={handleChange}
                  />
                </div>

                <div className="col-md-6">
                  <label className="form-label">Fecha desde</label>
                  <input
                    type="date"
                    name="startDate"
                    className="form-control custom-input"
                    value={formData.startDate}
                    onChange={handleChange}
                  />
                </div>

                <div className="col-md-6">
                  <label className="form-label">Fecha hasta</label>
                  <input
                    type="date"
                    name="endDate"
                    className="form-control custom-input"
                    value={formData.endDate}
                    onChange={handleChange}
                  />
                </div>

                <div className="col-12">
                  <label className="form-label">Servicios</label>

                  <div className="services-checklist public-services-checklist">
                    {!formData.vehicle && (
                      <p className="mb-0 text-muted-custom">
                        Primero seleccioná el tipo de vehículo.
                      </p>
                    )}

                    {availableServices.map((service) => (
                      <label key={service.name} className="service-check-item">
                        <input
                          type="checkbox"
                          checked={formData.services.includes(service.name)}
                          onChange={() => handleServiceToggle(service.name)}
                        />
                        <span>
                          {service.name} · {service.priceLabel}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="col-12 mt-2">
                  <button
                    type="button"
                    className="btn btn-brand w-100 booking-whatsapp-btn"
                    onClick={handleWhatsAppBooking}
                  >
                    <MessageCircle size={18} />
                    Solicitar por WhatsApp
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="col-lg-5">
            <div className="content-card booking-side-card">
              <h3 className="mb-4">Antes de enviar</h3>

              <div className="booking-info-list">
                <div className="booking-info-item">
                  <div className="booking-info-icon">
                    <Sparkles size={18} />
                  </div>
                  <div>
                    <strong>Servicios personalizados</strong>
                    <p className="mb-0 text-muted-custom">
                      El tiempo final puede variar según el estado real del vehículo.
                    </p>
                  </div>
                </div>

                <div className="booking-info-item">
                  <div className="booking-info-icon">
                    {formData.vehicle === 'Moto' || formData.vehicle === 'Bicicleta' ? (
                      <Bike size={18} />
                    ) : (
                      <CarFront size={18} />
                    )}
                  </div>
                  <div>
                    <strong>Tipo de vehículo</strong>
                    <p className="mb-0 text-muted-custom">
                      Elegí correctamente el vehículo para ver los servicios disponibles.
                    </p>
                  </div>
                </div>

                <div className="booking-info-item">
                  <div className="booking-info-icon">
                    <CalendarDays size={18} />
                  </div>
                  <div>
                    <strong>Rango de fechas</strong>
                    <p className="mb-0 text-muted-custom">
                      Indicá fecha de inicio y fecha estimada de finalización.
                    </p>
                  </div>
                </div>

                <div className="booking-info-item">
                  <div className="booking-info-icon">
                    <Phone size={18} />
                  </div>
                  <div>
                    <strong>Confirmación</strong>
                    <p className="mb-0 text-muted-custom">
                      La coordinación final se realiza siempre por WhatsApp.
                    </p>
                  </div>
                </div>
              </div>

              <div className="booking-summary-box mt-4">
                <h4 className="mb-3">Resumen</h4>

                <div className="dashboard-list">
                  <div className="dashboard-list-item">
                    <span>Cliente</span>
                    <strong>{formData.client || '-'}</strong>
                  </div>
                  <div className="dashboard-list-item">
                    <span>Vehículo</span>
                    <strong>{formData.vehicle || '-'}</strong>
                  </div>
                  <div className="dashboard-list-item">
                    <span>Desde</span>
                    <strong>{formData.startDate ? formatDate(formData.startDate) : '-'}</strong>
                  </div>
                  <div className="dashboard-list-item">
                    <span>Hasta</span>
                    <strong>{formData.endDate ? formatDate(formData.endDate) : formData.startDate ? formatDate(formData.startDate) : '-'}</strong>
                  </div>
                  <div className="dashboard-list-item">
                    <span>Servicios</span>
                    <strong>
                      {formData.services.length > 0 ? formData.services.length : 0}
                    </strong>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default Booking;