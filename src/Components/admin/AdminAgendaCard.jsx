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

export default function AdminAgendaCard({
  booking,
  onStatusChange,
  onPaymentChange,
  onDelete,
}) {
  return (
    <article className="agenda-card">
      <div className="agenda-card-top">
        <div>
          <h5 className="agenda-card-client mb-1">
            {booking.customer_name || "Sin nombre"}
          </h5>
          <p className="agenda-card-service mb-0">
            {booking.service_name || booking.service || "Servicio no especificado"}
          </p>
        </div>

        <div className="agenda-card-time">
          {formatTimeRange(booking.booking_time, booking.duration)}
        </div>
      </div>

      <div className="agenda-card-body">
        <div className="agenda-card-grid">
          <div>
            <small>Vehículo</small>
            <p className="mb-0">
              {booking.vehicle_type || booking.vehicle || "-"}
            </p>
          </div>

          <div>
            <small>Teléfono</small>
            <p className="mb-0">{booking.phone || "-"}</p>
          </div>

          <div>
            <small>Estado</small>
            <select
              className="form-select form-select-sm"
              value={booking.status || "pendiente"}
              onChange={(e) => onStatusChange(booking.id, e.target.value)}
            >
              <option value="pendiente">pendiente</option>
              <option value="confirmada">confirmada</option>
              <option value="finalizada">finalizada</option>
              <option value="cancelada">cancelada</option>
            </select>
          </div>

          <div>
            <small>Pago</small>
            <select
              className="form-select form-select-sm"
              value={booking.payment_status || "pendiente"}
              onChange={(e) => onPaymentChange(booking.id, e.target.value)}
            >
              <option value="pendiente">pendiente</option>
              <option value="señado">señado</option>
              <option value="pagado">pagado</option>
            </select>
          </div>
        </div>

        {booking.notes && (
          <div className="agenda-card-notes">
            <small>Notas</small>
            <p className="mb-0">{booking.notes}</p>
          </div>
        )}
      </div>

      <div className="agenda-card-actions">
        <button
          className="btn btn-sm btn-outline-danger"
          onClick={() => onDelete(booking.id)}
        >
          Eliminar
        </button>
      </div>
    </article>
  );
}