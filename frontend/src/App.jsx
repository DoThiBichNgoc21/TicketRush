import { Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from './components/ui/sonner';

// --- IMPORT CÁC TRANG CỦA USER ---
import HomePage from './pages/HomePage';
import UserLogin from './pages/user/Login';
import UserRegister from './pages/user/Register';
import VerifyEmailPage from './pages/user/VerifyEmailPage';
import CheckYourEmailPage from './pages/user/CheckYourEmailPage';
import UserEventsPage from './pages/user/EventsPage';
import EventDetailPage from './pages/user/EventDetailPage';
import BookingPage from './pages/user/BookingPage';
import CheckoutPage from './pages/user/CheckoutPage';
import MyTickets from './pages/user/MyTickets';
import ProfilePage from './pages/user/Profile';
import SearchPage from './pages/user/SearchPage';

// --- IMPORT CÁC TRANG CỦA ADMIN ---
// Lưu ý: Kiểm tra lại đường dẫn file của bạn (adminLogin hay Login) cho đúng với thư mục thực tế
import AdminLogin from './pages/admin/adminLogin'; 
import AdminRegister from './pages/admin/Register';
import AdminDashboard from './pages/admin/adminDashboard';
import AdminEvents from "./pages/admin/adminEvents";
import EventDetail from "./pages/admin/adminEventDetail";
import CreateEventStep1 from './pages/admin/adminEvents_1';
import CreateEventStep2 from './pages/admin/adminEvents_2';
import CreateEventStep3 from './pages/admin/adminEvents_3';
import UserManagement from "./pages/admin/adminUserManagement";

// --- IMPORT CSS ---
import './index.css';
import "leaflet/dist/leaflet.css";

function App() {
  return (
    <>
      <Routes>
        {/* LUỒNG CỦA USER (KHÁN GIẢ) */}
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<UserLogin />} />
        <Route path="/register" element={<UserRegister />} />
        <Route path="/check-your-email" element={<CheckYourEmailPage />} />
        <Route path="/verify-email" element={<VerifyEmailPage />} />
        <Route path="/su-kien" element={<UserEventsPage />} />
        <Route path="/event/:id" element={<EventDetailPage />} />
        <Route path="/booking/:showtimeId" element={<BookingPage />} />
        <Route path="/booking/:showtimeId/checkout" element={<CheckoutPage />} />
        <Route path="/my-tickets" element={<MyTickets />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/search" element={<SearchPage />} />

        {/* LUỒNG CỦA ADMIN (QUẢN TRỊ) */}
        <Route path="/admin" element={<Navigate to="/admin/login" replace />} />
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/admin/register" element={<AdminRegister />} />
        <Route path="/admin/dashboard" element={<AdminDashboard />} />
        <Route path="/admin/events" element={<AdminEvents />} />
        <Route path="/admin/events/:id" element={<EventDetail />} />
        <Route path="/admin/events/create/step-1" element={<CreateEventStep1 />} />
        <Route path="/admin/events/create/step-2" element={<CreateEventStep2 />} />
        <Route path="/admin/events/create/step-3" element={<CreateEventStep3 />} />
        <Route path="/admin/usermanagement" element={<UserManagement />} />
      </Routes>
      
      {/* Hiển thị thông báo Toast cho toàn hệ thống */}
      <Toaster />
    </>
  );
}

export default App;