import { useMemo } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from 'recharts';

function AdminStats() {
  const appointments = JSON.parse(localStorage.getItem('adminAppointments') || '[]');

  const stats = useMemo(() => {
    const totalReservations = appointments.length;

    const totalRevenue = appointments.reduce((acc, item) => acc + (item.total || 0), 0);

    const totalServices = appointments.reduce(
      (acc, item) => acc + (item.services ? item.services.length : 0),
      0
    );

    const serviceCountMap = {};

    appointments.forEach((item) => {
      (item.services || []).forEach((service) => {
        serviceCountMap[service] = (serviceCountMap[service] || 0) + 1;
      });
    });

    const chartData = Object.entries(serviceCountMap)
      .map(([name, cantidad]) => ({
        name,
        cantidad,
      }))
      .sort((a, b) => b.cantidad - a.cantidad);

    return {
      totalReservations,
      totalRevenue,
      totalServices,
      chartData,
    };
  }, [appointments]);

  return (
    <section className="page-section">
      <div className="container py-5">
        <div className="text-center mb-5">
          <h2 className="section-title">Estadísticas internas</h2>
          <p className="section-text">
            Visualizá rápidamente el movimiento general de reservas y servicios.
          </p>
        </div>

        <div className="row g-4 mb-4">
          <div className="col-md-4">
            <div className="content-card stats-card">
              <p className="stats-label">Reservas cargadas</p>
              <h3 className="stats-value">{stats.totalReservations}</h3>
            </div>
          </div>

          <div className="col-md-4">
            <div className="content-card stats-card">
              <p className="stats-label">Facturación acumulada</p>
              <h3 className="stats-value">
                ${stats.totalRevenue.toLocaleString('es-AR')}
              </h3>
            </div>
          </div>

          <div className="col-md-4">
            <div className="content-card stats-card">
              <p className="stats-label">Servicios cargados</p>
              <h3 className="stats-value">{stats.totalServices}</h3>
            </div>
          </div>
        </div>

        <div className="content-card">
          <div className="d-flex justify-content-between align-items-center flex-wrap gap-2 mb-4">
            <h4 className="mb-0">Servicios más vendidos</h4>
            <span className="results-counter">
              {stats.chartData.length} servicio(s)
            </span>
          </div>

          {stats.chartData.length > 0 ? (
            <div style={{ width: '100%', height: 380 }}>
              <ResponsiveContainer>
                <BarChart data={stats.chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.08)" />
                  <XAxis
                    dataKey="name"
                    stroke="#cbd5e1"
                    tick={{ fontSize: 12 }}
                  />
                  <YAxis
                    allowDecimals={false}
                    stroke="#cbd5e1"
                    tick={{ fontSize: 12 }}
                  />
                  <Tooltip
                    contentStyle={{
                      background: 'rgba(15, 23, 42, 0.95)',
                      border: '1px solid rgba(255,255,255,0.1)',
                      borderRadius: '12px',
                      color: '#f8fafc',
                    }}
                  />
                  <Bar dataKey="cantidad" radius={[10, 10, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <p className="mb-0 text-muted-custom">
              Todavía no hay datos suficientes para mostrar estadísticas.
            </p>
          )}
        </div>
      </div>
    </section>
  );
}

export default AdminStats;