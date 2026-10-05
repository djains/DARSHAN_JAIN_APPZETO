import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import Navbar from './components/Navbar/Navbar';
import ProtectedRoute from './components/ProtectedRoute/ProtectedRoute';

/* Pages */
import Auth        from './pages/Auth/Auth';
import Home        from './pages/Home/Home';
import EventDetail from './pages/EventDetail/EventDetail';
import Checkout    from './pages/Checkout/Checkout';
import Bookings    from './pages/Bookings/Bookings';
import Admin       from './pages/Admin/Admin';

import './index.css';

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ToastProvider>
          <Navbar />
          <Routes>
            {/* Auth Screen - Public */}
            <Route path="/auth" element={<Auth />} />

            {/* All Site Routes Protected - Requires Login/Signup */}
            <Route path="/" element={<ProtectedRoute><Home /></ProtectedRoute>} />
            <Route path="/movie/:id" element={<ProtectedRoute><EventDetail /></ProtectedRoute>} />
            <Route path="/checkout" element={<ProtectedRoute><Checkout /></ProtectedRoute>} />
            <Route path="/bookings" element={<ProtectedRoute><Bookings /></ProtectedRoute>} />

            {/* Admin Dashboard Protected - Admin Role Only */}
            <Route path="/admin" element={<ProtectedRoute adminOnly><Admin /></ProtectedRoute>} />

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </ToastProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
