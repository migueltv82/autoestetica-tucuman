import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import "../styles/Login.css";

function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();

    const adminUser = 'admin';
    const adminPass = '1234';

    if (username === adminUser && password === adminPass) {
      localStorage.setItem('isAdminAuth', 'true');
      navigate('/dashboard');
      return;
    }

    setError('Usuario o contraseña incorrectos.');
  };

  return (
    <section className="login-page d-flex align-items-center">
      <div className="container py-5">
        <div className="row justify-content-center align-items-center g-4">
          <div className="col-lg-5">
            <div className="login-info-card">
              <span className="login-badge mb-3">Acceso privado</span>
              <h1 className="login-title mb-3">Panel de administración</h1>
              <p className="login-text mb-4">
                Ingresá con tus credenciales para administrar reservas, turnos, estados y servicios
                de Autoestética Tucumán.
              </p>

              <div className="login-feature-list">
                <div className="login-feature-item">
                  <i className="bi bi-shield-lock"></i>
                  <span>Acceso reservado para administrador</span>
                </div>

                <div className="login-feature-item">
                  <i className="bi bi-calendar-check"></i>
                  <span>Gestión completa de agenda y reservas</span>
                </div>

                <div className="login-feature-item">
                  <i className="bi bi-pencil-square"></i>
                  <span>Edición y control rápido de turnos</span>
                </div>
              </div>
            </div>
          </div>

          <div className="col-lg-5">
            <div className="login-form-card">
              <div className="text-center mb-4">
                <div className="login-icon-wrap mb-3">
                  <i className="bi bi-person-lock login-main-icon"></i>
                </div>
                <h2 className="section-title mb-2">Ingreso administrador</h2>
                <p className="section-text mb-0">
                  Accedé a la agenda interna con tu usuario y contraseña.
                </p>
              </div>

              <form onSubmit={handleSubmit}>
                <div className="mb-3">
                  <label className="form-label">Usuario</label>
                  <input
                    type="text"
                    className="form-control custom-input"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Ingresá tu usuario"
                  />
                </div>

                <div className="mb-4">
                  <label className="form-label">Contraseña</label>
                  <input
                    type="password"
                    className="form-control custom-input"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Ingresá tu contraseña"
                  />
                </div>

                <button type="submit" className="btn btn-brand w-100 login-submit-btn">
                  Ingresar al panel
                </button>

                {error && (
                  <p className="text-center mt-3 validation-text">
                    {error}
                  </p>
                )}
              </form>

              <div className="login-helper-text mt-4 text-center">
                Solo el administrador autorizado puede ingresar a esta sección.
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default Login;