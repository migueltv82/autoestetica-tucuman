import { Routes, Route, useLocation } from 'react-router-dom';
import Navbar from './Components/layout/Navbar.jsx';
import Footer from './Components/layout/Footer.jsx';
import ProtectedRoute from './Components/ProtectedRoute.jsx';
import Home from './pages/Home.jsx';
import Services from './pages/Services.jsx';
import Booking from './pages/Booking.jsx';
import Contact from './pages/Contact.jsx';
import AdminStats from './pages/AdminStats.jsx';
import AdminCash from './pages/AdminCash.jsx';
import AdminDashboard from './pages/AdminDashboard.jsx';
import AdminClients from './pages/AdminClients.jsx';
import Login from './pages/Login.jsx';

function App() {
  const location = useLocation();

  const isAdminPage =
    location.pathname.startsWith('/dashboard') ||
    location.pathname.startsWith('/estadisticas') ||
    location.pathname.startsWith('/caja') ||
    location.pathname.startsWith('/clientes');

  return (
    <div>
      {!isAdminPage && <Navbar />}

      <main>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/servicios" element={<Services />} />
          <Route path="/reservas" element={<Booking />} />
          <Route path="/reservar" element={<Booking />} />
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