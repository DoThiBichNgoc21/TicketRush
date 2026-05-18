import { Routes, Route, Navigate } from 'react-router-dom'
import HomePage from './pages/HomePage'
import AdminLogin from './pages/admin/adminLogin'
import AdminDashboard from './pages/admin/adminDashboard'
import CreateEventStep1 from './pages/admin/adminEvents_1'
import CreateEventStep2 from './pages/admin/adminEvents_2'
import CreateEventStep3 from './pages/admin/adminEvents_3'
import EventDetail from "./pages/admin/adminEventDetail";
import './index.css'
import "leaflet/dist/leaflet.css";
import AdminEvents from "./pages/admin/adminEvents";


function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/admin" element={<Navigate to="/admin/login" replace />} />
      <Route path="/admin/login" element={<AdminLogin />} />
      <Route path="/admin/dashboard" element={<AdminDashboard />} />


      <Route path="/admin/events" element={<AdminEvents />} />
      <Route path="/admin/events/:id" element={<EventDetail />} />
      <Route path="/admin/events/create/step-1" element={<CreateEventStep1 />} />
      <Route path="/admin/events/create/step-2" element={<CreateEventStep2 />} />
      <Route path="/admin/events/create/step-3" element={<CreateEventStep3 />} />

    </Routes>
  )
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
import SearchPage from './pages/user/SearchPage';
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
        <Route path="/search" element={<SearchPage />} />
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/admin/register" element={<AdminRegister />} />
        <Route path="/admin/dashboard" element={<AdminDashboard />} />
      </Routes>
      <Toaster />
    </>
  );
}

export default App;
