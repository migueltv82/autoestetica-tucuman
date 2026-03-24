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
    <section className="agenda-day-group-v3">
      <div className="agenda-day-header-v3">
        <div>
          <p className="agenda-day-kicker">Agenda</p>
          <h4 className="agenda-day-title mb-1">{formatDateLabel(date)}</h4>
          <p className="agenda-day-subtitle mb-0">
            {dayBookings.length} {dayBookings.length === 1 ? "reserva" : "reservas"}
          </p>
        </div>

        <span className="agenda-day-count-v3">{dayBookings.length}</span>
      </div>

      <div className="agenda-card-list-v3">
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