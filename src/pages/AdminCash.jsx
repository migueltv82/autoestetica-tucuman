import { useEffect, useMemo, useState } from "react";
import AdminLayout from "../Components/admin/AdminLayout.jsx";
import "../styles/AdminCash.css";
import { supabase } from "../lib/supabase";

const PAYMENT_METHODS = [
  "Efectivo",
  "Transferencia",
  "Débito",
  "Crédito",
  "Seña",
];

function normalizeAppointment(appointment) {
  return {
    ...appointment,
    id: appointment.id,
    client: appointment.client || "",
    phone: appointment.phone || "",
    vehicle: appointment.vehicle || "",
    serviceLabel: appointment.service_name || "Servicio",
    total: Number(appointment.total || 0),
    bookingDate: appointment.booking_date || "",
    payment_status: appointment.payment_status || "pendiente",
    paid_amount: Number(appointment.paid_amount || 0),
    balance_amount: Number(appointment.balance_amount || 0),
  };
}

function calculatePaidForAppointment(appointmentId, entries) {
  return entries
    .filter(
      (entry) =>
        String(entry.linkedAppointmentId || "") === String(appointmentId || "")
    )
    .reduce((acc, entry) => acc + Number(entry.amount || 0), 0);
}

function recalculateAppointmentsPaymentStatus(appointments, entries) {
  return appointments.map((appointment) => {
    const normalized = normalizeAppointment(appointment);
    const total = Number(normalized.total || 0);
    const paid = calculatePaidForAppointment(normalized.id, entries);

    let payment_status = "pendiente";

    if (total > 0 && paid >= total) {
      payment_status = "pagado";
    } else if (paid > 0) {
      payment_status = "señado";
    }

    return {
      ...appointment,
      payment_status,
      paid_amount: paid,
      balance_amount: Math.max(total - paid, 0),
    };
  });
}

