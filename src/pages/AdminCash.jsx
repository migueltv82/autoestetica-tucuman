import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import * as XLSX from 'xlsx';
import AdminLayout from '../components/admin/AdminLayout.jsx';
import "../styles/AdminCash.css";

function AdminCash() {
  const [searchParams, setSearchParams] = useSearchParams();

  const [appointments, setAppointments] = useState(() => {
    return JSON.parse(localStorage.getItem('adminAppointments') || '[]');
  });

  const [cashEntries, setCashEntries] = useState(() => {
    const saved = localStorage.getItem('adminCashEntries');
    return saved ? JSON.parse(saved) : [];
  });

  const [formData, setFormData] = useState({
    date: '',
    client: '',
    concept: '',
    paymentMethod: 'Efectivo',
    amount: '',
    linkedAppointmentId: '',
  });

  const [editingId, setEditingId] = useState(null);

  const [filters, setFilters] = useState({
    client: '',
    paymentMethod: '',
    dateFrom: '',
    dateTo: '',
  });

  const paymentMethods = ['Efectivo', 'Transferencia', 'Tarjeta', 'Mercado Pago', 'Otro'];

  const recalculateAppointmentsPaymentStatus = (baseAppointments, baseCashEntries) => {
    return baseAppointments.map((appointment) => {
      const linkedPayments = baseCashEntries.filter(
        (entry) => String(entry.linkedAppointmentId) === String(appointment.id)
      );

      const paidAmount = linkedPayments.reduce(
        (acc, entry) => acc + Number(entry.amount || 0),
        0
      );

      let paymentStatus = 'Pendiente';

      if (paidAmount > 0 && paidAmount < Number(appointment.total || 0)) {
        paymentStatus = 'Señado';
      }

      if (paidAmount >= Number(appointment.total || 0) && Number(appointment.total || 0) > 0) {
        paymentStatus = 'Pagado';
      }

      return {
        ...appointment,
        paymentStatus,
        paidAmount,
      };
    });
  };

  useEffect(() => {
    localStorage.setItem('adminCashEntries', JSON.stringify(cashEntries));
  }, [cashEntries]);

  useEffect(() => {
    const updatedAppointments = recalculateAppointmentsPaymentStatus(appointments, cashEntries);
    setAppointments(updatedAppointments);
    localStorage.setItem('adminAppointments', JSON.stringify(updatedAppointments));
  }, [cashEntries]);

  useEffect(() => {
    const appointmentIdFromUrl = searchParams.get('appointmentId');

    if (!appointmentIdFromUrl || appointments.length === 0) return;

    const selected = appointments.find(
      (item) => String(item.id) === String(appointmentIdFromUrl)
    );

    if (!selected) return;

    setFormData((prev) => ({
      ...prev,
      linkedAppointmentId: String(selected.id),
      client: selected.client,
      concept: `Cobro reserva - ${selected.services.join(', ')}`,
    }));
  }, [searchParams, appointments]);

  const linkedAppointmentData = useMemo(() => {
    if (!formData.linkedAppointmentId) return null;

    const appointment = appointments.find(
      (item) => String(item.id) === String(formData.linkedAppointmentId)
    );

    if (!appointment) return null;

    const linkedPayments = cashEntries
      .filter((entry) => String(entry.linkedAppointmentId) === String(appointment.id))
      .sort((a, b) => b.date.localeCompare(a.date));

    const linkedPaymentsWithoutEditing = linkedPayments.filter(
      (entry) => entry.id !== editingId
    );

    const alreadyPaid = linkedPaymentsWithoutEditing.reduce(
      (acc, entry) => acc + Number(entry.amount || 0),
      0
    );

    const total = Number(appointment.total || 0);
    const balance = Math.max(total - alreadyPaid, 0);

    return {
      appointment,
      total,
      alreadyPaid,
      balance,
      linkedPayments,
    };
  }, [formData.linkedAppointmentId, appointments, cashEntries, editingId]);

  const filteredCashEntries = useMemo(() => {
    return cashEntries.filter((item) => {
      const matchesClient = item.client
        .toLowerCase()
        .includes(filters.client.toLowerCase());

      const matchesPaymentMethod = filters.paymentMethod
        ? item.paymentMethod === filters.paymentMethod
        : true;

      const matchesDateFrom = filters.dateFrom ? item.date >= filters.dateFrom : true;
      const matchesDateTo = filters.dateTo ? item.date <= filters.dateTo : true;

      return (
        matchesClient &&
        matchesPaymentMethod &&
        matchesDateFrom &&
        matchesDateTo
      );
    });
  }, [cashEntries, filters]);

  const totalCollected = useMemo(() => {
    return filteredCashEntries.reduce((acc, item) => acc + Number(item.amount || 0), 0);
  }, [filteredCashEntries]);

  const totalMovements = filteredCashEntries.length;

  const paymentMethodSummary = useMemo(() => {
    const summary = paymentMethods.map((method) => {
      const total = filteredCashEntries
        .filter((item) => item.paymentMethod === method)
        .reduce((acc, item) => acc + Number(item.amount || 0), 0);

      return {
        method,
        total,
      };
    });

    return summary.filter((item) => item.total > 0);
  }, [filteredCashEntries]);

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === 'linkedAppointmentId') {
      const selected = appointments.find((item) => String(item.id) === value);

      if (selected) {
        setFormData((prev) => ({
          ...prev,
          linkedAppointmentId: value,
          client: selected.client,
          concept: prev.concept || `Cobro reserva - ${selected.services.join(', ')}`,
        }));
        return;
      }
    }

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
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
      paymentMethod: '',
      dateFrom: '',
      dateTo: '',
    });
  };

  const resetForm = () => {
    setFormData({
      date: '',
      client: '',
      concept: '',
      paymentMethod: 'Efectivo',
      amount: '',
      linkedAppointmentId: '',
    });
    setEditingId(null);
    setSearchParams({});
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const { date, client, concept, paymentMethod, amount } = formData;

    if (!date || !client || !concept || !paymentMethod || !amount) {
      alert('Completá todos los campos obligatorios.');
      return;
    }

    const numericAmount = Number(amount);

    if (numericAmount <= 0) {
      alert('Ingresá un monto válido.');
      return;
    }

    if (linkedAppointmentData && numericAmount > linkedAppointmentData.balance) {
      const confirmed = window.confirm(
        `El cobro ingresado ($${numericAmount.toLocaleString('es-AR')}) supera el saldo pendiente de la reserva ($${linkedAppointmentData.balance.toLocaleString('es-AR')}). ¿Querés continuar igualmente?`
      );

      if (!confirmed) return;
    }

    if (editingId) {
      const updatedCashEntries = cashEntries.map((item) =>
        item.id === editingId
          ? {
              ...item,
              ...formData,
              amount: numericAmount,
            }
          : item
      );

      setCashEntries(updatedCashEntries);
    } else {
      const newEntry = {
        id: Date.now(),
        ...formData,
        amount: numericAmount,
      };

      setCashEntries((prev) => [newEntry, ...prev]);
    }

    resetForm();
  };

  const handleEdit = (entry) => {
    setFormData({
      date: entry.date || '',
      client: entry.client || '',
      concept: entry.concept || '',
      paymentMethod: entry.paymentMethod || 'Efectivo',
      amount: entry.amount || '',
      linkedAppointmentId: entry.linkedAppointmentId || '',
    });
    setEditingId(entry.id);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = (id) => {
    const confirmed = window.confirm('¿Querés eliminar este movimiento de caja?');
    if (!confirmed) return;

    const updatedCashEntries = cashEntries.filter((item) => item.id !== id);
    setCashEntries(updatedCashEntries);

    if (editingId === id) {
      resetForm();
    }
  };

  const exportCashToExcel = () => {
    const dataToExport = filteredCashEntries.map((item) => ({
      Fecha: new Date(`${item.date}T00:00:00`).toLocaleDateString('es-AR'),
      Cliente: item.client,
      Concepto: item.concept,
      'Medio de pago': item.paymentMethod,
      Monto: Number(item.amount),
      'Reserva vinculada': item.linkedAppointmentId || '',
    }));

    const worksheet = XLSX.utils.json_to_sheet(dataToExport);
    const workbook = XLSX.utils.book_new();

    XLSX.utils.book_append_sheet(workbook, worksheet, 'Caja');

    const fileName = `caja_autoestetica_${new Date().toISOString().slice(0, 10)}.xlsx`;
    XLSX.writeFile(workbook, fileName);
  };

  return (
    <AdminLayout
      title="Caja interna"
      subtitle="Registrá cobros y controlá ingresos del taller con filtros y resumen por período."
    >
      <div className="row g-4">
        <div className="col-lg-5">
          <div className="content-card">
            <div className="d-flex justify-content-between align-items-center mb-4">
              <h4 className="mb-0">{editingId ? 'Editar cobro' : 'Nuevo cobro'}</h4>
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
                <label className="form-label">Vincular a reserva</label>
                <select
                  name="linkedAppointmentId"
                  className="form-select custom-input"
                  value={formData.linkedAppointmentId}
                  onChange={handleChange}
                >
                  <option value="">No vincular</option>
                  {appointments.map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.client} — {item.vehicle} — {item.date}
                    </option>
                  ))}
                </select>
              </div>

              {linkedAppointmentData && (
                <div className="cash-linked-summary mb-3">
                  <div className="cash-linked-item">
                    <span>Total reserva</span>
                    <strong>${linkedAppointmentData.total.toLocaleString('es-AR')}</strong>
                  </div>
                  <div className="cash-linked-item">
                    <span>Ya cobrado</span>
                    <strong>${linkedAppointmentData.alreadyPaid.toLocaleString('es-AR')}</strong>
                  </div>
                  <div className="cash-linked-item">
                    <span>Saldo pendiente</span>
                    <strong>${linkedAppointmentData.balance.toLocaleString('es-AR')}</strong>
                  </div>
                </div>
              )}

              {linkedAppointmentData && linkedAppointmentData.linkedPayments.length > 0 && (
                <div className="cash-payment-history-box mb-3">
                  <div className="d-flex justify-content-between align-items-center mb-3">
                    <h5 className="mb-0">Historial de cobros de la reserva</h5>
                    <span className="results-counter">
                      {linkedAppointmentData.linkedPayments.length} movimiento(s)
                    </span>
                  </div>

                  <div className="cash-payment-history-list">
                    {linkedAppointmentData.linkedPayments.map((payment) => (
                      <div key={payment.id} className="cash-payment-history-item">
                        <div>
                          <strong>
                            {new Date(`${payment.date}T00:00:00`).toLocaleDateString('es-AR')}
                          </strong>
                          <div className="text-muted-custom">{payment.paymentMethod}</div>
                        </div>

                        <div className="cash-payment-history-right">
                          <strong>${Number(payment.amount).toLocaleString('es-AR')}</strong>
                          <span>{payment.concept}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

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
                <label className="form-label">Concepto</label>
                <input
                  type="text"
                  name="concept"
                  className="form-control custom-input"
                  value={formData.concept}
                  onChange={handleChange}
                  placeholder="Ej: Cobro limpieza interior"
                />
              </div>

              <div className="mb-3">
                <label className="form-label">Medio de pago</label>
                <select
                  name="paymentMethod"
                  className="form-select custom-input"
                  value={formData.paymentMethod}
                  onChange={handleChange}
                >
                  {paymentMethods.map((item) => (
                    <option key={item} value={item}>
                      {item}
                    </option>
                  ))}
                </select>
              </div>

              <div className="mb-4">
                <label className="form-label">Monto</label>
                <input
                  type="number"
                  name="amount"
                  className="form-control custom-input"
                  value={formData.amount}
                  onChange={handleChange}
                  placeholder="Ej: 18000"
                  min="0"
                />
              </div>

              <button type="submit" className="btn btn-brand w-100">
                {editingId ? 'Guardar cambios' : 'Registrar cobro'}
              </button>
            </form>
          </div>
        </div>

        <div className="col-lg-7">
          <div className="content-card mb-4">
            <div className="d-flex justify-content-between align-items-center flex-wrap gap-3 mb-4">
              <h4 className="mb-0">Filtros de caja</h4>
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
                  placeholder="Buscar por cliente"
                />
              </div>

              <div className="col-md-6">
                <label className="form-label">Medio de pago</label>
                <select
                  name="paymentMethod"
                  className="form-select custom-input"
                  value={filters.paymentMethod}
                  onChange={handleFilterChange}
                >
                  <option value="">Todos</option>
                  {paymentMethods.map((item) => (
                    <option key={item} value={item}>
                      {item}
                    </option>
                  ))}
                </select>
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
            <div className="col-md-6">
              <div className="content-card stats-card">
                <p className="stats-label">Movimientos filtrados</p>
                <h3 className="stats-value">{totalMovements}</h3>
              </div>
            </div>

            <div className="col-md-6">
              <div className="content-card stats-card">
                <p className="stats-label">Total filtrado</p>
                <h3 className="stats-value">
                  ${totalCollected.toLocaleString('es-AR')}
                </h3>
              </div>
            </div>
          </div>

          <div className="content-card mb-4">
            <div className="d-flex justify-content-between align-items-center flex-wrap gap-3 mb-4">
              <h4 className="mb-0">Resumen por medio de pago</h4>
            </div>

            {paymentMethodSummary.length > 0 ? (
              <div className="dashboard-list">
                {paymentMethodSummary.map((item) => (
                  <div key={item.method} className="dashboard-list-item">
                    <span>{item.method}</span>
                    <strong>${item.total.toLocaleString('es-AR')}</strong>
                  </div>
                ))}
              </div>
            ) : (
              <p className="mb-0 text-muted-custom">
                No hay movimientos para resumir con los filtros actuales.
              </p>
            )}
          </div>

          <div className="content-card">
            <div className="d-flex justify-content-between align-items-center flex-wrap gap-3 mb-4">
              <h4 className="mb-0">Movimientos</h4>

              <button
                type="button"
                className="btn btn-brand btn-sm"
                onClick={exportCashToExcel}
                disabled={filteredCashEntries.length === 0}
              >
                Exportar caja a Excel
              </button>
            </div>

            <div className="table-responsive">
              <table className="table table-dark table-hover align-middle agenda-table">
                <thead>
                  <tr>
                    <th>Fecha</th>
                    <th>Cliente</th>
                    <th>Concepto</th>
                    <th>Medio</th>
                    <th>Monto</th>
                    <th>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredCashEntries.map((item) => (
                    <tr key={item.id}>
                      <td>{new Date(`${item.date}T00:00:00`).toLocaleDateString('es-AR')}</td>
                      <td>{item.client}</td>
                      <td>{item.concept}</td>
                      <td>{item.paymentMethod}</td>
                      <td>${Number(item.amount).toLocaleString('es-AR')}</td>
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

            {filteredCashEntries.length === 0 && (
              <p className="mb-0 text-muted-custom">
                No hay movimientos que coincidan con los filtros.
              </p>
            )}
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}

export default AdminCash;