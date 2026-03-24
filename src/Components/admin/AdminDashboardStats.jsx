export default function AdminDashboardStats({ stats }) {
  return (
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
  );
}