export default function AdminCash() {
  const [appointments, setAppointments] = useState([]);
  const [cashEntries, setCashEntries] = useState([]);
  const [loading, setLoading] = useState(true);

  const [filters, setFilters] = useState({
    client: "",
    paymentMethod: "",
    dateFrom: "",
    dateTo: "",
  });

  const [editingId, setEditingId] = useState(null);

  const emptyForm = {
    date: new Date().toISOString().split("T")[0],
    client: "",
    concept: "",
    amount: "",
    paymentMethod: "Efectivo",
    notes: "",
    linkedAppointmentId: "",
  };

  const [formData, setFormData] = useState(emptyForm);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      setLoading(true);

      const [{ data: bookingsData, error: bookingsError }, { data: cashData, error: cashError }] =
        await Promise.all([
          supabase
            .from("bookings")
            .select("*")
            .order("booking_date", { ascending: false }),
          supabase
            .from("cash_entries")
            .select("*")
            .order("entry_date", { ascending: false })
            .order("id", { ascending: false }),
        ]);

      if (bookingsError) throw bookingsError;
      if (cashError) throw cashError;

      const mappedCash =
        (cashData || []).map((entry) => ({
          id: entry.id,
          date: entry.entry_date,
          client: entry.client,
          concept: entry.concept,
          amount: Number(entry.amount || 0),
          paymentMethod: entry.payment_method,
          notes: entry.notes || "",
          linkedAppointmentId: entry.linked_appointment_id,
          createdAt: entry.created_at,
        })) || [];

      setAppointments(bookingsData || []);
      setCashEntries(mappedCash);
    } catch (error) {
      console.error("Error cargando datos:", error);
      alert("No se pudieron cargar los datos de caja.");
    } finally {
      setLoading(false);
    }
  }

  async function syncBookingsPaymentStatus(entries, baseAppointments = appointments) {
    const recalculated = recalculateAppointmentsPaymentStatus(baseAppointments, entries);

    for (const booking of recalculated) {
      const { error } = await supabase
        .from("bookings")
        .update({
          payment_status: booking.payment_status,
          paid_amount: booking.paid_amount,
          balance_amount: booking.balance_amount,
        })
        .eq("id", booking.id);

      if (error) {
        console.error("Error actualizando booking:", error);
        throw error;
      }
    }

    setAppointments(recalculated);
  }

  const appointmentOptions = useMemo(() => {
    return appointments
      .map(normalizeAppointment)
      .filter((item) => item.client.trim())
      .sort((a, b) => a.client.localeCompare(b.client));
  }, [appointments]);

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === "linkedAppointmentId") {
      if (!value) {
        setFormData((prev) => ({
          ...prev,
          linkedAppointmentId: "",
        }));
        return;
      }

      const selected = appointmentOptions.find(
        (item) => String(item.id) === String(value)
      );

      if (selected) {
        setFormData((prev) => ({
          ...prev,
          linkedAppointmentId: value,
          client: selected.client,
          concept:
            prev.concept && editingId
              ? prev.concept
              : `Cobro - ${selected.serviceLabel}`,
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

  const resetForm = () => {
    setFormData({
      ...emptyForm,
      date: new Date().toISOString().split("T")[0],
    });
    setEditingId(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.client.trim()) return alert("Ingresá un cliente.");
    if (!formData.concept.trim()) return alert("Ingresá un concepto.");
    if (!formData.amount || Number(formData.amount) <= 0) {
      return alert("Ingresá un monto válido.");
    }

    try {
      if (editingId) {
        const { error } = await supabase
          .from("cash_entries")
          .update({
            entry_date: formData.date,
            client: formData.client.trim(),
            concept: formData.concept.trim(),
            amount: Number(formData.amount),
            payment_method: formData.paymentMethod,
            notes: formData.notes.trim(),
            linked_appointment_id: formData.linkedAppointmentId || null,
          })
          .eq("id", editingId);

        if (error) throw error;
      } else {
        const { error } = await supabase.from("cash_entries").insert({
          entry_date: formData.date,
          client: formData.client.trim(),
          concept: formData.concept.trim(),
          amount: Number(formData.amount),
          payment_method: formData.paymentMethod,
          notes: formData.notes.trim(),
          linked_appointment_id: formData.linkedAppointmentId || null,
        });

        if (error) throw error;
      }

      await loadData();
      resetForm();
    } catch (error) {
      console.error("Error guardando movimiento:", error);
      alert("No se pudo guardar el movimiento.");
    }
  };

  const handleEdit = (entry) => {
    setEditingId(entry.id);
    setFormData({
      date: entry.date || new Date().toISOString().split("T")[0],
      client: entry.client || "",
      concept: entry.concept || "",
      amount: entry.amount || "",
      paymentMethod: entry.paymentMethod || "Efectivo",
      notes: entry.notes || "",
      linkedAppointmentId: entry.linkedAppointmentId
        ? String(entry.linkedAppointmentId)
        : "",
    });

    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDelete = async (id) => {
    const confirmDelete = window.confirm("¿Eliminar este movimiento?");
    if (!confirmDelete) return;

    try {
      const { error } = await supabase.from("cash_entries").delete().eq("id", id);
      if (error) throw error;

      await loadData();

      if (editingId === id) {
        resetForm();
      }
    } catch (error) {
      console.error("Error eliminando movimiento:", error);
      alert("No se pudo eliminar el movimiento.");
    }
  };

  useEffect(() => {
    if (!loading && appointments.length >= 0) {
      syncBookingsPaymentStatus(cashEntries, appointments).catch((error) => {
        console.error("Error sincronizando pagos:", error);
      });
    }
  }, [cashEntries]);

  const filteredCashEntries = useMemo(() => {
    return cashEntries
      .filter((item) => {
        const matchesClient = item.client
          .toLowerCase()
          .includes(filters.client.toLowerCase());

        const matchesPaymentMethod = filters.paymentMethod
          ? item.paymentMethod === filters.paymentMethod
          : true;

        const matchesDateFrom = filters.dateFrom
          ? item.date >= filters.dateFrom
          : true;

        const matchesDateTo = filters.dateTo
          ? item.date <= filters.dateTo
          : true;

        return (
          matchesClient &&
          matchesPaymentMethod &&
          matchesDateFrom &&
          matchesDateTo
        );
      })
      .sort((a, b) => b.date.localeCompare(a.date) || b.id - a.id);
  }, [cashEntries, filters]);

  const totalCollected = useMemo(() => {
    return filteredCashEntries.reduce(
      (acc, entry) => acc + Number(entry.amount || 0),
      0
    );
  }, [filteredCashEntries]);

  const totalMovements = filteredCashEntries.length;

  const averageTicket = useMemo(() => {
    return totalMovements > 0 ? totalCollected / totalMovements : 0;
  }, [totalCollected, totalMovements]);

  const paymentMethodSummary = useMemo(() => {
    const summary = {};

    filteredCashEntries.forEach((entry) => {
      const method = entry.paymentMethod || "Sin definir";
      summary[method] = (summary[method] || 0) + Number(entry.amount || 0);
    });

    return Object.entries(summary).map(([method, total]) => ({
      method,
      total,
    }));
  }, [filteredCashEntries]);

  const linkedReservationPreview = useMemo(() => {
    if (!formData.linkedAppointmentId) return null;

    const selected = appointmentOptions.find(
      (item) => String(item.id) === String(formData.linkedAppointmentId)
    );

    if (!selected) return null;

    const paid = calculatePaidForAppointment(selected.id, cashEntries);

    const editingEntry = editingId
      ? cashEntries.find((entry) => entry.id === editingId)
      : null;

    const currentEditingAmount =
      editingEntry &&
      String(editingEntry.linkedAppointmentId || "") === String(selected.id || "")
        ? Number(editingEntry.amount || 0)
        : 0;

    const effectivePaid = paid - currentEditingAmount;
    const projectedPaid = effectivePaid + Number(formData.amount || 0);
    const balance = Math.max(Number(selected.total || 0) - projectedPaid, 0);

    return {
      ...selected,
      projectedPaid,
      balance,
    };
  }, [
    formData.linkedAppointmentId,
    formData.amount,
    editingId,
    cashEntries,
    appointmentOptions,
  ]);

  return (
    <AdminLayout
      title="Caja"
      subtitle="Registrá cobros, editá movimientos y sincronizá pagos con reservas y clientes."
    >
      <div className="admin-cash-v2">
        {loading ? (
          <div className="admin-cash-empty">
            <p className="mb-0">Cargando datos...</p>
          </div>
        ) : (
          <>
            <section className="admin-cash-summary-grid">
              <article className="admin-cash-summary-card">
                <div className="admin-cash-summary-icon">
                  <i className="bi bi-cash-stack"></i>
                </div>
                <div>
                  <p className="admin-cash-summary-label">Total cobrado</p>
                  <h3 className="admin-cash-summary-value">
                    ${totalCollected.toLocaleString("es-AR")}
                  </h3>
                </div>
              </article>

              <article className="admin-cash-summary-card">
                <div className="admin-cash-summary-icon info">
                  <i className="bi bi-receipt"></i>
                </div>
                <div>
                  <p className="admin-cash-summary-label">Movimientos</p>
                  <h3 className="admin-cash-summary-value">{totalMovements}</h3>
                </div>
              </article>

              <article className="admin-cash-summary-card">
                <div className="admin-cash-summary-icon warning">
                  <i className="bi bi-bar-chart"></i>
                </div>
                <div>
                  <p className="admin-cash-summary-label">Promedio por cobro</p>
                  <h3 className="admin-cash-summary-value">
                    ${averageTicket.toLocaleString("es-AR", {
                      maximumFractionDigits: 0,
                    })}
                  </h3>
                </div>
              </article>
            </section>

            <div className="admin-cash-grid">
              <section className="admin-cash-panel">
                <div className="admin-cash-panel-head">
                  <div>
                    <p className="admin-cash-panel-kicker">
                      {editingId ? "Editar movimiento" : "Nuevo movimiento"}
                    </p>
                    <h3 className="admin-cash-panel-title">
                      {editingId ? "Actualizar cobro" : "Registrar cobro"}
                    </h3>
                  </div>
                </div>

                <form onSubmit={handleSubmit} className="admin-cash-form">
                  <div className="admin-cash-form-grid">
                    <div>
                      <label className="form-label">Fecha</label>
                      <input
                        type="date"
                        name="date"
                        className="form-control admin-cash-input"
                        value={formData.date}
                        onChange={handleChange}
                      />
                    </div>

                    <div>
                      <label className="form-label">Vincular a reserva</label>
                      <select
                        name="linkedAppointmentId"
                        className="form-select admin-cash-input"
                        value={formData.linkedAppointmentId}
                        onChange={handleChange}
                      >
                        <option value="">Sin vincular</option>
                        {appointmentOptions.map((item) => (
                          <option key={item.id} value={item.id}>
                            {item.client} — {item.serviceLabel}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="form-label">Cliente</label>
                      <input
                        type="text"
                        name="client"
                        className="form-control admin-cash-input"
                        value={formData.client}
                        onChange={handleChange}
                        placeholder="Nombre del cliente"
                      />
                    </div>

                    <div>
                      <label className="form-label">Concepto</label>
                      <input
                        type="text"
                        name="concept"
                        className="form-control admin-cash-input"
                        value={formData.concept}
                        onChange={handleChange}
                        placeholder="Ej: Cobro de servicio"
                      />
                    </div>

                    <div>
                      <label className="form-label">Monto</label>
                      <input
                        type="number"
                        name="amount"
                        className="form-control admin-cash-input"
                        value={formData.amount}
                        onChange={handleChange}
                        placeholder="0"
                        min="0"
                      />
                    </div>

                    <div>
                      <label className="form-label">Medio de pago</label>
                      <select
                        name="paymentMethod"
                        className="form-select admin-cash-input"
                        value={formData.paymentMethod}
                        onChange={handleChange}
                      >
                        {PAYMENT_METHODS.map((method) => (
                          <option key={method} value={method}>
                            {method}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {linkedReservationPreview && (
                    <div className="admin-cash-linked-box">
                      <div className="admin-cash-linked-head">
                        <strong>{linkedReservationPreview.client}</strong>
                        <span>{linkedReservationPreview.serviceLabel}</span>
                      </div>

                      <div className="admin-cash-linked-grid">
                        <div>
                          <small>Fecha</small>
                          <p>{linkedReservationPreview.bookingDate || "-"}</p>
                        </div>
                        <div>
                          <small>Total</small>
                          <p>
                            ${Number(linkedReservationPreview.total || 0).toLocaleString("es-AR")}
                          </p>
                        </div>
                        <div>
                          <small>Pagado proyectado</small>
                          <p>
                            ${Number(linkedReservationPreview.projectedPaid || 0).toLocaleString("es-AR")}
                          </p>
                        </div>
                        <div>
                          <small>Saldo restante</small>
                          <p>
                            ${Number(linkedReservationPreview.balance || 0).toLocaleString("es-AR")}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  <div>
                    <label className="form-label">Observación</label>
                    <textarea
                      name="notes"
                      className="form-control admin-cash-input"
                      rows="3"
                      value={formData.notes}
                      onChange={handleChange}
                      placeholder="Detalle interno del cobro"
                    />
                  </div>

                  <div className="admin-cash-form-actions">
                    {editingId && (
                      <button
                        type="button"
                        className="btn btn-outline-secondary"
                        onClick={resetForm}
                      >
                        Cancelar
                      </button>
                    )}

                    <button type="submit" className="btn btn-brand-dark">
                      {editingId ? "Guardar cambios" : "Guardar cobro"}
                    </button>
                  </div>
                </form>
              </section>

              <section className="admin-cash-panel">
                <div className="admin-cash-panel-head">
                  <div>
                    <p className="admin-cash-panel-kicker">Filtros</p>
                    <h3 className="admin-cash-panel-title">Buscar movimientos</h3>
                  </div>
                </div>

                <div className="admin-cash-form-grid">
                  <div>
                    <label className="form-label">Cliente</label>
                    <input
                      type="text"
                      name="client"
                      className="form-control admin-cash-input"
                      value={filters.client}
                      onChange={handleFilterChange}
                      placeholder="Buscar por cliente"
                    />
                  </div>

                  <div>
                    <label className="form-label">Medio de pago</label>
                    <select
                      name="paymentMethod"
                      className="form-select admin-cash-input"
                      value={filters.paymentMethod}
                      onChange={handleFilterChange}
                    >
                      <option value="">Todos</option>
                      {PAYMENT_METHODS.map((method) => (
                        <option key={method} value={method}>
                          {method}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="form-label">Desde</label>
                    <input
                      type="date"
                      name="dateFrom"
                      className="form-control admin-cash-input"
                      value={filters.dateFrom}
                      onChange={handleFilterChange}
                    />
                  </div>

                  <div>
                    <label className="form-label">Hasta</label>
                    <input
                      type="date"
                      name="dateTo"
                      className="form-control admin-cash-input"
                      value={filters.dateTo}
                      onChange={handleFilterChange}
                    />
                  </div>
                </div>

                <div className="admin-cash-method-grid">
                  {paymentMethodSummary.length > 0 ? (
                    paymentMethodSummary.map((item) => (
                      <div key={item.method} className="admin-cash-method-card">
                        <span>{item.method}</span>
                        <strong>${item.total.toLocaleString("es-AR")}</strong>
                      </div>
                    ))
                  ) : (
                    <div className="admin-cash-empty-mini">
                      Sin movimientos para resumir
                    </div>
                  )}
                </div>
              </section>
            </div>

            <section className="admin-cash-panel">
              <div className="admin-cash-panel-head">
                <div>
                  <p className="admin-cash-panel-kicker">Historial</p>
                  <h3 className="admin-cash-panel-title">Movimientos registrados</h3>
                </div>
              </div>

              {filteredCashEntries.length === 0 ? (
                <div className="admin-cash-empty">
                  <p className="mb-0">No hay movimientos para mostrar.</p>
                </div>
              ) : (
                <div className="admin-cash-table-wrap">
                  <table className="admin-cash-table">
                    <thead>
                      <tr>
                        <th>Fecha</th>
                        <th>Cliente</th>
                        <th>Concepto</th>
                        <th>Medio</th>
                        <th>Monto</th>
                        <th>Observación</th>
                        <th>Acciones</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredCashEntries.map((entry) => (
                        <tr key={entry.id}>
                          <td>{entry.date}</td>
                          <td>{entry.client}</td>
                          <td>{entry.concept}</td>
                          <td>{entry.paymentMethod}</td>
                          <td className="admin-cash-amount">
                            ${Number(entry.amount).toLocaleString("es-AR")}
                          </td>
                          <td>{entry.notes || "-"}</td>
                          <td>
                            <div className="admin-cash-table-actions">
                              <button
                                className="btn btn-sm btn-outline-light"
                                onClick={() => handleEdit(entry)}
                              >
                                Editar
                              </button>

                              <button
                                className="btn btn-sm btn-outline-danger"
                                onClick={() => handleDelete(entry.id)}
                              >
                                Eliminar
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </section>
          </>
        )}
      </div>
    </AdminLayout>
  );
}