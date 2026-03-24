import { useEffect, useMemo, useState } from "react";
import AdminLayout from "../Components/admin/AdminLayout.jsx";
import AdminDashboardStats from "../Components/admin/AdminDashboardStats.jsx";
import AdminDashboardFilters from "../Components/admin/AdminDashboardFilters.jsx";
import AdminAgendaDayGroup from "../Components/admin/AdminAgendaDayGroup.jsx";
import {
  getBookings,
  updateBookingStatus,
  updatePaymentStatus,
  deleteBooking,
} from "../lib/bookings.js";
import "../styles/AdminDashboard.css";

export default function AdminDashboard() {
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

        <AdminDashboardStats stats={stats} />

        <AdminDashboardFilters
          selectedDate={selectedDate}
          setSelectedDate={setSelectedDate}
          onReload={loadBookings}
        />

        <div className="card shadow-sm border-0">
          <div className="card-body">
            {loading ? (
              <p>Cargando reservas...</p>
            ) : filteredBookings.length === 0 ? (
              <p>
                {selectedDate
                  ? "No hay reservas para la fecha seleccionada."
                  : "No hay reservas registradas para mostrar."}
              </p>
            ) : (
              <div className="agenda-day-list">
                {Object.entries(groupedBookings).map(([date, dayBookings]) => (
                  <AdminAgendaDayGroup
                    key={date}
                    date={date}
                    dayBookings={dayBookings}
                    onStatusChange={handleStatusChange}
                    onPaymentChange={handlePaymentChange}
                    onDelete={handleDelete}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}