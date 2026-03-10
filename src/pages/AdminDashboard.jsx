import { useMemo } from 'react';

function AdminDashboard() {
  const appointments = JSON.parse(localStorage.getItem('adminAppointments') || '[]');
  const cashEntries = JSON.parse(localStorage.getItem('adminCashEntries') || '[]');

  const summary = useMemo(() => {
    const totalReservations = appointments.length;
    const totalRevenueProjected = appointments.reduce(
      (acc, item) => acc + Number(item.total || 0),
      0
    );
    const totalCollected = cashEntries.reduce(
      (acc, item) => acc + Number(item.amount || 0),
      0
    );

    const pendingPayments = appointments.filter(
      (item) => (item.paymentStatus || 'Pendiente') !== 'Pagado'
    ).length;

    const paidReservations = appointments.filter(
      (item) => (item.paymentStatus || 'Pendiente') === 'Pagado'
    ).length;

    const upcoming = [...appointments]
      .sort((a, b) => a.date.localeCompare(b.date))
      .slice(0, 5);

    return {
      totalReservations,
      totalRevenueProjected,
      totalCollected,
      pendingPayments,
      paidReservations,
      upcoming,
    };
  }, [appointments, cashEntries]);

  return (
    <section className="page-section">
      <div className="container py-5">
        <div className="text-center mb-5">
          <h2 className="section-title">Dashboard general</h2>
          <p className="section-text">
            Vista rápida del movimiento general de Autoestética Tucumán.
          </p>
        </div>

        <div className="row g-3 mb-4">
          <div className="col-md-3">
            <div className="content-card stats-card">
              <p className="stats-label">Reservas</p>
              <h3 className="stats-value">{summary.totalReservations}</h3>
            </div>
          </div>

          <div className="col-md-3">
            <div className="content-card stats-card">
              <p className="stats-label">Facturación proyectada</p>
              <h3 className="stats-value">
                ${summary.totalRevenueProjected.toLocaleString('es-AR')}
              </h3>
            </div>
          </div>

          <div className="col-md-3">
            <div className="content-card stats-card">
              <p className="stats-label">Cobrado</p>
              <h3 className="stats-value">
                ${summary.totalCollected.toLocaleString('es-AR')}
              </h3>
            </div>
          </div>

          <div className="col-md-3">
            <div className="content-card stats-card">
              <p className="stats-label">Pagos pendientes</p>
              <h3 className="stats-value">{summary.pendingPayments}</h3>
            </div>
          </div>
        </div>

        <div className="row g-4">
          <div className="col-lg-6">
            <div className="content-card">
              <h4 className="mb-4">Estado de reservas</h4>

              <div className="dashboard-list">
                <div className="dashboard-list-item">
                  <span>Reservas pagadas</span>
                  <strong>{summary.paidReservations}</strong>
                </div>
                <div className="dashboard-list-item">
                  <span>Reservas con pago pendiente o seña</span>
                  <strong>{summary.pendingPayments}</strong>
                </div>
              </div>
            </div>
          </div>

          <div className="col-lg-6">
            <div className="content-card">
              <h4 className="mb-4">Próximas reservas</h4>

              {summary.upcoming.length > 0 ? (
                <div className="dashboard-list">
                  {summary.upcoming.map((item) => (
                    <div key={item.id} className="dashboard-list-item">
                      <div>
                        <strong>{item.client}</strong>
                        <div className="text-muted-custom">
                          {new Date(`${item.date}T00:00:00`).toLocaleDateString('es-AR')} · {item.vehicle}
                        </div>
                      </div>
                      <span
                        className={`status-badge payment-${(item.paymentStatus || 'Pendiente').toLowerCase()}`}
                      >
                        {item.paymentStatus || 'Pendiente'}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="mb-0 text-muted-custom">No hay reservas cargadas.</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default AdminDashboard;