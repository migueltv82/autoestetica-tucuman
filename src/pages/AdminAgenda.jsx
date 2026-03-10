import { useEffect, useMemo, useState } from 'react';
import * as XLSX from 'xlsx';

function AdminAgenda() {
  const serviceOptions = {
    Auto: [
      { name: 'Limpieza de interior', price: 18000 },
      { name: 'Pulido y abrillantado', price: 45000 },
      { name: 'Lavado de motor', price: 12000 },
    ],
    Camioneta: [
      { name: 'Limpieza de interior', price: 22000 },
      { name: 'Pulido y abrillantado', price: 52000 },
      { name: 'Lavado de motor', price: 15000 },
    ],
    Moto: [{ name: 'Lavado y detallado de motos', price: 10000 }],
    Bicicleta: [{ name: 'Lavado y detallado de bicicletas', price: 8000 }],
  };

  const vehicles = ['Auto', 'Camioneta', 'Moto', 'Bicicleta'];
  const shifts = ['Mañana', 'Tarde'];
  const statuses = ['Pendiente', 'Confirmado', 'Finalizado', 'Cancelado'];
  const paymentStatuses = ['Pendiente', 'Señado', 'Pagado'];

  const [appointments, setAppointments] = useState(() => {
    const saved = localStorage.getItem('adminAppointments');
    return saved
      ? JSON.parse(saved)
      : [
          {
            id: 1,
            client: 'Juan Pérez',
            vehicle: 'Auto',
            services: ['Limpieza de interior', 'Lavado de motor'],
            date: '2026-03-10',
            shift: 'Mañana',
            status: 'Pendiente',
            paymentStatus: 'Pendiente',
            total: 30000,
          },
        ];
  });

  const [formData, setFormData] = useState({
    client: '',
    vehicle: '',
    services: [],
    date: '',
    shift: '',
    status: 'Pendiente',
    paymentStatus: 'Pendiente',
  });

  const [editingId, setEditingId] = useState(null);

  const [filters, setFilters] = useState({
    client: '',
    vehicle: '',
    status: '',
    paymentStatus: '',
    dateFrom: '',
    dateTo: '',
  });

  useEffect(() => {
    localStorage.setItem('adminAppointments', JSON.stringify(appointments));
  }, [appointments]);

  const availableServices = useMemo(() => {
    return formData.vehicle ? serviceOptions[formData.vehicle] || [] : [];
  }, [formData.vehicle]);

  const filteredAppointments = useMemo(() => {
    return appointments.filter((item) => {
      const matchesClient = item.client
        .toLowerCase()
        .includes(filters.client.toLowerCase());

      const matchesVehicle = filters.vehicle ? item.vehicle === filters.vehicle : true;
      const matchesStatus = filters.status ? item.status === filters.status : true;
      const matchesPaymentStatus = filters.paymentStatus
        ? item.paymentStatus === filters.paymentStatus
        : true;
      const matchesDateFrom = filters.dateFrom ? item.date >= filters.dateFrom : true;
      const matchesDateTo = filters.dateTo ? item.date <= filters.dateTo : true;

      return (
        matchesClient &&
        matchesVehicle &&
        matchesStatus &&
        matchesPaymentStatus &&
        matchesDateFrom &&
        matchesDateTo
      );
    });
  }, [appointments, filters]);

  const groupedAppointments = useMemo(() => {
    const grouped = filteredAppointments.reduce((acc, item) => {
      if (!acc[item.date]) acc[item.date] = [];
      acc[item.date].push(item);
      return acc;
    }, {});

    return Object.entries(grouped)
      .sort((a, b) => a[0].localeCompare(b[0]))
      .map(([date, items]) => ({
        date,
        items: items.sort((a, b) => a.shift.localeCompare(b.shift)),
      }));
  }, [filteredAppointments]);

  const periodSummary = useMemo(() => {
    const totalReservations = filteredAppointments.length;
    const totalRevenue = filteredAppointments.reduce((acc, item) => acc + (item.total || 0), 0);
    const totalServices = filteredAppointments.reduce(
      (acc, item) => acc + (item.services?.length || 0),
      0
    );

    return {
      totalReservations,
      totalRevenue,
      totalServices,
    };
  }, [filteredAppointments]);

  const calculateTotal = (vehicle, selectedServices) => {
    const vehicleServices = serviceOptions[vehicle] || [];
    return selectedServices.reduce((acc, serviceName) => {
      const found = vehicleServices.find((item) => item.name === serviceName);
      return acc + (found ? found.price : 0);
    }, 0);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === 'vehicle') {
      setFormData((prev) => ({
        ...prev,
        vehicle: value,
        services: [],
      }));
      return;
    }

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleServiceToggle = (serviceName) => {
    setFormData((prev) => {
      const exists = prev.services.includes(serviceName);

      return {
        ...prev,
        services: exists
          ? prev.services.filter((item) => item !== serviceName)
          : [...prev.services, serviceName],
      };
    });
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;

    setFilters((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const clearFilters = () => {
    setFilters({
      client: '',
      vehicle: '',
      status: '',
      paymentStatus: '',
      dateFrom: '',
      dateTo: '',
    });
  };

  const resetForm = () => {
    setFormData({
      client: '',
      vehicle: '',
      services: [],
      date: '',
      shift: '',
      status: 'Pendiente',
      paymentStatus: 'Pendiente',
    });
    setEditingId(null);
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const { client, vehicle, services, date, shift, status, paymentStatus } = formData;

    if (!client || !vehicle || services.length === 0 || !date || !shift || !status || !paymentStatus) {
      alert('Completá todos los campos y seleccioná al menos un servicio.');
      return;
    }

    const total = calculateTotal(vehicle, services);

    if (editingId) {
      setAppointments((prev) =>
        prev.map((item) =>
          item.id === editingId
            ? {
                ...item,
                ...formData,
                total,
              }
            : item
        )
      );
    } else {
      const newAppointment = {
        id: Date.now(),
        ...formData,
        total,
      };

      setAppointments((prev) => [...prev, newAppointment]);
    }

    resetForm();
  };

  const handleEdit = (appointment) => {
    setFormData({
      client: appointment.client,
      vehicle: appointment.vehicle,
      services: appointment.services,
      date: appointment.date,
      shift: appointment.shift,
      status: appointment.status,
      paymentStatus: appointment.paymentStatus || 'Pendiente',
    });
    setEditingId(appointment.id);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = (id) => {
    const confirmed = window.confirm('¿Querés eliminar esta reserva?');
    if (!confirmed) return;

    setAppointments((prev) => prev.filter((item) => item.id !== id));

    if (editingId === id) {
      resetForm();
    }
  };

  const exportToExcel = () => {
    const dataToExport = filteredAppointments.map((item) => ({
      Cliente: item.client,
      Vehículo: item.vehicle,
      Servicios: item.services.join(', '),
      Fecha: new Date(`${item.date}T00:00:00`).toLocaleDateString('es-AR'),
      Turno: item.shift,
      Estado: item.status,
      Pago: item.paymentStatus || 'Pendiente',
      Total: item.total,
    }));

    const worksheet = XLSX.utils.json_to_sheet(dataToExport);
    const workbook = XLSX.utils.book_new();

    XLSX.utils.book_append_sheet(workbook, worksheet, 'Agenda');

    const fileName = `agenda_autoestetica_${new Date().toISOString().slice(0, 10)}.xlsx`;
    XLSX.writeFile(workbook, fileName);
  };

  const currentTotal = calculateTotal(formData.vehicle, formData.services);

  return (
    <section className="page-section">
      <div className="container py-5">
        <div className="text-center mb-5">
          <h2 className="section-title">Agenda interna</h2>
          <p className="section-text">
            Administrá reservas, servicios, estados, pagos y totales desde un solo lugar.
          </p>
        </div>

        <div className="row g-4">
          <div className="col-lg-5">
            <div className="content-card">
              <div className="d-flex justify-content-between align-items-center mb-4">
                <h4 className="mb-0">{editingId ? 'Editar reserva' : 'Nueva reserva'}</h4>
                {editingId && (
                  <button
                    type="button"
                    className="btn btn-outline-light btn-sm"
                    onClick={resetForm}
                  >
                    Cancelar edición
                  </button>
                )}
              </div>

              <form onSubmit={handleSubmit}>
                <div className="mb-3">
                  <label className="form-label">Cliente</label>
                  <input
                    type="text"
                    name="client"
                    className="form-control custom-input"
                    value={formData.client}
                    onChange={handleChange}
                    placeholder="Ej: Juan Pérez"
                  />
                </div>

                <div className="mb-3">
                  <label className="form-label">Vehículo</label>
                  <select
                    name="vehicle"
                    className="form-select custom-input"
                    value={formData.vehicle}
                    onChange={handleChange}
                  >
                    <option value="">Seleccioná un vehículo</option>
                    {vehicles.map((item) => (
                      <option key={item} value={item}>
                        {item}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="mb-3">
                  <label className="form-label">Servicios</label>
                  <div className="services-checklist">
                    {!formData.vehicle && (
                      <p className="mb-0 text-muted-custom">Primero elegí un vehículo.</p>
                    )}

                    {availableServices.map((item) => (
                      <label key={item.name} className="service-check-item">
                        <input
                          type="checkbox"
                          checked={formData.services.includes(item.name)}
                          onChange={() => handleServiceToggle(item.name)}
                        />
                        <span>
                          {item.name} — ${item.price.toLocaleString('es-AR')}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="mb-3">
                  <label className="form-label">Fecha</label>
                  <input
                    type="date"
                    name="date"
                    className="form-control custom-input"
                    value={formData.date}
                    onChange={handleChange}
                  />
                </div>

                <div className="mb-3">
                  <label className="form-label">Turno</label>
                  <select
                    name="shift"
                    className="form-select custom-input"
                    value={formData.shift}
                    onChange={handleChange}
                  >
                    <option value="">Seleccioná un turno</option>
                    {shifts.map((item) => (
                      <option key={item} value={item}>
                        {item}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="mb-3">
                  <label className="form-label">Estado de reserva</label>
                  <select
                    name="status"
                    className="form-select custom-input"
                    value={formData.status}
                    onChange={handleChange}
                  >
                    {statuses.map((item) => (
                      <option key={item} value={item}>
                        {item}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="mb-3">
                  <label className="form-label">Estado de pago</label>
                  <select
                    name="paymentStatus"
                    className="form-select custom-input"
                    value={formData.paymentStatus}
                    onChange={handleChange}
                  >
                    {paymentStatuses.map((item) => (
                      <option key={item} value={item}>
                        {item}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="admin-total-box mb-4">
                  <span className="admin-total-label">Total:</span>
                  <span className="admin-total-value">
                    ${currentTotal.toLocaleString('es-AR')}
                  </span>
                </div>

                <button type="submit" className="btn btn-brand w-100">
                  {editingId ? 'Guardar cambios' : 'Agregar reserva'}
                </button>
              </form>
            </div>
          </div>

          <div className="col-lg-7">
            <div className="content-card mb-4">
              <div className="d-flex justify-content-between align-items-center flex-wrap gap-3 mb-4">
                <h4 className="mb-0">Filtros</h4>
                <button
                  type="button"
                  className="btn btn-outline-light btn-sm"
                  onClick={clearFilters}
                >
                  Limpiar filtros
                </button>
              </div>

              <div className="row g-3">
                <div className="col-md-6">
                  <label className="form-label">Cliente</label>
                  <input
                    type="text"
                    name="client"
                    className="form-control custom-input"
                    value={filters.client}
                    onChange={handleFilterChange}
                    placeholder="Buscar por nombre"
                  />
                </div>

                <div className="col-md-6">
                  <label className="form-label">Vehículo</label>
                  <select
                    name="vehicle"
                    className="form-select custom-input"
                    value={filters.vehicle}
                    onChange={handleFilterChange}
                  >
                    <option value="">Todos</option>
                    {vehicles.map((item) => (
                      <option key={item} value={item}>
                        {item}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="col-md-4">
                  <label className="form-label">Estado</label>
                  <select
                    name="status"
                    className="form-select custom-input"
                    value={filters.status}
                    onChange={handleFilterChange}
                  >
                    <option value="">Todos</option>
                    {statuses.map((item) => (
                      <option key={item} value={item}>
                        {item}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="col-md-4">
                  <label className="form-label">Pago</label>
                  <select
                    name="paymentStatus"
                    className="form-select custom-input"
                    value={filters.paymentStatus}
                    onChange={handleFilterChange}
                  >
                    <option value="">Todos</option>
                    {paymentStatuses.map((item) => (
                      <option key={item} value={item}>
                        {item}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="col-md-2">
                  <label className="form-label">Desde</label>
                  <input
                    type="date"
                    name="dateFrom"
                    className="form-control custom-input"
                    value={filters.dateFrom}
                    onChange={handleFilterChange}
                  />
                </div>

                <div className="col-md-2">
                  <label className="form-label">Hasta</label>
                  <input
                    type="date"
                    name="dateTo"
                    className="form-control custom-input"
                    value={filters.dateTo}
                    onChange={handleFilterChange}
                  />
                </div>
              </div>
            </div>

            <div className="row g-3 mb-4">
              <div className="col-md-4">
                <div className="content-card stats-card">
                  <p className="stats-label">Reservas del período</p>
                  <h3 className="stats-value">{periodSummary.totalReservations}</h3>
                </div>
              </div>

              <div className="col-md-4">
                <div className="content-card stats-card">
                  <p className="stats-label">Servicios del período</p>
                  <h3 className="stats-value">{periodSummary.totalServices}</h3>
                </div>
              </div>

              <div className="col-md-4">
                <div className="content-card stats-card">
                  <p className="stats-label">Facturación del período</p>
                  <h3 className="stats-value">
                    ${periodSummary.totalRevenue.toLocaleString('es-AR')}
                  </h3>
                </div>
              </div>
            </div>

            <div className="content-card mb-4">
              <div className="d-flex justify-content-between align-items-center flex-wrap gap-3 mb-4">
                <h4 className="mb-0">Vista calendario</h4>

                <div className="d-flex align-items-center gap-2 flex-wrap">
                  <span className="results-counter">
                    {filteredAppointments.length} resultado(s)
                  </span>

                  <button
                    type="button"
                    className="btn btn-brand btn-sm"
                    onClick={exportToExcel}
                    disabled={filteredAppointments.length === 0}
                  >
                    Exportar a Excel
                  </button>
                </div>
              </div>

              {groupedAppointments.length > 0 ? (
                <div className="calendar-groups">
                  {groupedAppointments.map((group) => (
                    <div key={group.date} className="calendar-day-card">
                      <div className="calendar-day-header">
                        <h5 className="mb-0">
                          {new Date(`${group.date}T00:00:00`).toLocaleDateString('es-AR', {
                            weekday: 'long',
                            day: '2-digit',
                            month: '2-digit',
                            year: 'numeric',
                          })}
                        </h5>
                        <span className="results-counter">
                          {group.items.length} turno(s)
                        </span>
                      </div>

                      <div className="calendar-day-list">
                        {group.items.map((item) => (
                          <div key={item.id} className="calendar-appointment-card">
                            <div className="d-flex justify-content-between align-items-start flex-wrap gap-2 mb-2">
                              <div>
                                <h6 className="mb-1">{item.client}</h6>
                                <p className="mb-0 text-muted-custom">
                                  {item.vehicle} · {item.shift}
                                </p>
                              </div>

                              <div className="d-flex flex-wrap gap-2">
                                <span className={`status-badge status-${item.status.toLowerCase()}`}>
                                  {item.status}
                                </span>
                                <span className={`status-badge payment-${(item.paymentStatus || 'Pendiente').toLowerCase()}`}>
                                  {item.paymentStatus || 'Pendiente'}
                                </span>
                              </div>
                            </div>

                            <div className="services-list-cell mb-2">
                              {item.services.map((serviceName) => (
                                <span key={serviceName} className="mini-service-badge">
                                  {serviceName}
                                </span>
                              ))}
                            </div>

                            <div className="d-flex justify-content-between align-items-center flex-wrap gap-2">
                              <strong>${item.total.toLocaleString('es-AR')}</strong>

                              <div className="d-flex gap-2">
                                <button
                                  type="button"
                                  className="btn btn-sm btn-outline-info"
                                  onClick={() => handleEdit(item)}
                                >
                                  Editar
                                </button>
                                <button
                                  type="button"
                                  className="btn btn-sm btn-outline-danger"
                                  onClick={() => handleDelete(item.id)}
                                >
                                  Borrar
                                </button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="mb-0 text-muted-custom">
                  No hay reservas que coincidan con los filtros.
                </p>
              )}
            </div>

            <div className="content-card">
              <h4 className="mb-4">Vista tabla</h4>

              <div className="table-responsive">
                <table className="table table-dark table-hover align-middle agenda-table">
                  <thead>
                    <tr>
                      <th>Cliente</th>
                      <th>Vehículo</th>
                      <th>Servicios</th>
                      <th>Fecha</th>
                      <th>Turno</th>
                      <th>Estado</th>
                      <th>Pago</th>
                      <th>Total</th>
                      <th>Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredAppointments.map((item) => (
                      <tr key={item.id}>
                        <td>{item.client}</td>
                        <td>{item.vehicle}</td>
                        <td>
                          <div className="services-list-cell">
                            {item.services.map((serviceName) => (
                              <span key={serviceName} className="mini-service-badge">
                                {serviceName}
                              </span>
                            ))}
                          </div>
                        </td>
                        <td>{new Date(`${item.date}T00:00:00`).toLocaleDateString('es-AR')}</td>
                        <td>{item.shift}</td>
                        <td>
                          <span className={`status-badge status-${item.status.toLowerCase()}`}>
                            {item.status}
                          </span>
                        </td>
                        <td>
                          <span className={`status-badge payment-${(item.paymentStatus || 'Pendiente').toLowerCase()}`}>
                            {item.paymentStatus || 'Pendiente'}
                          </span>
                        </td>
                        <td>${item.total.toLocaleString('es-AR')}</td>
                        <td>
                          <div className="d-flex gap-2">
                            <button
                              type="button"
                              className="btn btn-sm btn-outline-info"
                              onClick={() => handleEdit(item)}
                            >
                              Editar
                            </button>
                            <button
                              type="button"
                              className="btn btn-sm btn-outline-danger"
                              onClick={() => handleDelete(item.id)}
                            >
                              Borrar
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {filteredAppointments.length === 0 && (
                <p className="mb-0 text-muted-custom">No hay reservas que coincidan con los filtros.</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default AdminAgenda;