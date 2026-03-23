import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import "../styles/Booking.css";

export default function Booking() {
  const [services, setServices] = useState([]);
  const [loadingServices, setLoadingServices] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("info");

  const [formData, setFormData] = useState({
    full_name: "",
    phone: "",
    email: "",
    vehicle_type: "",
    vehicle_model: "",
    vehicle_plate: "",
    service_id: "",
    booking_date: "",
    booking_time: "",
    notes: "",
  });

  const [selectedService, setSelectedService] = useState(null);

  useEffect(() => {
    fetchServices();
  }, []);

  async function fetchServices() {
    setLoadingServices(true);

    const { data, error } = await supabase
      .from("services")
      .select("*")
      .eq("active", true)
      .order("name", { ascending: true });

    if (error) {
      console.error("Error cargando servicios:", error.message);
      setMessage("No se pudieron cargar los servicios.");
      setMessageType("danger");
    } else {
      setServices(data || []);
    }

    setLoadingServices(false);
  }

  function handleChange(e) {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (name === "service_id") {
      const service = services.find((item) => String(item.id) === value);
      setSelectedService(service || null);
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSubmitting(true);
    setMessage("");

    try {
      const {
        full_name,
        phone,
        email,
        vehicle_type,
        vehicle_model,
        vehicle_plate,
        service_id,
        booking_date,
        booking_time,
        notes,
      } = formData;

      if (
        !full_name.trim() ||
        !phone.trim() ||
        !vehicle_type ||
        !service_id ||
        !booking_date ||
        !booking_time
      ) {
        setMessage("Completá los campos obligatorios.");
        setMessageType("warning");
        setSubmitting(false);
        return;
      }

      const { data: clientData, error: clientError } = await supabase
        .from("clients")
        .insert([
          {
            full_name,
            phone,
            email,
            vehicle_type,
            vehicle_model,
            vehicle_plate,
            notes,
          },
        ])
        .select()
        .single();

      if (clientError) throw clientError;

      const { error: bookingError } = await supabase.from("bookings").insert([
        {
          client_id: clientData.id,
          service_id: Number(service_id),
          booking_date,
          booking_time,
          status: "pendiente",
          notes,
          estimated_duration: selectedService?.duration_minutes || null,
        },
      ]);

      if (bookingError) throw bookingError;

      setMessage("Reserva guardada correctamente.");
      setMessageType("success");

      setFormData({
        full_name: "",
        phone: "",
        email: "",
        vehicle_type: "",
        vehicle_model: "",
        vehicle_plate: "",
        service_id: "",
        booking_date: "",
        booking_time: "",
        notes: "",
      });

      setSelectedService(null);
    } catch (error) {
      console.error("Error al guardar la reserva:", error.message);
      setMessage("Ocurrió un error al guardar la reserva.");
      setMessageType("danger");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="booking-page">
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-lg-10 col-xl-9">
            <div className="booking-card">
              <div className="card-body p-4 p-md-5">
                <h2 className="booking-title mb-2 text-center">Reservá tu turno</h2>
                <p className="booking-subtitle text-center mb-4">
                  Completá el formulario y te registramos la reserva.
                </p>

                {message && (
                  <div className={`alert alert-${messageType} rounded-4`}>
                    {message}
                  </div>
                )}

                <form onSubmit={handleSubmit}>
                  <div className="row">
                    <div className="col-md-6 mb-3">
                      <label className="booking-label" htmlFor="full_name">
                        Nombre y apellido *
                      </label>
                      <input
                        id="full_name"
                        type="text"
                        className="form-control booking-input"
                        name="full_name"
                        value={formData.full_name}
                        onChange={handleChange}
                        placeholder="Ej: Juan Pérez"
                      />
                    </div>

                    <div className="col-md-6 mb-3">
                      <label className="booking-label" htmlFor="phone">
                        WhatsApp *
                      </label>
                      <input
                        id="phone"
                        type="text"
                        className="form-control booking-input"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        placeholder="Ej: 3815551234"
                      />
                    </div>

                    <div className="col-md-6 mb-3">
                      <label className="booking-label" htmlFor="email">
                        Email
                      </label>
                      <input
                        id="email"
                        type="email"
                        className="form-control booking-input"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        placeholder="Ej: cliente@email.com"
                      />
                    </div>

                    <div className="col-md-6 mb-3">
                      <label className="booking-label" htmlFor="vehicle_type">
                        Tipo de vehículo *
                      </label>
                      <select
                        id="vehicle_type"
                        className="form-select booking-select"
                        name="vehicle_type"
                        value={formData.vehicle_type}
                        onChange={handleChange}
                      >
                        <option value="">Seleccionar tipo de vehículo</option>
                        <option value="Auto">Auto</option>
                        <option value="Camioneta">Camioneta</option>
                        <option value="SUV">SUV</option>
                        <option value="Moto">Moto</option>
                        <option value="Bicicleta">Bicicleta</option>
                      </select>
                    </div>

                    <div className="col-md-6 mb-3">
                      <label className="booking-label" htmlFor="vehicle_model">
                        Modelo del vehículo
                      </label>
                      <input
                        id="vehicle_model"
                        type="text"
                        className="form-control booking-input"
                        name="vehicle_model"
                        value={formData.vehicle_model}
                        onChange={handleChange}
                        placeholder="Ej: Ford Fiesta / Honda Wave"
                      />
                    </div>

                    <div className="col-md-6 mb-3">
                      <label className="booking-label" htmlFor="vehicle_plate">
                        Patente
                      </label>
                      <input
                        id="vehicle_plate"
                        type="text"
                        className="form-control booking-input"
                        name="vehicle_plate"
                        value={formData.vehicle_plate}
                        onChange={handleChange}
                        placeholder="Ej: AB123CD"
                      />
                    </div>

                    <div className="col-md-6 mb-3">
                      <label className="booking-label" htmlFor="service_id">
                        Servicio *
                      </label>
                      <select
                        id="service_id"
                        className="form-select booking-select"
                        name="service_id"
                        value={formData.service_id}
                        onChange={handleChange}
                        disabled={loadingServices}
                      >
                        <option value="">
                          {loadingServices ? "Cargando servicios..." : "Seleccionar servicio"}
                        </option>
                        {services.map((service) => (
                          <option key={service.id} value={service.id}>
                            {service.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="col-md-3 mb-3">
                      <label className="booking-label" htmlFor="booking_date">
                        Fecha *
                      </label>
                      <input
                        id="booking_date"
                        type="date"
                        className="form-control booking-input"
                        name="booking_date"
                        value={formData.booking_date}
                        onChange={handleChange}
                      />
                    </div>

                    <div className="col-md-3 mb-3">
                      <label className="booking-label" htmlFor="booking_time">
                        Hora *
                      </label>
                      <input
                        id="booking_time"
                        type="time"
                        className="form-control booking-input"
                        name="booking_time"
                        value={formData.booking_time}
                        onChange={handleChange}
                      />
                    </div>

                    <div className="col-12 mb-3">
                      <label className="booking-label" htmlFor="notes">
                        Observaciones
                      </label>
                      <textarea
                        id="notes"
                        className="form-control booking-textarea"
                        rows="4"
                        name="notes"
                        value={formData.notes}
                        onChange={handleChange}
                        placeholder="Podés agregar detalles del vehículo o alguna aclaración sobre el servicio"
                      />
                    </div>
                  </div>

                  {selectedService && (
                    <div className="booking-service-box mb-4">
                      <p>
                        <strong>Servicio seleccionado:</strong> {selectedService.name}
                      </p>
                      <p>
                        <strong>Duración estimada:</strong> {selectedService.duration_minutes} min
                      </p>
                      <p>
                        <strong>Descripción:</strong> {selectedService.description || "Sin descripción"}
                      </p>
                    </div>
                  )}

                  <div className="d-grid">
                    <button
                      type="submit"
                      className="booking-btn"
                      disabled={submitting}
                    >
                      {submitting ? "Guardando..." : "Guardar reserva"}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
