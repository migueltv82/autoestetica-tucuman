import { Routes, Route } from 'react-router-dom';
import Navbar from './Components/layout/Navbar.jsx';
import Footer from './Components/layout/Footer.jsx';
import ProtectedRoute from './Components/ProtectedRoute.jsx';
import Home from './pages/Home.jsx';
import Services from './pages/Services.jsx';
import Booking from './pages/Booking.jsx';
import Contact from './pages/Contact.jsx';
import AdminAgenda from './pages/AdminAgenda.jsx';
import Login from './pages/Login.jsx';
import AdminStats from './pages/AdminStats.jsx';
import AdminCash from './pages/AdminCash.jsx';

function App() {
  return (
    <div>
      <Navbar />

      <main>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/servicios" element={<Services />} />
          <Route path="/reservas" element={<Booking />} />
          <Route path="/contacto" element={<Contact />} />
          <Route path="/login" element={<Login />} />
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
        </Routes>
      </main>

      <Footer />
    </div>
  );
}

export default App;