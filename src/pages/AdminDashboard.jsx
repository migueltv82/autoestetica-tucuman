import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import AdminLayout from '../components/admin/AdminLayout.jsx';

function AdminDashboard() {
  const navigate = useNavigate();

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
    );

    const paidReservations = appointments.filter(
      (item) => (item.paymentStatus || 'Pendiente') === 'Pagado'
    ).length;

    const upcoming = [...appointments]
      .sort((a, b) => a.date.localeCompare(b.date))
      .slice(0, 5);

    const today = new Date().toISOString().split('T')[0];

    const todayReservations = appointments.filter((item) => item.date === today);

    const pendingAmount = appointments.reduce((acc, item) => {
      const total = Number(item.total || 0);
      const paid = Number(item.paidAmount || 0);
      const balance = Math.max(total - paid, 0);
      return acc + balance;
    }, 0);

    const serviceCountMap = {};

    appointments.forEach((item) => {
      (item.services || []).forEach((service) => {
        serviceCountMap[service] = (serviceCountMap[service] || 0) + 1;
      });
    });

    const topServiceEntry = Object.entries(serviceCountMap).sort((a, b) => b[1] - a[1])[0];
    const topService = topServiceEntry
      ? { name: topServiceEntry[0], count: topServiceEntry[1] }
      : null;

    const collectionRate =
      totalRevenueProjected > 0
        ? Math.round((totalCollected / totalRevenueProjected) * 100)
        : 0;

    const paymentAlerts = pendingPayments
      .map((item) => ({
        id: item.id,
        client: item.client,
        vehicle: item.vehicle,
        services: item.services || [],
        date: item.date,
        shift: item.shift,
        balance: Math.max(Number(item.total || 0) - Number(item.paidAmount || 0), 0),
        paymentStatus: item.paymentStatus || 'Pendiente',
      }))
      .sort((a, b) => a.date.localeCompare(b.date))
      .slice(0, 5);

    return {
      totalReservations,
      totalRevenueProjected,
      totalCollected,
      pendingPayments: pendingPayments.length,
      paidReservations,
      upcoming,
      collectionRate,
      todayReservations,
      pendingAmount,
      topService,
      paymentAlerts,
    };
  }, [appointments, cashEntries]);

  const goToAgenda = (item) => {
    navigate(`/agenda?client=${encodeURIComponent(item.client)}`);
  };

  const copyReminderMessage = async (item) => {
    const message = `Hola ${item.client}, te recordamos tu reserva en Autoestética Tucumán.
Fecha: ${new Date(`${item.date}T00:00:00`).toLocaleDateString('es-AR')}
Turno: ${item.shift}
Vehículo: ${item.vehicle}
Servicios: ${item.services.join(', ')}
Estado de pago: ${item.paymentStatus}
Saldo pendiente: $${item.balance.toLocaleString('es-AR')}
Cualquier consulta, estamos a disposición.`;

    try {
      await navigator.clipboard.writeText(message);
      alert('Recordatorio copiado al portapapeles.');
    } catch (error) {
      alert('No se pudo copiar el recordatorio.');
    }
  };

  return (
    <AdminLayout
      title="Dashboard general"
      subtitle="Vista rápida del movimiento general de Autoestética Tucumán."
    >
      <div className="row g-3 mb-4">
        <div className="col-md-6 col-xl-3">
          <div className="content-card stats-card admin-kpi-card">
            <p className="stats-label">Reservas</p>
            <h3 className="stats-value">{summary.totalReservations}</h3>
            <span className="admin-kpi-helper">Total cargadas</span>
          </div>
        </div>

        <div className="col-md-6 col-xl-3">
          <div className="content-card stats-card admin-kpi-card">
            <p className="stats-label">Cobrado</p>
            <h3 className="stats-value">
              ${summary.totalCollected.toLocaleString('es-AR')}
            </h3>
            <span className="admin-kpi-helper">Ingresos registrados</span>
          </div>
        </div>

        <div className="col-md-6 col-xl-3">
          <div className="content-card stats-card admin-kpi-card">
            <p className="stats-label">Pendiente de cobro</p>
            <h3 className="stats-value">
              ${summary.pendingAmount.toLocaleString('es-AR')}
            </h3>
            <span className="admin-kpi-helper">Saldo total</span>
          </div>
        </div>

        <div className="col-md-6 col-xl-3">
          <div className="content-card stats-card admin-kpi-card">
            <p className="stats-label">Nivel de cobro</p>
            <h3 className="stats-value">{summary.collectionRate}%</h3>
            <span className="admin-kpi-helper">Sobre lo proyectado</span>
          </div>
        </div>
      </div>

      <div className="row g-3 mb-4">
        <div className="col-md-4">
          <div className="content-card stats-card admin-kpi-card">
            <p className="stats-label">Reservas de hoy</p>
            <h3 className="stats-value">{summary.todayReservations.length}</h3>
            <span className="admin-kpi-helper">Agenda del día</span>
          </div>
        </div>

        <div className="col-md-4">
          <div className="content-card stats-card admin-kpi-card">
            <p className="stats-label">Reservas pagadas</p>
            <h3 className="stats-value">{summary.paidReservations}</h3>
            <span className="admin-kpi-helper">Con pago completo</span>
          </div>
        </div>

        <div className="col-md-4">
          <div className="content-card stats-card admin-kpi-card">
            <p className="stats-label">Servicio más vendido</p>
            <h3 className="stats-value dashboard-small-value">
              {summary.topService ? summary.topService.name : 'Sin datos'}
            </h3>
            <span className="admin-kpi-helper">
              {summary.topService ? `${summary.topService.count} reserva(s)` : 'Todavía sin movimiento'}
            </span>
          </div>
        </div>
      </div>

      <div className="row g-4">
        <div className="col-xl-5">
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
              <div className="dashboard-list-item">
                <span>Facturación proyectada</span>
                <strong>${summary.totalRevenueProjected.toLocaleString('es-AR')}</strong>
              </div>
            </div>
          </div>
        </div>

        <div className="col-xl-7">
          <div className="content-card">
            <div className="d-flex justify-content-between align-items-center flex-wrap gap-2 mb-4">
              <h4 className="mb-0">Próximas reservas</h4>
              <span className="results-counter">{summary.upcoming.length} próximas</span>
            </div>

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

      <div className="row g-4 mt-1">
        <div className="col-12">
          <div className="content-card">
            <div className="d-flex justify-content-between align-items-center flex-wrap gap-2 mb-4">
              <h4 className="mb-0">Alertas de cobro</h4>
              <span className="results-counter">{summary.paymentAlerts.length} alerta(s)</span>
            </div>

            {summary.paymentAlerts.length > 0 ? (
              <div className="dashboard-list">
                {summary.paymentAlerts.map((item) => (
                  <div key={item.id} className="dashboard-alert-card">
                    <div className="dashboard-alert-main">
                      <div>
                        <strong>{item.client}</strong>
                        <div className="text-muted-custom">
                          {new Date(`${item.date}T00:00:00`).toLocaleDateString('es-AR')} · {item.shift} · Saldo: ${item.balance.toLocaleString('es-AR')}
                        </div>
                      </div>

                      <span className={`status-badge payment-${item.paymentStatus.toLowerCase()}`}>
                        {item.paymentStatus}
                      </span>
                    </div>

                    <div className="dashboard-alert-actions">
                      <button
                        type="button"
                        className="btn btn-sm btn-outline-light"
                        onClick={() => goToAgenda(item)}
                      >
                        Ir a agenda
                      </button>

                      <button
                        type="button"
                        className="btn btn-sm btn-outline-warning"
                        onClick={() => copyReminderMessage(item)}
                      >
                        Copiar recordatorio
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="mb-0 text-muted-custom">
                No hay alertas de cobro pendientes.
              </p>
            )}
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}

export default AdminDashboard;