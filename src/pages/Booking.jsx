import { useEffect, useMemo, useState } from "react";
import {
  createBooking,
  isTimeSlotAvailable,
  getAvailableTimeSlots,
} from "../lib/bookings.js";
import { supabase } from "../lib/supabase";
import "../styles/Booking.css";

export default function Booking() {
  const [services, setServices] = useState([]);
  const [loadingServices, setLoadingServices] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [availableSlots, setAvailableSlots] = useState([]);
  const [loadingSlots, setLoadingSlots] = useState(false);

  const [formData, setFormData] = useState({
    customer_name: "",
    customer_phone: "",
    vehicle_type: "",
    vehicle_brand: "",
    vehicle_model: "",
    service_id: "",
    booking_date: "",
    booking_time: "",
    notes: "",
  });

  useEffect(() => {
    const fetchServices = async () => {
      try {
        const { data, error } = await supabase
          .from("services")
          .select("*")
          .order("id", { ascending: true });

        if (error) throw error;
        setServices(data || []);
      } catch (error) {
        console.error("Error cargando servicios:", error);
        setMessage("No se pudieron cargar los servicios.");
      } finally {
        setLoadingServices(false);
      }
    };

    fetchServices();
  }, []);

  useEffect(() => {
    const loadAvailableSlots = async () => {
      try {
        const selectedService = services.find(
          (service) => String(service.id) === String(formData.service_id)
        );

        if (!formData.booking_date || !selectedService) {
          setAvailableSlots([]);
          return;
        }

        setLoadingSlots(true);

        const estimatedDuration = Number(selectedService.duration || 0);

        if (!estimatedDuration) {
          setAvailableSlots([]);
          return;
        }

        const slots = await getAvailableTimeSlots({
          booking_date: formData.booking_date,
          estimated_duration: estimatedDuration,
          startHour: "09:30",
          endHour: "16:30",
          intervalMinutes: 30,
        });

        setAvailableSlots(slots);

        if (!slots.includes(formData.booking_time)) {
          setFormData((prev) => ({
            ...prev,
            booking_time: "",
          }));
        }
      } catch (error) {
        console.error("Error cargando horarios:", error);
        setAvailableSlots([]);
      } finally {
        setLoadingSlots(false);
      }
    };

    loadAvailableSlots();
  }, [formData.booking_date, formData.service_id, services]);

  function handleChange(e) {
    const { name, value } = e.target;

    if (name === "service_id" || name === "booking_date") {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
        booking_time: "",
      }));
      return;
    }

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSaving(true);
    setMessage("");

    try {
      const selectedService = services.find(
        (service) => String(service.id) === String(formData.service_id)
      );

      if (!selectedService) {
        throw new Error("Debes seleccionar un servicio válido.");
      }

      if (!formData.booking_time) {
        throw new Error("Debes seleccionar un horario disponible.");
      }

      const estimatedDuration = Number(selectedService.duration || 0);

      if (!estimatedDuration) {
        throw new Error("El servicio seleccionado no tiene duración configurada.");
      }

      const availability = await isTimeSlotAvailable({
        booking_date: formData.booking_date,
        booking_time: formData.booking_time,
        estimated_duration: estimatedDuration,
      });

      if (!availability.available) {
        throw new Error(
          `Ese horario ya está ocupado por otra reserva a las ${availability.conflict.booking_time}.`
        );
      }

      const bookingPayload = {
        customer_name: formData.customer_name,
        customer_phone: formData.customer_phone,
        vehicle_type: formData.vehicle_type,
        vehicle_brand: formData.vehicle_brand,
        vehicle_model: formData.vehicle_model,
        service_id: selectedService.id,
        service_name: selectedService.name,
        booking_date: formData.booking_date,
        booking_time: formData.booking_time,
        estimated_duration: estimatedDuration,
        notes: formData.notes,
        status: "pendiente",
        payment_status: "pendiente",
      };

      await createBooking(bookingPayload);

      setMessage("Reserva guardada correctamente.");

      setFormData({
        customer_name: "",
        customer_phone: "",
        vehicle_type: "",
        vehicle_brand: "",
        vehicle_model: "",
        service_id: "",
        booking_date: "",
        booking_time: "",
        notes: "",
      });

      setAvailableSlots([]);
    } catch (error) {
      console.error(error);
      setMessage(error.message || "Ocurrió un error al guardar la reserva.");
    } finally {
      setSaving(false);
    }
  }

  const selectedService = useMemo(() => {
    return services.find(
      (service) => String(service.id) === String(formData.service_id)
    );
  }, [services, formData.service_id]);

  return (
    <section className="booking-page">
      <div className="container py-5">
        <div className="booking-hero mb-4">
          <span className="booking-eyebrow">Reserva online</span>
          <h1 className="booking-title">Elegí tu servicio y reservá tu turno</h1>
          <p className="booking-subtitle">
            Una experiencia simple, clara y rápida para agendar tu próxima visita.
          </p>
        </div>

        {message && (
          <div className="alert alert-info booking-alert" role="alert">
            {message}
          </div>
        )}

        <div className="row g-4">
          <div className="col-lg-8">
            <form onSubmit={handleSubmit} className="booking-form-card">
              <div className="booking-section">
                <h3 className="booking-section-title">Vehículo</h3>
                <div className="row g-3">
                  <div className="col-md-4">
                    <label className="form-label">Tipo de vehículo</label>
                    <select
                      className="form-select booking-input"
                      name="vehicle_type"
                      value={formData.vehicle_type}
                      onChange={handleChange}
                      required
                    >
                      <option value="">Seleccionar</option>
                      <option value="auto">Auto</option>
                      <option value="camioneta">Camioneta</option>
                      <option value="moto">Moto</option>
                      <option value="bicicleta">Bicicleta</option>
                    </select>
                  </div>

                  <div className="col-md-4">
                    <label className="form-label">Marca</label>
                    <input
                      type="text"
                      className="form-control booking-input"
                      name="vehicle_brand"
                      value={formData.vehicle_brand}
                      onChange={handleChange}
                    />
                  </div>

                  <div className="col-md-4">
                    <label className="form-label">Modelo</label>
                    <input
                      type="text"
                      className="form-control booking-input"
                      name="vehicle_model"
                      value={formData.vehicle_model}
                      onChange={handleChange}
                    />
                  </div>
                </div>
              </div>

              <div className="booking-section">
                <h3 className="booking-section-title">Servicio y turno</h3>
                <div className="row g-3">
                  <div className="col-md-6">
                    <label className="form-label">Servicio</label>
                    <select
                      className="form-select booking-input"
                      name="service_id"
                      value={formData.service_id}
                      onChange={handleChange}
                      required
                      disabled={loadingServices}
                    >
                      <option value="">
                        {loadingServices ? "Cargando servicios..." : "Seleccionar servicio"}
                      </option>
                      {services.map((service) => (
                        <option key={service.id} value={service.id}>
                          {service.name}
                          {service.duration ? ` - ${service.duration} min` : ""}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="col-md-3">
                    <label className="form-label">Fecha</label>
                    <input
                      type="date"
                      className="form-control booking-input"
                      name="booking_date"
                      value={formData.booking_date}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  <div className="col-md-3">
                    <label className="form-label">Hora disponible</label>
                    <select
                      className="form-select booking-input"
                      name="booking_time"
                      value={formData.booking_time}
                      onChange={handleChange}
                      required
                      disabled={!formData.booking_date || !formData.service_id || loadingSlots}
                    >
                      <option value="">
                        {loadingSlots
                          ? "Cargando horarios..."
                          : !formData.booking_date || !formData.service_id
                          ? "Elegí fecha y servicio"
                          : availableSlots.length === 0
                          ? "Sin horarios"
                          : "Seleccionar"}
                      </option>

                      {availableSlots.map((slot) => (
                        <option key={slot} value={slot}>
                          {slot}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              <div className="booking-section">
                <h3 className="booking-section-title">Datos de contacto</h3>
                <div className="row g-3">
                  <div className="col-md-6">
                    <label className="form-label">Nombre y apellido</label>
                    <input
                      type="text"
                      className="form-control booking-input"
                      name="customer_name"
                      value={formData.customer_name}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  <div className="col-md-6">
                    <label className="form-label">Teléfono</label>
                    <input
                      type="text"
                      className="form-control booking-input"
                      name="customer_phone"
                      value={formData.customer_phone}
                      onChange={handleChange}
                      required
                    />
                  </div>
                </div>
              </div>

              <div className="booking-section">
                <h3 className="booking-section-title">Observaciones</h3>
                <textarea
                  className="form-control booking-input"
                  rows="4"
                  name="notes"
                  value={formData.notes}
                  onChange={handleChange}
                  placeholder="Podés dejarnos algún detalle extra sobre el vehículo o el servicio."
                />
              </div>

              <div className="booking-submit-wrap">
                <button type="submit" className="btn booking-submit-btn" disabled={saving}>
                  {saving ? "Guardando..." : "Confirmar reserva"}
                </button>
              </div>
            </form>
          </div>

          <div className="col-lg-4">
            <aside className="booking-summary-card">
              <h3 className="booking-summary-title">Resumen de tu reserva</h3>

              <div className="booking-summary-list">
                <div className="booking-summary-item">
                  <span>Vehículo</span>
                  <strong>
                    {formData.vehicle_type || "Sin seleccionar"}
                  </strong>
                </div>

                <div className="booking-summary-item">
                  <span>Servicio</span>
                  <strong>
                    {selectedService?.name || "Sin seleccionar"}
                  </strong>
                </div>

                <div className="booking-summary-item">
                  <span>Duración estimada</span>
                  <strong>
                    {selectedService?.duration
                      ? `${selectedService.duration} min`
                      : "—"}
                  </strong>
                </div>

                <div className="booking-summary-item">
                  <span>Fecha</span>
                  <strong>{formData.booking_date || "—"}</strong>
                </div>

                <div className="booking-summary-item">
                  <span>Horario</span>
                  <strong>{formData.booking_time || "—"}</strong>
                </div>
              </div>

              <div className="booking-summary-note">
                <h4>Antes de confirmar</h4>
                <p>
                  Revisá bien el servicio, la fecha y el horario. Una vez enviada,
                  la reserva quedará registrada en el sistema.
                </p>
              </div>
            </aside>
          </div>
        </div>
      </div>
    </section>
  );
}