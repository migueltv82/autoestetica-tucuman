import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import * as XLSX from 'xlsx';
import AdminLayout from '../components/admin/AdminLayout.jsx';

function AdminAgenda() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

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
            phone: '',
            vehicle: 'Auto',
            services: ['Limpieza de interior', 'Lavado de motor'],
            date: '2026-03-10',
            shift: 'Mañana',
            status: 'Pendiente',
            paymentStatus: 'Pendiente',
            paidAmount: 0,
            total: 30000,
            notes: '',
          },
        ];
  });

  const [cashEntries, setCashEntries] = useState(() => {
    const saved = localStorage.getItem('adminCashEntries');
    return saved ? JSON.parse(saved) : [];
  });

  const [formData, setFormData] = useState({
    client: '',
    phone: '',
    vehicle: '',
    services: [],
    date: '',
    shift: '',
    status: 'Pendiente',
    notes: '',
  });

  const [editingId, setEditingId] = useState(null);
  const [selectedAppointment, setSelectedAppointment] = useState(null);

  const [filters, setFilters] = useState({
    client: searchParams.get('client') || '',
    vehicle: '',
    status: '',
    paymentStatus: '',
    onlyPendingBalance: false,
    onlyToday: false,
    dateFrom: '',
    dateTo: '',
  });

  useEffect(() => {
    localStorage.setItem('adminAppointments', JSON.stringify(appointments));
  }, [appointments]);

  useEffect(() => {
    const syncCash = () => {
      const updatedCashEntries = JSON.parse(
        localStorage.getItem('adminCashEntries') || '[]'
      );
      setCashEntries(updatedCashEntries);
    };

    window.addEventListener('storage', syncCash);
    syncCash();

    return () => window.removeEventListener('storage', syncCash);
  }, []);

  useEffect(() => {
    const clientFromUrl = searchParams.get('client') || '';

    setFilters((prev) => ({
      ...prev,
      client: clientFromUrl,
    }));
  }, [searchParams]);

  const clientSuggestions = useMemo(() => {
    const map = new Map();

    appointments.forEach((item) => {
      const name = (item.client || '').trim();
      const phone = (item.phone || '').trim();

      if (!name) return;

      if (!map.has(name.toLowerCase())) {
        map.set(name.toLowerCase(), {
          client: name,
          phone,
        });
      } else {
        const existing = map.get(name.toLowerCase());
        if (!existing.phone && phone) {
          map.set(name.toLowerCase(), {
            client: name,
            phone,
          });
        }
      }
    });

    return Array.from(map.values()).sort((a, b) =>
      a.client.localeCompare(b.client)
    );
  }, [appointments]);

  const appointmentsWithPayments = useMemo(() => {
    return appointments.map((appointment) => {
      const linkedPayments = cashEntries.filter(
        (entry) => String(entry.linkedAppointmentId) === String(appointment.id)
      );

      const paidAmount = linkedPayments.reduce(
        (acc, entry) => acc + Number(entry.amount || 0),
        0
      );

      const balance = Math.max(Number(appointment.total || 0) - paidAmount, 0);

      let paymentStatus = 'Pendiente';
      if (paidAmount > 0 && paidAmount < Number(appointment.total || 0)) {
        paymentStatus = 'Señado';
      }
      if (
        paidAmount >= Number(appointment.total || 0) &&
        Number(appointment.total || 0) > 0
      ) {
        paymentStatus = 'Pagado';
      }

      return {
        ...appointment,
        linkedPayments,
        paidAmount,
        balance,
        paymentStatus,
      };
    });
  }, [appointments, cashEntries]);

  const availableServices = useMemo(() => {
    return formData.vehicle ? serviceOptions[formData.vehicle] || [] : [];
  }, [formData.vehicle]);

  const todayDate = new Date().toISOString().split('T')[0];

  const filteredAppointments = useMemo(() => {
    return appointmentsWithPayments.filter((item) => {
      const matchesClient = item.client
        .toLowerCase()
        .includes(filters.client.toLowerCase());

      const matchesVehicle = filters.vehicle ? item.vehicle === filters.vehicle : true;
      const matchesStatus = filters.status ? item.status === filters.status : true;
      const matchesPaymentStatus = filters.paymentStatus
        ? item.paymentStatus === filters.paymentStatus
        : true;
      const matchesOnlyPendingBalance = filters.onlyPendingBalance
        ? Number(item.balance || 0) > 0
        : true;
      const matchesOnlyToday = filters.onlyToday ? item.date === todayDate : true;
      const matchesDateFrom = filters.dateFrom ? item.date >= filters.dateFrom : true;
      const matchesDateTo = filters.dateTo ? item.date <= filters.dateTo : true;

      return (
        matchesClient &&
        matchesVehicle &&
        matchesStatus &&
        matchesPaymentStatus &&
        matchesOnlyPendingBalance &&
        matchesOnlyToday &&
        matchesDateFrom &&
        matchesDateTo
      );
    });
  }, [appointmentsWithPayments, filters, todayDate]);

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
    const totalRevenue = filteredAppointments.reduce(
      (acc, item) => acc + (item.total || 0),
      0
    );
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

  const agendaQuickSummary = useMemo(() => {
    const todayAppointments = appointmentsWithPayments.filter(
      (item) => item.date === todayDate
    );

    const todayPendingAppointments = todayAppointments.filter(
      (item) => Number(item.balance || 0) > 0
    );

    const totalPendingToday = todayAppointments.reduce(
      (acc, item) => acc + Number(item.balance || 0),
      0
    );

    return {
      todayAppointments: todayAppointments.length,
      todayPendingAppointments: todayPendingAppointments.length,
      totalPendingToday,
    };
  }, [appointmentsWithPayments, todayDate]);

  const calculateTotal = (vehicle, selectedServices) => {
    const vehicleServices = serviceOptions[vehicle] || [];
    return selectedServices.reduce((acc, serviceName) => {
      const found = vehicleServices.find((item) => item.name === serviceName);
      return acc + (found ? found.price : 0);
    }, 0);
  };

  const normalizePhoneForWa = (phone) => {
    if (!phone) return '';
    return phone.replace(/\D/g, '');
  };

  const buildReminderMessage = (item) => {
    const balance = Math.max(
      Number(item.total || 0) - Number(item.paidAmount || 0),
      0
    );

    return `Hola ${item.client}, te recordamos tu reserva en Autoestética Tucumán.
Fecha: ${new Date(`${item.date}T00:00:00`).toLocaleDateString('es-AR')}
Turno: ${item.shift}
Vehículo: ${item.vehicle}
Servicios: ${item.services.join(', ')}
Estado de pago: ${item.paymentStatus}
Saldo pendiente: $${balance.toLocaleString('es-AR')}
Cualquier consulta, estamos a disposición.`;
  };

  const openWhatsAppReminder = (item) => {
    const message = buildReminderMessage(item);
    const cleanPhone = normalizePhoneForWa(item.phone);

    const url = cleanPhone
      ? `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`
      : `https://wa.me/?text=${encodeURIComponent(message)}`;

    window.open(url, '_blank');
  };

  const copyReminderMessage = async (item) => {
    const message = buildReminderMessage(item);
    await navigator.clipboard.writeText(message);
    alert('Recordatorio copiado al portapapeles.');
  };

  const applyClientAutocomplete = (typedName) => {
    const match = clientSuggestions.find(
      (item) => item.client.toLowerCase() === typedName.trim().toLowerCase()
    );

    if (!match) return;

    setFormData((prev) => ({
      ...prev,
      client: match.client,
      phone: prev.phone || match.phone || '',
    }));
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

  const handleClientBlur = () => {
    applyClientAutocomplete(formData.client);
  };

  const handleClientSuggestionChange = (e) => {
    const value = e.target.value;

    setFormData((prev) => ({
      ...prev,
      client: value,
    }));

    applyClientAutocomplete(value);
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
    const { name, value, type, checked } = e.target;

    setFilters((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const clearFilters = () => {
    setFilters({
      client: '',
      vehicle: '',
      status: '',
      paymentStatus: '',
      onlyPendingBalance: false,
      onlyToday: false,
      dateFrom: '',
      dateTo: '',
    });

    setSearchParams({});
  };

  const resetForm = () => {
    setFormData({
      client: '',
      phone: '',
      vehicle: '',
      services: [],
      date: '',
      shift: '',
      status: 'Pendiente',
      notes: '',
    });
    setEditingId(null);
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const { client, phone, vehicle, services, date, shift, status, notes } = formData;

    if (!client || !vehicle || services.length === 0 || !date || !shift || !status) {
      alert('Completá todos los campos obligatorios y seleccioná al menos un servicio.');
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
                phone,
                notes,
                total,
              }
            : item
        )
      );
    } else {
      const newAppointment = {
        id: Date.now(),
        ...formData,
        phone,
        total,
        paidAmount: 0,
        notes,
      };

      setAppointments((prev) => [...prev, newAppointment]);
    }

    resetForm();
  };

  const handleEdit = (appointment) => {
    setFormData({
      client: appointment.client,
      phone: appointment.phone || '',
      vehicle: appointment.vehicle,
      services: appointment.services,
      date: appointment.date,
      shift: appointment.shift,
      status: appointment.status,
      notes: appointment.notes || '',
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
    if (selectedAppointment?.id === id) {
      setSelectedAppointment(null);
    }
  };

  const handleGoToCash = (item) => {
    navigate(`/caja?appointmentId=${item.id}`);
  };

  const exportToExcel = () => {
    const dataToExport = filteredAppointments.map((item) => ({
      Cliente: item.client,
      Teléfono: item.phone || '',
      Vehículo: item.vehicle,
      Servicios: item.services.join(', '),
      Fecha: new Date(`${item.date}T00:00:00`).toLocaleDateString('es-AR'),
      Turno: item.shift,
      Estado: item.status,
      Pago: item.paymentStatus || 'Pendiente',
      Total: item.total,
      Pagado: item.paidAmount || 0,
      Saldo: item.balance || 0,
      Observaciones: item.notes || '',
    }));

    const worksheet = XLSX.utils.json_to_sheet(dataToExport);
    const workbook = XLSX.utils.book_new();

    XLSX.utils.book_append_sheet(workbook, worksheet, 'Agenda');

    const fileName = `agenda_autoestetica_${new Date().toISOString().slice(0, 10)}.xlsx`;
    XLSX.writeFile(workbook, fileName);
  };

  const currentTotal = calculateTotal(formData.vehicle, formData.services);

  return (
    <AdminLayout
      title="Agenda interna"
      subtitle="Administrá reservas, servicios, estados, pagos y totales desde un solo lugar."
    >
      <div className="row g-3 mb-4">
        <div className="col-md-4">
          <div className="content-card stats-card admin-kpi-card">
            <p className="stats-label">Turnos de hoy</p>
            <h3 className="stats-value">{agendaQuickSummary.todayAppointments}</h3>
            <span className="admin-kpi-helper">Agenda del día</span>
          </div>
        </div>

        <div className="col-md-4">
          <div className="content-card stats-card admin-kpi-card">
            <p className="stats-label">Turnos con saldo hoy</p>
            <h3 className="stats-value">{agendaQuickSummary.todayPendingAppointments}</h3>
            <span className="admin-kpi-helper">Con deuda pendiente</span>
          </div>
        </div>

        <div className="col-md-4">
          <div className="content-card stats-card admin-kpi-card">
            <p className="stats-label">Pendiente de hoy</p>
            <h3 className="stats-value">
              ${agendaQuickSummary.totalPendingToday.toLocaleString('es-AR')}
            </h3>
            <span className="admin-kpi-helper">Saldo acumulado</span>
          </div>
        </div>
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
                  list="client-suggestions"
                  className="form-control custom-input"
                  value={formData.client}
                  onChange={handleClientSuggestionChange}
                  onBlur={handleClientBlur}
                  placeholder="Ej: Juan Pérez"
                />
                <datalist id="client-suggestions">
                  {clientSuggestions.map((item) => (
                    <option key={item.client} value={item.client} />
                  ))}
                </datalist>
              </div>

              <div className="mb-3">
                <label className="form-label">Teléfono</label>
                <input
                  type="text"
                  name="phone"
                  className="form-control custom-input"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="Ej: 5493811234567"
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

              <div className="mb-4">
                <label className="form-label">Observaciones internas</label>
                <textarea
                  name="notes"
                  className="form-control custom-input custom-textarea"
                  rows="4"
                  value={formData.notes}
                  onChange={handleChange}
                  placeholder="Notas internas de la reserva..."
                />
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

              <div className="col-md-4">
                <label className="form-label">Prioridad</label>
                <div className="quick-filter-check quick-filter-stack">
                  <label className="service-check-item quick-check-item">
                    <input
                      type="checkbox"
                      name="onlyPendingBalance"
                      checked={filters.onlyPendingBalance}
                      onChange={handleFilterChange}
                    />
                    <span>Solo con saldo pendiente</span>
                  </label>

                  <label className="service-check-item quick-check-item">
                    <input
                      type="checkbox"
                      name="onlyToday"
                      checked={filters.onlyToday}
                      onChange={handleFilterChange}
                    />
                    <span>Solo de hoy</span>
                  </label>
                </div>
              </div>

              <div className="col-md-6">
                <label className="form-label">Desde</label>
                <input
                  type="date"
                  name="dateFrom"
                  className="form-control custom-input"
                  value={filters.dateFrom}
                  onChange={handleFilterChange}
                />
              </div>

              <div className="col-md-6">
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
                        <div
                          key={item.id}
                          className={`calendar-appointment-card
                            ${item.date === todayDate ? 'appointment-today' : ''}
                            ${Number(item.balance || 0) > 0 ? 'appointment-pending-balance' : ''}
                            ${item.status === 'Confirmado' ? 'appointment-confirmed' : ''}
                            ${item.status === 'Finalizado' ? 'appointment-finished' : ''}
                          `}
                        >
                          <div className="d-flex justify-content-between align-items-start flex-wrap gap-2 mb-2">
                            <div>
                              <h6 className="mb-1">{item.client}</h6>
                              <p className="mb-0 text-muted-custom">
                                {item.vehicle} · {item.shift}
                              </p>
                              {item.phone && (
                                <p className="mb-0 text-muted-custom">
                                  {item.phone}
                                </p>
                              )}
                            </div>

                            <div className="d-flex flex-wrap gap-2">
                              <span className={`status-badge status-${item.status.toLowerCase()}`}>
                                {item.status}
                              </span>
                              <span
                                className={`status-badge payment-${(
                                  item.paymentStatus || 'Pendiente'
                                ).toLowerCase()}`}
                              >
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

                          <div className="appointment-priority-tags mb-2">
                            {item.date === todayDate && (
                              <span className="priority-tag today-tag">Hoy</span>
                            )}

                            {Number(item.balance || 0) > 0 && (
                              <span className="priority-tag balance-tag">Saldo pendiente</span>
                            )}

                            {item.status === 'Confirmado' && (
                              <span className="priority-tag confirmed-tag">Confirmada</span>
                            )}

                            {item.status === 'Finalizado' && (
                              <span className="priority-tag finished-tag">Finalizada</span>
                            )}
                          </div>

                          <div className="payment-summary-row mb-2">
                            <span>Total: ${Number(item.total || 0).toLocaleString('es-AR')}</span>
                            <span>Pagado: ${Number(item.paidAmount || 0).toLocaleString('es-AR')}</span>
                            <span>Saldo: ${Number(item.balance || 0).toLocaleString('es-AR')}</span>
                          </div>

                          {item.notes && (
                            <div className="reservation-notes-box mb-2">
                              <strong>Observaciones:</strong> {item.notes}
                            </div>
                          )}

                          {item.linkedPayments.length > 0 && (
                            <div className="payment-history-box mb-2">
                              <p className="payment-history-title mb-2">
                                Historial de pagos ({item.linkedPayments.length})
                              </p>

                              <div className="payment-history-list">
                                {item.linkedPayments.map((payment) => (
                                  <div key={payment.id} className="payment-history-item">
                                    <span>
                                      {new Date(`${payment.date}T00:00:00`).toLocaleDateString('es-AR')}
                                    </span>
                                    <span>{payment.paymentMethod}</span>
                                    <span>${Number(payment.amount).toLocaleString('es-AR')}</span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          <div className="d-flex justify-content-between align-items-center flex-wrap gap-2">
                            <strong>${Number(item.total || 0).toLocaleString('es-AR')}</strong>

                            <div className="d-flex gap-2 flex-wrap">
                              <button
                                type="button"
                                className="btn btn-sm btn-outline-success"
                                onClick={() => openWhatsAppReminder(item)}
                              >
                                WhatsApp
                              </button>
                              <button
                                type="button"
                                className="btn btn-sm btn-outline-warning"
                                onClick={() => copyReminderMessage(item)}
                              >
                                Copiar
                              </button>
                              <button
                                type="button"
                                className="btn btn-sm btn-outline-success"
                                onClick={() => handleGoToCash(item)}
                              >
                                Registrar cobro
                              </button>
                              <button
                                type="button"
                                className="btn btn-sm btn-outline-info"
                                onClick={() => setSelectedAppointment(item)}
                              >
                                Ver detalle
                              </button>
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
                    <th>Teléfono</th>
                    <th>Vehículo</th>
                    <th>Servicios</th>
                    <th>Fecha</th>
                    <th>Turno</th>
                    <th>Estado</th>
                    <th>Pago</th>
                    <th>Total</th>
                    <th>Pagado</th>
                    <th>Saldo</th>
                    <th>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredAppointments.map((item) => (
                    <tr
                      key={item.id}
                      className={`
                        ${item.date === todayDate ? 'row-today' : ''}
                        ${Number(item.balance || 0) > 0 ? 'row-pending-balance' : ''}
                      `}
                    >
                      <td>{item.client}</td>
                      <td>{item.phone || '-'}</td>
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
                        <span
                          className={`status-badge payment-${(
                            item.paymentStatus || 'Pendiente'
                          ).toLowerCase()}`}
                        >
                          {item.paymentStatus || 'Pendiente'}
                        </span>
                      </td>
                      <td>${Number(item.total || 0).toLocaleString('es-AR')}</td>
                      <td>${Number(item.paidAmount || 0).toLocaleString('es-AR')}</td>
                      <td>${Number(item.balance || 0).toLocaleString('es-AR')}</td>
                      <td>
                        <div className="d-flex gap-2 flex-wrap">
                          <button
                            type="button"
                            className="btn btn-sm btn-outline-success"
                            onClick={() => openWhatsAppReminder(item)}
                          >
                            WhatsApp
                          </button>
                          <button
                            type="button"
                            className="btn btn-sm btn-outline-warning"
                            onClick={() => copyReminderMessage(item)}
                          >
                            Copiar
                          </button>
                          <button
                            type="button"
                            className="btn btn-sm btn-outline-success"
                            onClick={() => handleGoToCash(item)}
                          >
                            Registrar cobro
                          </button>
                          <button
                            type="button"
                            className="btn btn-sm btn-outline-info"
                            onClick={() => setSelectedAppointment(item)}
                          >
                            Ver detalle
                          </button>
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
              <p className="mb-0 text-muted-custom">
                No hay reservas que coincidan con los filtros.
              </p>
            )}
          </div>

          {selectedAppointment && (
            <div className="content-card mt-4">
              <div className="d-flex justify-content-between align-items-center mb-4">
                <h4 className="mb-0">Detalle de reserva</h4>
                <button
                  type="button"
                  className="btn btn-outline-light btn-sm"
                  onClick={() => setSelectedAppointment(null)}
                >
                  Cerrar
                </button>
              </div>

              <div className="detail-grid">
                <div><strong>Cliente:</strong> {selectedAppointment.client}</div>
                <div><strong>Teléfono:</strong> {selectedAppointment.phone || '-'}</div>
                <div><strong>Vehículo:</strong> {selectedAppointment.vehicle}</div>
                <div>
                  <strong>Fecha:</strong>{' '}
                  {new Date(`${selectedAppointment.date}T00:00:00`).toLocaleDateString('es-AR')}
                </div>
                <div><strong>Turno:</strong> {selectedAppointment.shift}</div>
                <div><strong>Estado:</strong> {selectedAppointment.status}</div>
                <div><strong>Pago:</strong> {selectedAppointment.paymentStatus}</div>
                <div>
                  <strong>Total:</strong> ${Number(selectedAppointment.total || 0).toLocaleString('es-AR')}
                </div>
                <div>
                  <strong>Pagado:</strong> ${Number(selectedAppointment.paidAmount || 0).toLocaleString('es-AR')}
                </div>
                <div>
                  <strong>Saldo:</strong> ${Number(selectedAppointment.balance || 0).toLocaleString('es-AR')}
                </div>
                <div><strong>Servicios:</strong> {selectedAppointment.services.join(', ')}</div>
              </div>

              {selectedAppointment.notes && (
                <div className="reservation-notes-box mt-3">
                  <strong>Observaciones internas:</strong> {selectedAppointment.notes}
                </div>
              )}

              {selectedAppointment.linkedPayments.length > 0 && (
                <div className="payment-history-box mt-3">
                  <p className="payment-history-title mb-2">
                    Historial de pagos ({selectedAppointment.linkedPayments.length})
                  </p>

                  <div className="payment-history-list">
                    {selectedAppointment.linkedPayments.map((payment) => (
                      <div key={payment.id} className="payment-history-item">
                        <span>
                          {new Date(`${payment.date}T00:00:00`).toLocaleDateString('es-AR')}
                        </span>
                        <span>{payment.paymentMethod}</span>
                        <span>${Number(payment.amount).toLocaleString('es-AR')}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}

export default AdminAgenda;