import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "../lib/supabase";
import "../styles/Services.css";

export default function Services() {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const fetchServices = async () => {
      try {
        const { data, error } = await supabase
          .from("services")
          .select("*")
          .order("id", { ascending: true });

        if (error) throw error;
        setServices(data || []);
      } catch (error) {
        console.error(error);
        setMessage("No se pudieron cargar los servicios.");
      } finally {
        setLoading(false);
      }
    };

    fetchServices();
  }, []);

  return (
    <section className="services-page">
      <div className="container py-5">
        <div className="services-hero">
          <span className="services-eyebrow">Autoestética Tucumán</span>
          <h1 className="services-title">Servicios pensados para cuidar cada detalle</h1>
          <p className="services-subtitle">
            Elegí el servicio que mejor se adapte a tu vehículo y reservá tu turno
            de forma rápida y simple.
          </p>
        </div>

        {message && (
          <div className="alert alert-info services-alert" role="alert">
            {message}
          </div>
        )}

        {loading ? (
          <div className="services-empty-state">
            <p>Cargando servicios...</p>
          </div>
        ) : services.length === 0 ? (
          <div className="services-empty-state">
            <h3>No hay servicios disponibles</h3>
            <p>Cuando cargues servicios en la base, van a aparecer acá.</p>
          </div>
        ) : (
          <div className="services-grid">
            {services.map((service) => (
              <article className="service-card" key={service.id}>
                <div className="service-card-top">
                  <span className="service-badge">Servicio</span>
                  <h2 className="service-name">{service.name}</h2>
                  <p className="service-description">
                    {service.description ||
                      "Un servicio pensado para mejorar el aspecto, cuidado y presentación de tu vehículo."}
                  </p>
                </div>

                <div className="service-meta">
                  <div className="service-meta-item">
                    <span>Duración estimada</span>
                    <strong>
                      {service.duration ? `${service.duration} min` : "A coordinar"}
                    </strong>
                  </div>

                  <div className="service-meta-item">
                    <span>Atención</span>
                    <strong>En taller</strong>
                  </div>
                </div>

                <div className="service-actions">
                  <Link to="/reservas" className="btn service-btn-primary">
                    Reservar turno
                  </Link>
                  <Link to="/contacto" className="btn service-btn-secondary">
                    Consultar
                  </Link>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}