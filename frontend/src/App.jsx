import { Navigate, Route, Routes, useLocation } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './pages/Login';
import Register from './pages/Register';
import Home from './pages/Home';
import HotelDetails from './pages/HotelDetails';
import BookingForm from './pages/BookingForm';
import BookingConfirmation from './pages/BookingConfirmation';
import MyBookings from './pages/MyBookings';
import Profile from './pages/Profile';
import AdminDashboard from './pages/AdminDashboard';
import AdminHotels from './pages/AdminHotels';
import AdminRooms from './pages/AdminRooms';
import AdminBookings from './pages/AdminBookings';

function AppLayout() {
  const location = useLocation();

  return (
    <div className="app-shell">
      <Navbar />
      <main className="page-container">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/hotels/:hotelId" element={<HotelDetails />} />
          <Route path="/rooms/:roomId/book" element={<ProtectedRoute><BookingForm /></ProtectedRoute>} />
          <Route path="/booking/confirmation" element={<ProtectedRoute><BookingConfirmation /></ProtectedRoute>} />
          <Route path="/my-bookings" element={<ProtectedRoute><MyBookings /></ProtectedRoute>} />
          <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
          <Route path="/admin" element={<ProtectedRoute adminOnly><AdminDashboard /></ProtectedRoute>} />
          <Route path="/admin/hotels" element={<ProtectedRoute adminOnly><AdminHotels /></ProtectedRoute>} />
          <Route path="/admin/rooms" element={<ProtectedRoute adminOnly><AdminRooms /></ProtectedRoute>} />
          <Route path="/admin/bookings" element={<ProtectedRoute adminOnly><AdminBookings /></ProtectedRoute>} />
          <Route path="*" element={<Navigate to="/" replace state={{ from: location }} />} />
        </Routes>
      </main>
      <Footer />
    </div>
  );
}

export default function App() {
  return <AppLayout />;
}
