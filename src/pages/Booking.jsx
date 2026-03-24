import { useEffect, useMemo, useState } from "react";
import { supabase } from "../lib/supabase";

const VEHICLE_OPTIONS = ["Auto", "Camioneta", "SUV", "Moto", "Bicicleta"];

// Horario de trabajo del taller
const START_HOUR = 9;
const END_HOUR = 17;
const SLOT_INTERVAL = 30; // minutos

function normalizeService(service) {
  return {
    id: service.id,
    name: service.name || service.title || "Servicio",
    description: service.description || "",
    durationMinutes: Number(
      service.duration_minutes || service.duration || 60
    ),
    price: Number(service.price || 0),
  };
}

function timeToMinutes(time) {
  if (!time || !time.includes(":")) return null;
  const [hours, minutes] = time.split(":").map(Number);
  return hours * 60 + minutes;
}

function minutesToTime(totalMinutes) {
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`;
}

function generateTimeSlots(startHour, endHour, interval) {
  const slots = [];
  let current = startHour * 60;
  const end = endHour * 60;

  while (current < end) {
    slots.push(minutesToTime(current));
    current += interval;
  }

  return slots;
}

function rangesOverlap(startA, endA, startB, endB) {
  return startA < endB && endA > startB;
}

export default function Booking() {
  const [services, setServices] = useState([]);
  const [dayBookings, setDayBookings] = useState([]);
  const [loadingServices, setLoadingServices] = useState(true);
  const [loadingAvailability, setLoadingAvailability] = useState(false);
  const [saving, setSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  const [formData, setFormData] = useState({
    client: "",
    phone: "",
    vehicle: "Auto",
    serviceId: "",
    bookingDate: "",
    preferredTime: "",
    notes: "",
  });

  useEffect(() => {
    loadServices();
  }, []);

  useEffect(() => {
    if (formData.bookingDate) {
      loadBookingsByDate(formData.bookingDate);
    } else {
      setDayBookings([]);
    }
  }, [formData.bookingDate]);

  async function loadServices() {
    try {
      setLoadingServices(true);

      const { data, error } = await supabase
        .from("services")
        .select("*")
        .order("name", { ascending: true });

      if (error) throw error;

      setServices((data || []).map(normalizeService));
    } catch (error) {
      console.error("Error cargando servicios:", error);
      alert("No se pudieron cargar los servicios.");
    } finally {
      setLoadingServices(false);
    }
  }

  async function loadBookingsByDate(date) {
    try {
      setLoadingAvailability(true);

      const { data, error } = await supabase
        .from("bookings")
        .select("*")
        .eq("booking_date", date)
        .in("status", ["pendiente", "confirmado"]);

      if (error) throw error;

      setDayBookings(data || []);
    } catch (error) {
      console.error("Error cargando disponibilidad:", error);
      alert("No se pudo validar la disponibilidad.");
      setDayBookings([]);
    } finally {
      setLoadingAvailability(false);
    }
  }

  const selectedService = useMemo(() => {
    return services.find(
      (service) => String(service.id) === String(formData.serviceId)
    );
  }, [services, formData.serviceId]);

  const allTimeSlots = useMemo(() => {
    return generateTimeSlots(START_HOUR, END_HOUR, SLOT_INTERVAL);
  }, []);

  const availableSlots = useMemo(() => {
    if (!selectedService || !formData.bookingDate) return [];

    const serviceDuration = Number(selectedService.durationMinutes || 60);
    const workshopClosingMinutes = END_HOUR * 60;

    return allTimeSlots.filter((slot) => {
      const slotStart = timeToMinutes(slot);
      const slotEnd = slotStart + serviceDuration;

      // Si el servicio termina después del cierre, no sirve
      if (slotEnd > workshopClosingMinutes) return false;

      const hasConflict = dayBookings.some((booking) => {
        const bookingStart = timeToMinutes(booking.preferred_time);
        const bookingDuration = Number(booking.duration_minutes || 60);
        const bookingEnd = bookingStart + bookingDuration;

        if (bookingStart === null) return false;

        return rangesOverlap(slotStart, slotEnd, bookingStart, bookingEnd);
      });

      return !hasConflict;
    });
  }, [allTimeSlots, dayBookings, formData.bookingDate, selectedService]);

  function handleChange(e) {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
      ...(name === "serviceId" ? { preferredTime: "" } : {}),
      ...(name === "bookingDate" ? { preferredTime: "" } : {}),
    }));

    setSuccessMessage("");
  }

  function resetForm() {
    setFormData({
      client: "",
      phone: "",
      vehicle: "Auto",
      serviceId: "",
      bookingDate: "",
      preferredTime: "",
      notes: "",
    });
  }

  async function handleSubmit(e) {
    e.preventDefault();

    if (!formData.client.trim()) {
      alert("Ingresá tu nombre.");
      return;
    }

    if (!formData.phone.trim()) {
      alert("Ingresá tu teléfono.");
      return;
    }

    if (!formData.serviceId) {
      alert("Seleccioná un servicio.");
      return;
    }

    if (!formData.bookingDate) {
      alert("Seleccioná una fecha.");
      return;
    }

    if (!formData.preferredTime) {
      alert("Seleccioná un horario disponible.");
      return;
    }

    if (!selectedService) {
      alert("El servicio seleccionado no es válido.");
      return;
    }

    // validación defensiva extra antes de insertar
    if (!availableSlots.includes(formData.preferredTime)) {
      alert("Ese horario ya no está disponible. Elegí otro.");
      return;
    }

    try {
      setSaving(true);
      setSuccessMessage("");

      // Revalidación en vivo contra la base antes de insertar
      const { data: currentDayBookings, error: currentBookingsError } =
        await supabase
          .from("bookings")
          .select("*")
          .eq("booking_date", formData.bookingDate)
          .in("status", ["pendiente", "confirmado"]);

      if (currentBookingsError) throw currentBookingsError;

      const newStart = timeToMinutes(formData.preferredTime);
      const newDuration = Number(selectedService.durationMinutes || 60);
      const newEnd = newStart + newDuration;

      const conflictNow = (currentDayBookings || []).some((booking) => {
        const bookingStart = timeToMinutes(booking.preferred_time);
        const bookingDuration = Number(booking.duration_minutes || 60);
        const bookingEnd = bookingStart + bookingDuration;

        if (bookingStart === null) return false;

        return rangesOverlap(newStart, newEnd, bookingStart, bookingEnd);
      });

      if (conflictNow) {
        alert("Ese horario acaba de ocuparse. Elegí otro.");
        await loadBookingsByDate(formData.bookingDate);
        setFormData((prev) => ({ ...prev, preferredTime: "" }));
        return;
      }

      const payload = {
        client: formData.client.trim(),
        phone: formData.phone.trim(),
        vehicle: formData.vehicle,
        service_id: selectedService.id,
        service_name: selectedService.name,
        total: Number(selectedService.price || 0),
        booking_date: formData.bookingDate,
        preferred_time: formData.preferredTime,
        notes: formData.notes.trim() || null,
        status: "pendiente",
        payment_status: "pendiente",
        paid_amount: 0,
        balance_amount: Number(selectedService.price || 0),
        duration_minutes: Number(selectedService.durationMinutes || 60),
      };

      const { error } = await supabase.from("bookings").insert(payload);

      if (error) throw error;

      setSuccessMessage("Reserva enviada con éxito. Ya quedó registrada.");
      resetForm();
      await loadBookingsByDate(formData.bookingDate);
    } catch (error) {
      console.error("Error guardando reserva:", error);
      alert("No se pudo registrar la reserva.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <section className="container py-5">
      <div className="row justify-content-center">
        <div className="col-12 col-lg-10">
          <div className="booking-page-card shadow-sm rounded-4 p-4 p-md-5">
            <div className="mb-4">
              <span className="badge text-bg-dark mb-3">Reservas</span>
              <h1 className="h2 fw-bold mb-2">Solicitá tu turno</h1>
              <p className="text-secondary mb-0">
                Elegí el servicio, completá tus datos y seleccioná un horario disponible.
              </p>
            </div>

            <div className="row g-4">
              <div className="col-12 col-lg-7">
                <form onSubmit={handleSubmit} className="row g-3">
                  <div className="col-12">
                    <label className="form-label">Nombre y apellido</label>
                    <input
                      type="text"
                      name="client"
                      className="form-control"
                      value={formData.client}
                      onChange={handleChange}
                      placeholder="Ej: Miguel Torres"
                    />
                  </div>

                  <div className="col-12 col-md-6">
                    <label className="form-label">WhatsApp / Teléfono</label>
                    <input
                      type="text"
                      name="phone"
                      className="form-control"
                      value={formData.phone}
                      onChange={handleChange}
                      placeholder="381..."
                    />
                  </div>

                  <div className="col-12 col-md-6">
                    <label className="form-label">Vehículo</label>
                    <select
                      name="vehicle"
                      className="form-select"
                      value={formData.vehicle}
                      onChange={handleChange}
                    >
                      {VEHICLE_OPTIONS.map((vehicle) => (
                        <option key={vehicle} value={vehicle}>
                          {vehicle}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="col-12">
                    <label className="form-label">Servicio</label>
                    <select
                      name="serviceId"
                      className="form-select"
                      value={formData.serviceId}
                      onChange={handleChange}
                      disabled={loadingServices}
                    >
                      <option value="">
                        {loadingServices
                          ? "Cargando servicios..."
                          : "Seleccioná un servicio"}
                      </option>
                      {services.map((service) => (
                        <option key={service.id} value={service.id}>
                          {service.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="col-12 col-md-6">
                    <label className="form-label">Fecha deseada</label>
                    <input
                      type="date"
                      name="bookingDate"
                      className="form-control"
                      value={formData.bookingDate}
                      onChange={handleChange}
                    />
                  </div>

                  <div className="col-12 col-md-6">
                    <label className="form-label">Horario disponible</label>
                    <select
                      name="preferredTime"
                      className="form-select"
                      value={formData.preferredTime}
                      onChange={handleChange}
                      disabled={
                        !formData.bookingDate ||
                        !formData.serviceId ||
                        loadingAvailability
                      }
                    >
                      <option value="">
                        {loadingAvailability
                          ? "Validando horarios..."
                          : !formData.bookingDate || !formData.serviceId
                          ? "Elegí fecha y servicio"
                          : availableSlots.length === 0
                          ? "No hay horarios disponibles"
                          : "Seleccioná un horario"}
                      </option>

                      {availableSlots.map((slot) => (
                        <option key={slot} value={slot}>
                          {slot}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="col-12">
                    <label className="form-label">Observaciones</label>
                    <textarea
                      name="notes"
                      className="form-control"
                      rows="4"
                      value={formData.notes}
                      onChange={handleChange}
                      placeholder="Podés dejar un detalle extra si hace falta"
                    />
                  </div>

                  <div className="col-12">
                    <button
                      type="submit"
                      className="btn btn-dark w-100"
                      disabled={saving}
                    >
                      {saving ? "Guardando reserva..." : "Reservar turno"}
                    </button>
                  </div>

                  {successMessage && (
                    <div className="col-12">
                      <div className="alert alert-success mb-0">
                        {successMessage}
                      </div>
                    </div>
                  )}
                </form>
              </div>

              <div className="col-12 col-lg-5">
                <div className="booking-summary-card border rounded-4 p-4 h-100">
                  <h2 className="h5 fw-bold mb-3">Resumen</h2>

                  {selectedService ? (
                    <>
                      <div className="mb-3">
                        <small className="text-secondary d-block">Servicio</small>
                        <strong>{selectedService.name}</strong>
                      </div>

                      <div className="mb-3">
                        <small className="text-secondary d-block">Descripción</small>
                        <span>{selectedService.description || "-"}</span>
                      </div>

                      <div className="mb-3">
                        <small className="text-secondary d-block">Duración estimada</small>
                        <span>{selectedService.durationMinutes} min</span>
                      </div>

                      <div className="mb-3">
                        <small className="text-secondary d-block">
                          Horarios libres del día
                        </small>
                        <strong>{availableSlots.length}</strong>
                      </div>

                      <div className="mb-0">
                        <small className="text-secondary d-block">
                          Valor de referencia
                        </small>
                        <strong>
                          {selectedService.price > 0
                            ? `$${selectedService.price.toLocaleString("es-AR")}`
                            : "A consultar"}
                        </strong>
                      </div>
                    </>
                  ) : (
                    <p className="text-secondary mb-0">
                      Seleccioná un servicio para ver el resumen.
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}