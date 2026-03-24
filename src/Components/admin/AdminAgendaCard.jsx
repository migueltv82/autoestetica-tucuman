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

export default function AdminAgendaCard({
  booking,
  onStatusChange,
  onPaymentChange,
  onDelete,
}) {
  return (
    <article className="agenda-card-v3">
      <div className="agenda-card-v3-top">
        <div className="agenda-card-v3-main">
          <h5 className="agenda-card-client mb-1">
            {booking.customer_name || "Sin nombre"}
          </h5>

          <p className="agenda-card-service mb-0">
            {booking.service_name || booking.service || "Servicio no especificado"}
          </p>
        </div>

        <div className="agenda-card-v3-side">
          <div className="agenda-card-time">
            <i className="bi bi-clock me-2"></i>
            {formatTimeRange(
              booking.booking_time,
              booking.estimated_duration || booking.duration
            )}
          </div>
        </div>
      </div>

      <div className="agenda-badge-row">
        <span className={`agenda-badge ${getStatusClass(booking.status)}`}>
          {booking.status || "sin estado"}
        </span>

        <span className={`agenda-badge ${getPaymentClass(booking.payment_status)}`}>
          {booking.payment_status || "sin pago"}
        </span>
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
            <p className="mb-0">
              {booking.customer_phone || booking.phone || "-"}
            </p>
          </div>

          <div>
            <small>Fecha</small>
            <p className="mb-0">{booking.booking_date || "-"}</p>
          </div>
        </div>

        {booking.notes && (
          <div className="agenda-card-notes">
            <small>Notas</small>
            <p className="mb-0">{booking.notes}</p>
          </div>
        )}
      </div>

      <div className="agenda-card-actions-v3">
        <div className="agenda-action-field">
          <label className="form-label">Estado</label>
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

        <div className="agenda-action-field">
          <label className="form-label">Pago</label>
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

        <div className="agenda-delete-wrap">
          <button
            className="btn btn-sm btn-outline-danger"
            onClick={() => onDelete(booking.id)}
          >
            <i className="bi bi-trash3 me-2"></i>
            Eliminar
          </button>
        </div>
      </div>
    </article>
  );
}