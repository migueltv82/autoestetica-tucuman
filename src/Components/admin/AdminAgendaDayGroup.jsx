import AdminAgendaCard from "./AdminAgendaCard.jsx";

function formatDateLabel(dateString) {
  const date = new Date(`${dateString}T00:00:00`);
  return date.toLocaleDateString("es-AR", {
    weekday: "long",
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}

export default function AdminAgendaDayGroup({
  date,
  dayBookings,
  onStatusChange,
  onPaymentChange,
  onDelete,
}) {
  return (
    <section className="agenda-day-group">
      <div className="agenda-day-header">
        <h4 className="agenda-day-title mb-0">{formatDateLabel(date)}</h4>
        <span className="agenda-day-count">
          {dayBookings.length} {dayBookings.length === 1 ? "reserva" : "reservas"}
        </span>
      </div>

      <div className="agenda-card-list">
        {dayBookings.map((booking) => (
          <AdminAgendaCard
            key={booking.id}
            booking={booking}
            onStatusChange={onStatusChange}
            onPaymentChange={onPaymentChange}
            onDelete={onDelete}
          />
        ))}
      </div>
    </section>
  );
}