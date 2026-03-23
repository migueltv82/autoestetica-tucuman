import { useEffect, useMemo, useState } from "react";
import AdminLayout from "../Components/admin/AdminLayout.jsx";
import {
  getBookings,
  updateBookingStatus,
  updatePaymentStatus,
  deleteBooking,
} from "../lib/bookings";
import "../styles/AdminDashboard.css";

function AdminDashboard() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  async function loadBookings() {
    try {
      setLoading(true);
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
    await loadBookings();
    setMessage("Reserva eliminada correctamente.");
  } catch (error) {
    console.error("Error al eliminar:", error);
    setMessage(error.message || "No se pudo eliminar la reserva.");
  }
}

  const stats = useMemo(() => {
    const total = bookings.length;
    const pendientes = bookings.filter((b) => b.status === "pendiente").length;
    const confirmadas = bookings.filter((b) => b.status === "confirmada").length;
    const finalizadas = bookings.filter((b) => b.status === "finalizada").length;

    return { total, pendientes, confirmadas, finalizadas };
  }, [bookings]);

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

        {message && <div className="alert alert-warning">{message}</div>}

        <div className="row g-3 mb-4">
          <div className="col-md-3">
            <div className="card shadow-sm border-0">
              <div className="card-body">
                <h6 className="text-muted">Total reservas</h6>
                <h3>{stats.total}</h3>
              </div>
            </div>
          </div>

          <div className="col-md-3">
            <div className="card shadow-sm border-0">
              <div className="card-body">
                <h6 className="text-muted">Pendientes</h6>
                <h3>{stats.pendientes}</h3>
              </div>
            </div>
          </div>

          <div className="col-md-3">
            <div className="card shadow-sm border-0">
              <div className="card-body">
                <h6 className="text-muted">Confirmadas</h6>
                <h3>{stats.confirmadas}</h3>
              </div>
            </div>
          </div>

          <div className="col-md-3">
            <div className="card shadow-sm border-0">
              <div className="card-body">
                <h6 className="text-muted">Finalizadas</h6>
                <h3>{stats.finalizadas}</h3>
              </div>
            </div>
          </div>
        </div>

        <div className="card shadow-sm border-0">
          <div className="card-body">
            <h5 className="mb-3">Listado de reservas</h5>

            {loading ? (
              <p>Cargando reservas...</p>
            ) : bookings.length === 0 ? (
              <p>No hay reservas registradas todavía.</p>
            ) : (
              <div className="table-responsive">
                <table className="table align-middle">
                  <thead>
                    <tr>
                      <th>Cliente</th>
                      <th>Teléfono</th>
                      <th>Vehículo</th>
                      <th>Servicio</th>
                      <th>Fecha</th>
                      <th>Hora</th>
                      <th>Estado</th>
                      <th>Pago</th>
                      <th>Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {bookings.map((booking) => (
                      <tr key={booking.id}>
                        <td>{booking.customer_name}</td>
                        <td>{booking.customer_phone}</td>
                        <td>
                          {booking.vehicle_type}
                          {(booking.vehicle_brand || booking.vehicle_model) && (
                            <>
                              <br />
                              <small className="text-muted">
                                {booking.vehicle_brand || ""}{" "}
                                {booking.vehicle_model || ""}
                              </small>
                            </>
                          )}
                        </td>
                        <td>{booking.service_name}</td>
                        <td>{booking.booking_date}</td>
                        <td>{booking.booking_time}</td>
                        <td>
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
                        </td>
                        <td>
                          <select
                            className="form-select form-select-sm"
                            value={booking.payment_status}
                            onChange={(e) =>
                              handlePaymentChange(booking.id, e.target.value)
                            }
                          >
                            <option value="pendiente">Pendiente</option>
                            <option value="señado">Señado</option>
                            <option value="pagado">Pagado</option>
                          </select>
                        </td>
                        <td>
                          <button
                            className="btn btn-sm btn-outline-danger"
                            onClick={() => handleDelete(booking.id)}
                          >
                            Eliminar
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}

export default AdminDashboard;