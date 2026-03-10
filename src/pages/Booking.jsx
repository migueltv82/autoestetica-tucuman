import { useMemo, useState } from 'react';

function Booking() {
  const [name, setName] = useState('');
  const [vehicle, setVehicle] = useState('');
  const [service, setService] = useState('');
  const [date, setDate] = useState('');
  const [shift, setShift] = useState('');
  const [notes, setNotes] = useState('');
  const [error, setError] = useState('');

  const serviceOptions = {
    Auto: [
      'Limpieza de interior',
      'Pulido y abrillantado',
      'Lavado de motor',
    ],
    Camioneta: [
      'Limpieza de interior',
      'Pulido y abrillantado',
      'Lavado de motor',
    ],
    Moto: [
      'Lavado y detallado de motos',
    ],
    Bicicleta: [
      'Lavado y detallado de bicicletas',
    ],
  };

  const serviceDurations = {
    'Limpieza de interior': '2 a 4 horas',
    'Pulido y abrillantado': '4 a 8 horas',
    'Lavado de motor': '1 a 2 horas',
    'Lavado y detallado de motos': '1 a 2 horas',
    'Lavado y detallado de bicicletas': '1 hora',
  };

  const servicePrices = {
    'Limpieza de interior': '$150.000',
    'Pulido y abrillantado': '$180.000',
    'Lavado de motor': '$20.000',
    'Lavado y detallado de motos': '$30.000',
    'Lavado y detallado de bicicletas': '$10.000',
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

  const vehicleNoteText = vehicleNote
    ? `${vehicleNote}`
    : '';

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
    <section className="page-section">
      <div className="container py-5">
        <div className="row justify-content-center">
          <div className="col-lg-8">
            <div className="content-card">
              <div className="text-center mb-4">
                <h2 className="section-title">Reservá tu turno</h2>
                <p className="section-text">
                  Elegí el vehículo, el servicio y completá tus datos para enviarnos la consulta por WhatsApp.
                </p>
              </div>

              <form onSubmit={handleSubmit}>
                <div className="mb-3">
                  <label className="form-label">Tu nombre</label>
                  <input
                    type="text"
                    className="form-control custom-input"
                    placeholder="Ej: Juan Pérez"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                </div>

                <div className="mb-3">
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

                <div className="mb-3">
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
                  <div className="duration-box mb-3">
                    <span className="duration-label">Duración estimada:</span>{' '}
                    <span className="duration-value">{selectedDuration}</span>
                  </div>
                )}

                {selectedPrice && (
                  <div className="price-box mb-3">
                    <span className="price-label">Precio orientativo desde:</span>{' '}
                    <span className="price-value">{selectedPrice}</span>
                  </div>
                )}

                {vehicleNote && (
                  <div className="vehicle-note-box mb-3">
                    {vehicleNote}
                  </div>
                )}

                <div className="mb-3">
                  <label className="form-label">Fecha de preferencia</label>
                  <input
                    type="date"
                    className="form-control custom-input"
                    value={date}
                    min={today}
                    onChange={handleDateChange}
                  />
                </div>

                <div className="mb-3">
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

                <div className="mb-4">
                  <label className="form-label">Observaciones</label>
                  <textarea
                    className="form-control custom-input custom-textarea"
                    rows="4"
                    placeholder="Ej: el vehículo está muy sucio, tiene manchas en tapizado, prefiero horario después de las 14 hs..."
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                  />
                </div>

                <div className="preview-box mb-4">
                  <h5 className="mb-3">Vista previa del mensaje</h5>
                  <p className="mb-0 preview-text" style={{ whiteSpace: 'pre-line' }}>
                    {whatsappMessage}
                  </p>
                </div>

                <div className="text-center">
                  <button
                    type="submit"
                    className="btn btn-brand btn-lg"
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
        </div>
      </div>
    </section>
  );
}

export default Booking;