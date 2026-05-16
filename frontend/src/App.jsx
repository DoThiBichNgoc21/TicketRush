import { Routes, Route } from 'react-router-dom';
import HomePage from './pages/HomePage';
import AdminLogin from './pages/admin/Login';
import AdminRegister from './pages/admin/Register';
import AdminDashboard from './pages/admin/Dashboard';
import UserLogin from './pages/user/Login';
import UserRegister from './pages/user/Register';
import UserEventsPage from './pages/user/EventsPage';
import EventDetailPage from './pages/user/EventDetailPage';
import BookingPage from './pages/user/BookingPage';
import ProfilePage from './pages/user/Profile';
import { Toaster } from './components/ui/sonner';
import './index.css';

function App() {
  return (
    <>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<UserLogin />} />
        <Route path="/register" element={<UserRegister />} />
        <Route path="/su-kien" element={<UserEventsPage />} />
        <Route path="/event/:id" element={<EventDetailPage />} />
        <Route path="/booking/:showtimeId" element={<BookingPage />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/admin/register" element={<AdminRegister />} />
        <Route path="/admin/dashboard" element={<AdminDashboard />} />
      </Routes>
      <Toaster />
    </>
  );
}

export default App;
