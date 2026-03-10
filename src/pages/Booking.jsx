import { useMemo, useState } from 'react';
import RevealOnScroll from '../components/ui/RevealOnScroll.jsx';

function Booking() {
  const [name, setName] = useState('');
  const [vehicle, setVehicle] = useState('');
  const [service, setService] = useState('');
  const [date, setDate] = useState('');
  const [shift, setShift] = useState('');
  const [notes, setNotes] = useState('');
  const [error, setError] = useState('');

  const serviceOptions = {
    Auto: ['Limpieza de interior', 'Pulido y abrillantado', 'Lavado de motor'],
    Camioneta: ['Limpieza de interior', 'Pulido y abrillantado', 'Lavado de motor'],
    Moto: ['Lavado y detallado de motos'],
    Bicicleta: ['Lavado y detallado de bicicletas'],
  };

  const serviceDurations = {
    'Limpieza de interior': '2 a 4 horas',
    'Pulido y abrillantado': '4 a 8 horas',
    'Lavado de motor': '1 a 2 horas',
    'Lavado y detallado de motos': '1 a 2 horas',
    'Lavado y detallado de bicicletas': '1 hora',
  };

  const servicePrices = {
    'Limpieza de interior': '$18.000',
    'Pulido y abrillantado': '$45.000',
    'Lavado de motor': '$12.000',
    'Lavado y detallado de motos': '$10.000',
    'Lavado y detallado de bicicletas': '$8.000',
  };

  const vehicles = ['Auto', 'Camioneta', 'Moto', 'Bicicleta'];

  const availableServices = useMemo(() => {
    return vehicle ? serviceOptions[vehicle] || [] : [];
  }, [vehicle]);

  const selectedDuration = service ? serviceDurations[service] : '';
  const selectedPrice = service ? servicePrices[service] : '';

  const vehicleNote =
    vehicle === 'Camioneta'
      ? 'En camionetas el tiempo y el valor final pueden variar según tamaño y estado general.'
      : '';

  const today = new Date().toISOString().split('T')[0];

  const isWeekend = (selectedDate) => {
    if (!selectedDate) return false;
    const day = new Date(`${selectedDate}T00:00:00`).getDay();
    return day === 0 || day === 6;
  };

  const isFormValid =
    name.trim() !== '' &&
    vehicle.trim() !== '' &&
    service.trim() !== '' &&
    date.trim() !== '' &&
    shift.trim() !== '' &&
    !isWeekend(date);

  const formattedDate = date
    ? new Date(`${date}T00:00:00`).toLocaleDateString('es-AR')
    : '[fecha]';

  const durationText = selectedDuration
    ? `Duración estimada del servicio: ${selectedDuration}.`
    : 'Duración estimada del servicio: [duración].';

  const priceText = selectedPrice
    ? `Precio orientativo desde: ${selectedPrice}.`
    : 'Precio orientativo desde: [precio].';

  const vehicleNoteText = vehicleNote ? `${vehicleNote}` : '';
  const notesText = notes.trim()
    ? `Observaciones: ${notes.trim()}.`
    : 'Observaciones: Sin observaciones.';

  const whatsappMessage = `Hola, soy ${name || '[tu nombre]'}.
Quiero consultar un turno para mi ${vehicle || '[vehículo]'}.
Servicio: ${service || '[servicio]'}.
${durationText}
${priceText}
Fecha de preferencia: ${formattedDate}.
Turno de preferencia: ${shift || '[turno]'}.
${vehicleNoteText}
${notesText}
Gracias.`;

  const whatsappLink = `https://wa.me/5493815448147?text=${encodeURIComponent(
    whatsappMessage
  )}`;

  const handleVehicleChange = (e) => {
    const selectedVehicle = e.target.value;
    setVehicle(selectedVehicle);
    setService('');
    setError('');
  };

  const handleDateChange = (e) => {
    const selectedDate = e.target.value;

    if (isWeekend(selectedDate)) {
      setError('No se pueden solicitar turnos para sábados ni domingos.');
      setDate(selectedDate);
      return;
    }

    setError('');
    setDate(selectedDate);
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!name.trim() || !vehicle || !service || !date || !shift) {
      setError('Completá todos los campos obligatorios antes de enviar la consulta.');
      return;
    }

    if (isWeekend(date)) {
      setError('No se pueden solicitar turnos para sábados ni domingos.');
      return;
    }

    setError('');
    window.open(whatsappLink, '_blank');
  };

  return (
    <>
      <RevealOnScroll>
        <section className="booking-hero-section">
          <div className="container py-5">
            <div className="row align-items-center g-4">
              <div className="col-lg-7">
                <span className="section-mini-label">Reservas</span>
                <h1 className="booking-hero-title mb-3">
                  Coordiná tu turno de forma simple y profesional.
                </h1>
                <p className="booking-hero-text mb-0">
                  Elegí el tipo de vehículo, seleccioná el servicio y enviá tu consulta.
                  La idea es que reservar sea rápido, claro y sin complicaciones.
                </p>
              </div>

              <div className="col-lg-5">
                <div className="booking-hero-box">
                  <div className="booking-hero-item">
                    <i className="bi bi-calendar-check"></i>
                    <span>Elegí fecha y turno de preferencia</span>
                  </div>
                  <div className="booking-hero-item">
                    <i className="bi bi-whatsapp"></i>
                    <span>Envío directo para coordinar por WhatsApp</span>
                  </div>
                  <div className="booking-hero-item">
                    <i className="bi bi-check2-circle"></i>
                    <span>Proceso simple y claro desde el inicio</span>
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
                <div className="booking-form-card">
                  <div className="mb-4">
                    <h2 className="section-title mb-2">Solicitar reserva</h2>
                    <p className="section-text mb-0">
                      Completá los datos y te generamos el mensaje listo para enviar.
                    </p>
                  </div>

                  <form onSubmit={handleSubmit}>
                    <div className="row g-3">
                      <div className="col-md-6">
                        <label className="form-label">Tu nombre</label>
                        <input
                          type="text"
                          className="form-control custom-input"
                          placeholder="Ej: Juan Pérez"
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                        />
                      </div>

                      <div className="col-md-6">
                        <label className="form-label">Tipo de vehículo</label>
                        <select
                          className="form-select custom-input"
                          value={vehicle}
                          onChange={handleVehicleChange}
                        >
                          <option value="">Seleccioná un vehículo</option>
                          {vehicles.map((item, index) => (
                            <option key={index} value={item}>
                              {item}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="col-12">
                        <label className="form-label">Servicio</label>
                        <select
                          className="form-select custom-input"
                          value={service}
                          onChange={(e) => setService(e.target.value)}
                          disabled={!vehicle}
                        >
                          <option value="">
                            {vehicle ? 'Seleccioná un servicio' : 'Primero elegí el vehículo'}
                          </option>
                          {availableServices.map((item, index) => (
                            <option key={index} value={item}>
                              {item}
                            </option>
                          ))}
                        </select>
                      </div>

                      {selectedDuration && (
                        <div className="col-md-6">
                          <div className="booking-info-box">
                            <span className="booking-info-label">Duración estimada</span>
                            <strong>{selectedDuration}</strong>
                          </div>
                        </div>
                      )}

                      {selectedPrice && (
                        <div className="col-md-6">
                          <div className="booking-info-box">
                            <span className="booking-info-label">Precio orientativo</span>
                            <strong>{selectedPrice}</strong>
                          </div>
                        </div>
                      )}

                      {vehicleNote && (
                        <div className="col-12">
                          <div className="vehicle-note-box">{vehicleNote}</div>
                        </div>
                      )}

                      <div className="col-md-6">
                        <label className="form-label">Fecha de preferencia</label>
                        <input
                          type="date"
                          className="form-control custom-input"
                          value={date}
                          min={today}
                          onChange={handleDateChange}
                        />
                      </div>

                      <div className="col-md-6">
                        <label className="form-label">Turno de preferencia</label>
                        <select
                          className="form-select custom-input"
                          value={shift}
                          onChange={(e) => setShift(e.target.value)}
                        >
                          <option value="">Seleccioná un turno</option>
                          <option value="Mañana">Mañana</option>
                          <option value="Tarde">Tarde</option>
                        </select>
                      </div>

                      <div className="col-12">
                        <label className="form-label">Observaciones</label>
                        <textarea
                          className="form-control custom-input custom-textarea"
                          rows="4"
                          placeholder="Ej: el vehículo está muy sucio, tiene manchas en tapizado, prefiero horario después de las 14 hs..."
                          value={notes}
                          onChange={(e) => setNotes(e.target.value)}
                        />
                      </div>
                    </div>

                    <div className="mt-4">
                      <button
                        type="submit"
                        className="btn btn-brand btn-lg w-100"
                        disabled={!isFormValid}
                      >
                        Enviar consulta por WhatsApp
                      </button>
                    </div>

                    {error && (
                      <p className="text-center mt-3 validation-text">
                        {error}
                      </p>
                    )}

                    {!error && !isFormValid && (
                      <p className="text-center mt-3 validation-text">
                        Completá todos los campos obligatorios para habilitar el envío.
                      </p>
                    )}
                  </form>
                </div>
              </div>

              <div className="col-lg-5">
                <div className="booking-preview-card booking-visual-card">
                  <div className="booking-side-image-wrap">
                    <img
                      src="/images/booking-cover.jpg"
                      alt="Reservas Autoestética Tucumán"
                      className="booking-side-image"
                    />
                    <div className="booking-side-image-overlay">
                      <span className="overlay-chip">Reserva rápida</span>
                      <h3>Tu consulta, lista para enviar</h3>
                      <p>Una experiencia más clara, ágil y profesional desde el primer paso.</p>
                    </div>
                  </div>

                  <div className="mt-4">
                    <span className="section-mini-label">Vista previa</span>
                    <h3 className="booking-preview-title mt-2">Mensaje listo para enviar</h3>
                    <p className="section-text mb-3">
                      Esto es lo que se enviará automáticamente por WhatsApp.
                    </p>

                    <div className="booking-preview-box">
                      <p className="mb-0 preview-text" style={{ whiteSpace: 'pre-line' }}>
                        {whatsappMessage}
                      </p>
                    </div>

                    <div className="booking-preview-help mt-4">
                      <div className="booking-preview-help-item">
                        <i className="bi bi-info-circle"></i>
                        <span>Los sábados y domingos no están disponibles.</span>
                      </div>
                      <div className="booking-preview-help-item">
                        <i className="bi bi-clock-history"></i>
                        <span>La confirmación final se coordina por WhatsApp.</span>
                      </div>
                      <div className="booking-preview-help-item">
                        <i className="bi bi-shield-check"></i>
                        <span>La atención se realiza exclusivamente en el taller.</span>
                      </div>
                    </div>
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

export default Booking;