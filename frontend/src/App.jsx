import { Routes, Route, Navigate } from 'react-router-dom'
import HomePage from './pages/HomePage'
import AdminLogin from './pages/admin/adminLogin'
import AdminDashboard from './pages/admin/adminDashboard'
// Bạn có thể giữ lại index.css nếu đã dán nội dung từ globals.css vào đó
import './index.css'

function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/admin" element={<Navigate to="/admin/login" replace />} />
      <Route path="/admin/login" element={<AdminLogin />} />
      <Route path="/admin/dashboard" element={<AdminDashboard />} />
    </Routes>
  )
}

export default App
