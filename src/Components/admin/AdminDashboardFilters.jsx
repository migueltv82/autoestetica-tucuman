export default function AdminDashboardFilters({
  selectedDate,
  setSelectedDate,
  onReload,
}) {
  return (
    <section className="admin-filters-panel-v2">
      <div className="admin-filters-head">
        <div>
          <p className="admin-filters-kicker">Agenda</p>
          <h3 className="admin-filters-title">Filtros de reservas</h3>
        </div>

        <button className="btn btn-brand-dark" onClick={onReload}>
          <i className="bi bi-arrow-clockwise me-2"></i>
          Recargar
        </button>
      </div>

      <div className="admin-filters-grid">
        <div className="admin-filter-field">
          <label className="form-label">Filtrar por fecha</label>
          <input
            type="date"
            className="form-control admin-filter-input"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
          />
        </div>

        <div className="admin-filter-actions">
          <button
            className="btn btn-outline-secondary"
            onClick={() => setSelectedDate("")}
          >
            Limpiar filtro
          </button>
        </div>
      </div>
    </section>
  );
}