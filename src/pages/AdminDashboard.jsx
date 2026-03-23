import { useEffect, useMemo, useState } from "react";
import AdminLayout from "../Components/admin/AdminLayout.jsx";
import {
  getBookings,
  updateBookingStatus,
  updatePaymentStatus,
  deleteBooking,
} from "../lib/bookings.js";
import "../styles/AdminDashboard.css";

function formatDateLabel(dateString) {
  const date = new Date(`${dateString}T00:00:00`);
  return date.toLocaleDateString("es-AR", {
    weekday: "long",
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}

function formatTimeRange(startTime, duration) {
  if (!startTime || !duration) return startTime || "-";

  const [hours, minutes] = startTime.split(":").map(Number);
  const totalStart = hours * 60 + minutes;
  const totalEnd = totalStart + Number(duration);

  const endHours = Math.floor(totalEnd / 60)
    .toString()
    .padStart(2, "0");
  const endMinutes = (totalEnd % 60).toString().padStart(2, "0");

  return `${startTime.slice(0, 5)} - ${endHours}:${endMinutes}`;
}

function AdminDashboard() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [selectedDate, setSelectedDate] = useState("");

  async function loadBookings() {
    try {
      setLoading(true);
      setMessage("");
      const data = await getBookings();
      setBookings(data);
    } catch (error) {
      console.error(error);
      setMessage("Error al cargar las reservas.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadBookings();
  }, []);

  async function handleStatusChange(id, newStatus) {
    try {
      await updateBookingStatus(id, newStatus);

      setBookings((prev) =>
        prev.map((booking) =>
          booking.id === id ? { ...booking, status: newStatus } : booking
        )
      );
    } catch (error) {
      console.error(error);
      setMessage("No se pudo actualizar el estado de la reserva.");
    }
  }

  async function handlePaymentChange(id, newPaymentStatus) {
    try {
      await updatePaymentStatus(id, newPaymentStatus);

      setBookings((prev) =>
        prev.map((booking) =>
          booking.id === id
            ? { ...booking, payment_status: newPaymentStatus }
            : booking
        )
      );
    } catch (error) {
      console.error(error);
      setMessage("No se pudo actualizar el estado de pago.");
    }
  }

  async function handleDelete(id) {
    const confirmDelete = window.confirm(
      "¿Seguro que querés eliminar esta reserva?"
    );

    if (!confirmDelete) return;

    try {
      await deleteBooking(id);
      setBookings((prev) => prev.filter((booking) => booking.id !== id));
      setMessage("Reserva eliminada correctamente.");
    } catch (error) {
      console.error(error);
      setMessage(error.message || "No se pudo eliminar la reserva.");
    }
  }

  const stats = useMemo(() => {
    const total = bookings.length;
    const pendientes = bookings.filter((b) => b.status === "pendiente").length;
    const confirmadas = bookings.filter((b) => b.status === "confirmada").length;
    const finalizadas = bookings.filter((b) => b.status === "finalizada").length;

    return {
      total,
      pendientes,
      confirmadas,
      finalizadas,
    };
  }, [bookings]);

  const filteredBookings = useMemo(() => {
    let result = [...bookings];

    if (selectedDate) {
      result = result.filter((booking) => booking.booking_date === selectedDate);
    }

    return result.sort((a, b) => {
      if (a.booking_date !== b.booking_date) {
        return a.booking_date.localeCompare(b.booking_date);
      }

      return a.booking_time.localeCompare(b.booking_time);
    });
  }, [bookings, selectedDate]);

  const groupedBookings = useMemo(() => {
    return filteredBookings.reduce((acc, booking) => {
      const dateKey = booking.booking_date;

      if (!acc[dateKey]) {
        acc[dateKey] = [];
      }

      acc[dateKey].push(booking);
      return acc;
    }, {});
  }, [filteredBookings]);

  return (
    <AdminLayout>
      <div className="admin-dashboard container py-4">
        <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-2">
          <div>
            <h2 className="mb-1">Panel de reservas</h2>
            <p className="text-muted mb-0">
              Gestión real de turnos guardados en Supabase
            </p>
          </div>

          <button className="btn btn-dark" onClick={loadBookings}>
            Recargar
          </button>
        </div>

        {message && (
          <div className="alert alert-info" role="alert">
            {message}
          </div>
        )}

        <div className="row g-3 mb-4">
          <div className="col-md-3">
            <div className="admin-total-box">
              <div className="admin-total-label">Total reservas</div>
              <div className="admin-total-value">{stats.total}</div>
            </div>
          </div>

          <div className="col-md-3">
            <div className="admin-total-box">
              <div className="admin-total-label">Pendientes</div>
              <div className="admin-total-value">{stats.pendientes}</div>
            </div>
          </div>

          <div className="col-md-3">
            <div className="admin-total-box">
              <div className="admin-total-label">Confirmadas</div>
              <div className="admin-total-value">{stats.confirmadas}</div>
            </div>
          </div>

          <div className="col-md-3">
            <div className="admin-total-box">
              <div className="admin-total-label">Finalizadas</div>
              <div className="admin-total-value">{stats.finalizadas}</div>
            </div>
          </div>
        </div>

        <div className="card shadow-sm border-0">
          <div className="card-body">
            <h5 className="mb-3">Agenda de reservas</h5>

            <div className="row g-3 mb-4">
              <div className="col-md-4">
                <label className="form-label">Filtrar por fecha</label>
                <input
                  type="date"
                  className="form-control"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                />
              </div>

              <div className="col-md-4 d-flex align-items-end">
                <button
                  className="btn btn-outline-secondary"
                  onClick={() => setSelectedDate("")}
                >
                  Limpiar filtro
                </button>
              </div>
            </div>

            {loading ? (
              <p>Cargando reservas...</p>
            ) : filteredBookings.length === 0 ? (
              <p>No hay reservas registradas para mostrar.</p>
            ) : (
              <div className="agenda-day-list">
                {Object.entries(groupedBookings).map(([date, dayBookings]) => (
                  <section className="agenda-day-group" key={date}>
                    <div className="agenda-day-header">
                      <h4 className="agenda-day-title mb-0">
                        {formatDateLabel(date)}
                      </h4>
                      <span className="agenda-day-count">
                        {dayBookings.length}{" "}
                        {dayBookings.length === 1 ? "turno" : "turnos"}
                      </span>
                    </div>

                    <div className="agenda-grid">
                      {dayBookings.map((booking) => (
                        <div className="agenda-card" key={booking.id}>
                          <div className="agenda-card-header">
                            <div>
                              <h6 className="agenda-client mb-1">
                                {booking.customer_name}
                              </h6>
                              <p className="agenda-service mb-0">
                                {booking.service_name}
                              </p>
                            </div>

                            <span
                              className={`agenda-status status-${booking.status
                                ?.replace(/\s+/g, "-")
                                .toLowerCase()}`}
                            >
                              {booking.status}
                            </span>
                          </div>

                          <div className="agenda-card-body">
                            <p className="mb-1">
                              <strong>Horario:</strong>{" "}
                              {formatTimeRange(
                                booking.booking_time,
                                booking.estimated_duration
                              )}
                            </p>
                            <p className="mb-1">
                              <strong>Vehículo:</strong> {booking.vehicle_type}{" "}
                              {booking.vehicle_brand || ""}{" "}
                              {booking.vehicle_model || ""}
                            </p>
                            <p className="mb-1">
                              <strong>Teléfono:</strong> {booking.customer_phone}
                            </p>
                            <p className="mb-1">
                              <strong>Pago:</strong> {booking.payment_status}
                            </p>
                            {booking.notes && (
                              <p className="mb-0">
                                <strong>Notas:</strong> {booking.notes}
                              </p>
                            )}
                          </div>

                          <div className="agenda-card-footer">
                            <select
                              className="form-select form-select-sm"
                              value={booking.status}
                              onChange={(e) =>
                                handleStatusChange(booking.id, e.target.value)
                              }
                            >
                              <option value="pendiente">Pendiente</option>
                              <option value="confirmada">Confirmada</option>
                              <option value="en proceso">En proceso</option>
                              <option value="finalizada">Finalizada</option>
                              <option value="cancelada">Cancelada</option>
                            </select>

                            <select
                              className="form-select form-select-sm"
                              value={booking.payment_status}
                              onChange={(e) =>
                                handlePaymentChange(
                                  booking.id,
                                  e.target.value
                                )
                              }
                            >
                              <option value="pendiente">Pendiente</option>
                              <option value="señado">Señado</option>
                              <option value="pagado">Pagado</option>
                            </select>

                            <button
                              className="btn btn-sm btn-outline-danger"
                              onClick={() => handleDelete(booking.id)}
                            >
                              Eliminar
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </section>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}

export default AdminDashboard;