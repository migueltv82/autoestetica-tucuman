import { Routes, Route, useLocation } from 'react-router-dom';
import Navbar from './components/layout/Navbar.jsx';
import Footer from './components/layout/Footer.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';
import Home from './pages/Home.jsx';
import Services from './pages/Services.jsx';
import Booking from './pages/Booking.jsx';
import Contact from './pages/Contact.jsx';
import AdminAgenda from './pages/AdminAgenda.jsx';
import AdminStats from './pages/AdminStats.jsx';
import AdminCash from './pages/AdminCash.jsx';
import AdminDashboard from './pages/AdminDashboard.jsx';
import AdminClients from './pages/AdminClients.jsx';
import Login from './pages/Login.jsx';

function App() {
  const location = useLocation();

  const adminRoutes = ['/dashboard', '/agenda', '/estadisticas', '/caja', '/clientes'];
  const isAdminPage = adminRoutes.includes(location.pathname);

  return (
    <div>
      {!isAdminPage && <Navbar />}

      <main>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/servicios" element={<Services />} />
          <Route path="/reservas" element={<Booking />} />
          <Route path="/contacto" element={<Contact />} />
          <Route path="/login" element={<Login />} />

          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <AdminDashboard />
              </ProtectedRoute>
            }
          />

          <Route
            path="/agenda"
            element={
              <ProtectedRoute>
                <AdminAgenda />
              </ProtectedRoute>
            }
          />

          <Route
            path="/estadisticas"
            element={
              <ProtectedRoute>
                <AdminStats />
              </ProtectedRoute>
            }
          />

          <Route
            path="/caja"
            element={
              <ProtectedRoute>
                <AdminCash />
              </ProtectedRoute>
            }
          />

          <Route
            path="/clientes"
            element={
              <ProtectedRoute>
                <AdminClients />
              </ProtectedRoute>
            }
          />
        </Routes>
      </main>

      {!isAdminPage && <Footer />}
    </div>
  );
}

export default App;