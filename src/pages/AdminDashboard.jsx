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

function getStatusClass(status) {
  const normalized = (status || "").toLowerCase();

  if (normalized === "pendiente") return "status-pendiente";
  if (normalized === "confirmada") return "status-confirmada";
  if (normalized === "finalizada") return "status-finalizada";
  if (normalized === "cancelada") return "status-cancelada";

  return "status-default";
}

function getPaymentClass(paymentStatus) {
  const normalized = (paymentStatus || "").toLowerCase();

  if (normalized === "pendiente") return "payment-pendiente";
  if (normalized === "señado") return "payment-señado";
  if (normalized === "pagado") return "payment-pagado";

  return "payment-default";
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
      setBookings(data || []);
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

  const todayString = useMemo(() => {
    return new Date().toISOString().split("T")[0];
  }, []);

  const stats = useMemo(() => {
    const total = bookings.length;
    const pendientes = bookings.filter((b) => b.status === "pendiente").length;
    const confirmadas = bookings.filter((b) => b.status === "confirmada").length;
    const pagosPendientes = bookings.filter(
      (b) => (b.payment_status || "").toLowerCase() === "pendiente"
    ).length;
    const hoy = bookings.filter((b) => b.booking_date === todayString).length;

    return {
      total,
      pendientes,
      confirmadas,
      pagosPendientes,
      hoy,
    };
  }, [bookings, todayString]);

  const filteredBookings = useMemo(() => {
    let result = [...bookings];

    if (selectedDate) {
      result = result.filter((booking) => booking.booking_date === selectedDate);
    }

    return result.sort((a, b) => {
      if (a.booking_date !== b.booking_date) {
        return a.booking_date.localeCompare(b.booking_date);
      }

      return (a.booking_time || "").localeCompare(b.booking_time || "");
    });
  }, [bookings, selectedDate]);

  const groupedBookings = useMemo(() => {
    return filteredBookings.reduce((acc, booking) => {
      const dateKey = booking.booking_date || "Sin fecha";

      if (!acc[dateKey]) {
        acc[dateKey] = [];
      }

      acc[dateKey].push(booking);
      return acc;
    }, {});
  }, [filteredBookings]);

  return (
    <AdminLayout
      title="Dashboard de reservas"
      subtitle="Controlá turnos, pagos y estados desde una vista clara, rápida y más cómoda de usar."
    >
      <div className="admin-dashboard-v2">
        {message && (
          <div className="alert alert-info admin-alert-box" role="alert">
            {message}
          </div>
        )}

        <section className="dashboard-hero-v2">
          <div className="dashboard-hero-copy">
            <span className="dashboard-kicker">Operación diaria</span>
            <h2 className="dashboard-hero-title">
              Gestión centralizada de reservas del taller
            </h2>
            <p className="dashboard-hero-text">
              Visualizá los turnos del día, actualizá estados, controlá pagos y
              mantené ordenada la agenda sin perder tiempo.
            </p>
          </div>

          <div className="dashboard-hero-actions">
            <button className="btn btn-brand-dark" onClick={loadBookings}>
              <i className="bi bi-arrow-clockwise me-2"></i>
              Recargar reservas
            </button>

            <button
              className="btn btn-outline-light"
              onClick={() => setSelectedDate(todayString)}
            >
              <i className="bi bi-calendar-event me-2"></i>
              Ver hoy
            </button>
          </div>
        </section>

        <section className="dashboard-stats-grid mb-4">
          <article className="dashboard-stat-card">
            <div className="dashboard-stat-icon">
              <i className="bi bi-calendar2-week"></i>
            </div>
            <div>
              <p className="dashboard-stat-label">Total reservas</p>
              <h3 className="dashboard-stat-value">{stats.total}</h3>
            </div>
          </article>

          <article className="dashboard-stat-card">
            <div className="dashboard-stat-icon">
              <i className="bi bi-hourglass-split"></i>
            </div>
            <div>
              <p className="dashboard-stat-label">Pendientes</p>
              <h3 className="dashboard-stat-value">{stats.pendientes}</h3>
            </div>
          </article>

          <article className="dashboard-stat-card">
            <div className="dashboard-stat-icon">
              <i className="bi bi-patch-check"></i>
            </div>
            <div>
              <p className="dashboard-stat-label">Confirmadas</p>
              <h3 className="dashboard-stat-value">{stats.confirmadas}</h3>
            </div>
          </article>

          <article className="dashboard-stat-card">
            <div className="dashboard-stat-icon">
              <i className="bi bi-cash-stack"></i>
            </div>
            <div>
              <p className="dashboard-stat-label">Pagos pendientes</p>
              <h3 className="dashboard-stat-value">{stats.pagosPendientes}</h3>
            </div>
          </article>

          <article className="dashboard-stat-card dashboard-stat-card-highlight">
            <div className="dashboard-stat-icon">
              <i className="bi bi-calendar-day"></i>
            </div>
            <div>
              <p className="dashboard-stat-label">Turnos de hoy</p>
              <h3 className="dashboard-stat-value">{stats.hoy}</h3>
            </div>
          </article>
        </section>

        <section className="dashboard-panel-v2">
          <div className="dashboard-panel-head">
            <div>
              <p className="dashboard-panel-kicker">Agenda</p>
              <h3 className="dashboard-panel-title">Reservas programadas</h3>
            </div>
          </div>

          <div className="dashboard-filter-bar">
            <div className="dashboard-filter-field">
              <label className="form-label">Filtrar por fecha</label>
              <input
                type="date"
                className="form-control admin-filter-input"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
              />
            </div>

            <div className="dashboard-filter-actions">
              <button
                className="btn btn-outline-secondary"
                onClick={() => setSelectedDate("")}
              >
                Limpiar filtro
              </button>

              <button
                className="btn btn-outline-light"
                onClick={() => setSelectedDate(todayString)}
              >
                Hoy
              </button>
            </div>
          </div>

          {loading ? (
            <div className="dashboard-empty-box">
              <p className="mb-0">Cargando reservas...</p>
            </div>
          ) : filteredBookings.length === 0 ? (
            <div className="dashboard-empty-box">
              <p className="mb-0">
                {selectedDate
                  ? "No hay reservas para la fecha seleccionada."
                  : "No hay reservas registradas para mostrar."}
              </p>
            </div>
          ) : (
            <div className="agenda-day-list">
              {Object.entries(groupedBookings).map(([date, dayBookings]) => (
                <section className="agenda-day-group" key={date}>
                  <div className="agenda-day-header">
                    <div>
                      <h4 className="agenda-day-title mb-1">
                        {formatDateLabel(date)}
                      </h4>
                      <p className="agenda-day-subtitle mb-0">
                        {dayBookings.length}{" "}
                        {dayBookings.length === 1 ? "reserva" : "reservas"}
                      </p>
                    </div>

                    <span className="agenda-day-badge">
                      {dayBookings.length}
                    </span>
                  </div>

                  <div className="agenda-card-stack">
                    {dayBookings.map((booking) => (
                      <article className="agenda-card-v2" key={booking.id}>
                        <div className="agenda-card-v2-top">
                          <div>
                            <h5 className="agenda-client-name mb-1">
                              {booking.customer_name || "Sin nombre"}
                            </h5>

                            <p className="agenda-service-name mb-0">
                              {booking.service_name || "Servicio no especificado"}
                            </p>
                          </div>

                          <div className="agenda-badge-group">
                            <span className={`agenda-badge ${getStatusClass(booking.status)}`}>
                              {booking.status || "Sin estado"}
                            </span>

                            <span
                              className={`agenda-badge ${getPaymentClass(
                                booking.payment_status
                              )}`}
                            >
                              {booking.payment_status || "Sin pago"}
                            </span>
                          </div>
                        </div>

                        <div className="agenda-card-v2-body">
                          <div className="agenda-detail-grid">
                            <div>
                              <small>Horario</small>
                              <p className="mb-0">
                                {formatTimeRange(
                                  booking.booking_time,
                                  booking.estimated_duration
                                )}
                              </p>
                            </div>

                            <div>
                              <small>Vehículo</small>
                              <p className="mb-0">
                                {booking.vehicle_type || "-"}{" "}
                                {booking.vehicle_brand || ""}{" "}
                                {booking.vehicle_model || ""}
                              </p>
                            </div>

                            <div>
                              <small>Teléfono</small>
                              <p className="mb-0">{booking.customer_phone || "-"}</p>
                            </div>
                          </div>

                          {booking.notes && (
                            <div className="agenda-notes-box">
                              <small>Notas</small>
                              <p className="mb-0">{booking.notes}</p>
                            </div>
                          )}
                        </div>

                        <div className="agenda-card-v2-actions">
                          <div className="agenda-action-field">
                            <label className="form-label">Estado</label>
                            <select
                              className="form-select form-select-sm"
                              value={booking.status || "pendiente"}
                              onChange={(e) =>
                                handleStatusChange(booking.id, e.target.value)
                              }
                            >
                              <option value="pendiente">pendiente</option>
                              <option value="confirmada">confirmada</option>
                              <option value="finalizada">finalizada</option>
                              <option value="cancelada">cancelada</option>
                            </select>
                          </div>

                          <div className="agenda-action-field">
                            <label className="form-label">Pago</label>
                            <select
                              className="form-select form-select-sm"
                              value={booking.payment_status || "pendiente"}
                              onChange={(e) =>
                                handlePaymentChange(booking.id, e.target.value)
                              }
                            >
                              <option value="pendiente">pendiente</option>
                              <option value="señado">señado</option>
                              <option value="pagado">pagado</option>
                            </select>
                          </div>

                          <div className="agenda-delete-wrap">
                            <button
                              className="btn btn-sm btn-outline-danger"
                              onClick={() => handleDelete(booking.id)}
                            >
                              <i className="bi bi-trash3 me-2"></i>
                              Eliminar
                            </button>
                          </div>
                        </div>
                      </article>
                    ))}
                  </div>
                </section>
              ))}
            </div>
          )}
        </section>
      </div>
    </AdminLayout>
  );
}

export default AdminDashboard;