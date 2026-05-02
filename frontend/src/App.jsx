import { Routes, Route, Navigate } from 'react-router-dom'
import HomePage from './pages/HomePage'
import AdminLogin from './pages/admin/adminLogin'
import AdminDashboard from './pages/admin/adminDashboard'
import CreateEventStep1 from './pages/admin/adminEvents_1'
import CreateEventStep2 from './pages/admin/adminEvents_2'
import CreateEventStep3 from './pages/admin/adminEvents_3'
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

      <Route path="/admin/events/create/step-1" element={<CreateEventStep1 />} />
      <Route path="/admin/events/create/step-2" element={<CreateEventStep2 />} />
      <Route path="/admin/events/create/step-3" element={<CreateEventStep3 />} />

    </Routes>
  )
}

export default App
