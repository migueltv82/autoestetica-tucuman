export default function AdminDashboardFilters({
  selectedDate,
  setSelectedDate,
  onReload,
}) {
  return (
    <div className="card shadow-sm border-0 mb-4">
      <div className="card-body">
        <div className="d-flex justify-content-between align-items-center flex-wrap gap-3 mb-4">
          <h5 className="mb-0">Agenda de reservas</h5>

          <button className="btn btn-dark" onClick={onReload}>
            Recargar
          </button>
        </div>

        <div className="row g-3">
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
      </div>
    </div>
  );
}