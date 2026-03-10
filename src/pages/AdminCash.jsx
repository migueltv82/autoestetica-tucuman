import { useEffect, useMemo, useState } from 'react';

function AdminCash() {
  const appointments = JSON.parse(localStorage.getItem('adminAppointments') || '[]');

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

  const paymentMethods = ['Efectivo', 'Transferencia', 'Tarjeta', 'Mercado Pago', 'Otro'];

  useEffect(() => {
    localStorage.setItem('adminCashEntries', JSON.stringify(cashEntries));
  }, [cashEntries]);

  const totalCollected = useMemo(() => {
    return cashEntries.reduce((acc, item) => acc + Number(item.amount || 0), 0);
  }, [cashEntries]);

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === 'linkedAppointmentId') {
      const selected = appointments.find((item) => String(item.id) === value);

      if (selected) {
        setFormData((prev) => ({
          ...prev,
          linkedAppointmentId: value,
          client: selected.client,
          concept: `Cobro reserva - ${selected.services.join(', ')}`,
          amount: selected.total,
        }));
        return;
      }
    }

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const { date, client, concept, paymentMethod, amount } = formData;

    if (!date || !client || !concept || !paymentMethod || !amount) {
      alert('Completá todos los campos obligatorios.');
      return;
    }

    const newEntry = {
      id: Date.now(),
      ...formData,
      amount: Number(amount),
    };

    setCashEntries((prev) => [newEntry, ...prev]);

    setFormData({
      date: '',
      client: '',
      concept: '',
      paymentMethod: 'Efectivo',
      amount: '',
      linkedAppointmentId: '',
    });
  };

  const handleDelete = (id) => {
    const confirmed = window.confirm('¿Querés eliminar este movimiento de caja?');
    if (!confirmed) return;

    setCashEntries((prev) => prev.filter((item) => item.id !== id));
  };

  return (
    <section className="page-section">
      <div className="container py-5">
        <div className="text-center mb-5">
          <h2 className="section-title">Caja interna</h2>
          <p className="section-text">
            Registrá cobros y llevá un control simple de ingresos del taller.
          </p>
        </div>

        <div className="row g-4">
          <div className="col-lg-5">
            <div className="content-card">
              <h4 className="mb-4">Nuevo cobro</h4>

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
                  Registrar cobro
                </button>
              </form>
            </div>
          </div>

          <div className="col-lg-7">
            <div className="content-card mb-4">
              <div className="d-flex justify-content-between align-items-center flex-wrap gap-3">
                <h4 className="mb-0">Resumen de caja</h4>
                <div className="admin-total-box">
                  <span className="admin-total-label">Total cobrado:</span>
                  <span className="admin-total-value">
                    ${totalCollected.toLocaleString('es-AR')}
                  </span>
                </div>
              </div>
            </div>

            <div className="content-card">
              <h4 className="mb-4">Movimientos</h4>

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
                    {cashEntries.map((item) => (
                      <tr key={item.id}>
                        <td>{new Date(`${item.date}T00:00:00`).toLocaleDateString('es-AR')}</td>
                        <td>{item.client}</td>
                        <td>{item.concept}</td>
                        <td>{item.paymentMethod}</td>
                        <td>${Number(item.amount).toLocaleString('es-AR')}</td>
                        <td>
                          <button
                            type="button"
                            className="btn btn-sm btn-outline-danger"
                            onClick={() => handleDelete(item.id)}
                          >
                            Borrar
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {cashEntries.length === 0 && (
                <p className="mb-0 text-muted-custom">Todavía no hay movimientos cargados.</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default AdminCash;