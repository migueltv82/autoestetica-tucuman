import { useMemo, useState } from 'react';
import AdminLayout from '../Components/admin/AdminLayout.jsx';

function AdminClients() {
  const appointments = JSON.parse(localStorage.getItem('adminAppointments') || '[]');
  const cashEntries = JSON.parse(localStorage.getItem('adminCashEntries') || '[]');

  const [search, setSearch] = useState('');

  const formatDateRange = (startDate, endDate) => {
    if (!startDate) return 'Sin fecha';

    const start = new Date(`${startDate}T00:00:00`).toLocaleDateString('es-AR');
    const end = new Date(`${(endDate || startDate)}T00:00:00`).toLocaleDateString('es-AR');

    return startDate === (endDate || startDate) ? start : `${start} al ${end}`;
  };

  const clients = useMemo(() => {
    const map = new Map();

    appointments.forEach((appointment) => {
      const clientName = (appointment.client || '').trim();
      if (!clientName) return;

      const key = clientName.toLowerCase();

      const linkedPayments = cashEntries.filter(
        (entry) => String(entry.linkedAppointmentId) === String(appointment.id)
      );

      const paidAmount = linkedPayments.reduce(
        (acc, entry) => acc + Number(entry.amount || 0),
        0
      );

      const total = Number(appointment.total || 0);
      const balance = Math.max(total - paidAmount, 0);

      if (!map.has(key)) {
        map.set(key, {
          client: clientName,
          phone: appointment.phone || '',
          reservations: 0,
          totalSpent: 0,
          totalPaid: 0,
          totalBalance: 0,
          vehicles: new Set(),
          services: new Set(),
          lastReservationDate: appointment.startDate || appointment.date || '',
          lastReservationRange: formatDateRange(
            appointment.startDate || appointment.date || '',
            appointment.endDate || appointment.startDate || appointment.date || ''
          ),
        });
      }

      const current = map.get(key);

      current.reservations += 1;
      current.totalSpent += total;
      current.totalPaid += paidAmount;
      current.totalBalance += balance;

      if (!current.phone && appointment.phone) {
        current.phone = appointment.phone;
      }

      if (appointment.vehicle) {
        current.vehicles.add(appointment.vehicle);
      }

      (appointment.services || []).forEach((service) => current.services.add(service));

      const appointmentStart = appointment.startDate || appointment.date || '';
      if (appointmentStart && appointmentStart > current.lastReservationDate) {
        current.lastReservationDate = appointmentStart;
        current.lastReservationRange = formatDateRange(
          appointment.startDate || appointment.date || '',
          appointment.endDate || appointment.startDate || appointment.date || ''
        );
      }
    });

    return Array.from(map.values())
      .map((item) => ({
        ...item,
        vehicles: Array.from(item.vehicles),
        services: Array.from(item.services),
      }))
      .filter((item) => {
        const term = search.toLowerCase();
        return (
          item.client.toLowerCase().includes(term) ||
          (item.phone || '').toLowerCase().includes(term)
        );
      })
      .sort((a, b) => a.client.localeCompare(b.client));
  }, [appointments, cashEntries, search]);

  const summary = useMemo(() => {
    return {
      totalClients: clients.length,
      totalDebt: clients.reduce((acc, item) => acc + item.totalBalance, 0),
      totalRevenue: clients.reduce((acc, item) => acc + item.totalSpent, 0),
    };
  }, [clients]);

  return (
    <AdminLayout
      title="Clientes"
      subtitle="Consultá rápidamente clientes, teléfonos, servicios acumulados y saldo pendiente."
    >
      <div className="row g-3 mb-4">
        <div className="col-md-4">
          <div className="content-card stats-card admin-kpi-card">
            <p className="stats-label">Clientes</p>
            <h3 className="stats-value">{summary.totalClients}</h3>
            <span className="admin-kpi-helper">Registrados en servicios</span>
          </div>
        </div>

        <div className="col-md-4">
          <div className="content-card stats-card admin-kpi-card">
            <p className="stats-label">Facturación acumulada</p>
            <h3 className="stats-value">
              ${summary.totalRevenue.toLocaleString('es-AR')}
            </h3>
            <span className="admin-kpi-helper">Suma por cliente</span>
          </div>
        </div>

        <div className="col-md-4">
          <div className="content-card stats-card admin-kpi-card">
            <p className="stats-label">Saldo pendiente</p>
            <h3 className="stats-value">
              ${summary.totalDebt.toLocaleString('es-AR')}
            </h3>
            <span className="admin-kpi-helper">Total adeudado</span>
          </div>
        </div>
      </div>

      <div className="content-card mb-4">
        <div className="row g-3 align-items-end">
          <div className="col-lg-6">
            <label className="form-label">Buscar cliente</label>
            <input
              type="text"
              className="form-control custom-input"
              placeholder="Buscar por nombre o teléfono"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <div className="col-lg-6">
            <div className="results-counter clients-counter">
              {clients.length} cliente(s) encontrado(s)
            </div>
          </div>
        </div>
      </div>

      <div className="content-card">
        {clients.length > 0 ? (
          <div className="clients-grid">
            {clients.map((client) => (
              <div key={client.client} className="client-card">
                <div className="client-card-header">
                  <div>
                    <h4 className="mb-1">{client.client}</h4>
                    <p className="mb-0 text-muted-custom">
                      {client.phone || 'Sin teléfono cargado'}
                    </p>
                  </div>

                  <span
                    className={`status-badge ${
                      client.totalBalance > 0 ? 'payment-pendiente' : 'payment-pagado'
                    }`}
                  >
                    {client.totalBalance > 0 ? 'Con saldo' : 'Al día'}
                  </span>
                </div>

                <div className="client-card-stats">
                  <div className="client-stat-box">
                    <span>Servicios</span>
                    <strong>{client.reservations}</strong>
                  </div>
                  <div className="client-stat-box">
                    <span>Total</span>
                    <strong>${client.totalSpent.toLocaleString('es-AR')}</strong>
                  </div>
                  <div className="client-stat-box">
                    <span>Debe</span>
                    <strong>${client.totalBalance.toLocaleString('es-AR')}</strong>
                  </div>
                </div>

                <div className="client-card-section">
                  <p className="client-card-label">Vehículos</p>
                  <div className="services-list-cell">
                    {client.vehicles.length > 0 ? (
                      client.vehicles.map((vehicle) => (
                        <span key={vehicle} className="mini-service-badge">
                          {vehicle}
                        </span>
                      ))
                    ) : (
                      <span className="text-muted-custom">Sin datos</span>
                    )}
                  </div>
                </div>

                <div className="client-card-section">
                  <p className="client-card-label">Servicios</p>
                  <div className="services-list-cell">
                    {client.services.length > 0 ? (
                      client.services.map((service) => (
                        <span key={service} className="mini-service-badge">
                          {service}
                        </span>
                      ))
                    ) : (
                      <span className="text-muted-custom">Sin datos</span>
                    )}
                  </div>
                </div>

                <div className="client-card-footer">
                  <span className="text-muted-custom">
                    Último período: {client.lastReservationRange || '-'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="mb-0 text-muted-custom">Todavía no hay clientes para mostrar.</p>
        )}
      </div>
    </AdminLayout>
  );
}

export default AdminClients;