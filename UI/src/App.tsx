import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from 'react-oidc-context';
import { oidcConfig } from './config/oidc-config';
import { ProtectedRoute } from './components/ProtectedRoute';
import { Login } from './pages/Login';
import { Unauthorized } from './pages/Unauthorized';
import { AdminDashboard } from './pages/admin/AdminDashboard';
import { EmployeeDashboard } from './pages/employee/EmployeeDashboard';
import { ClientReservas } from './pages/client/ClientReservas';
import { Home } from './pages/HomePage'
import { Habitaciones } from './pages/client/habitaciones'
import { Reservas } from './pages/client/Reservas'
import { Servicios } from './pages/client/Servicios'
import { Menu } from './pages/client/Menu'
import './App.css';

function App() {
  return (
    <AuthProvider {...oidcConfig}>
      <BrowserRouter>
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/unauthorized" element={<Unauthorized />} />
          <Route path="/home" element={<Home/>} />
          <Route path="/habitaciones" element={<Habitaciones />} />
          <Route path="/reservas" element={<Reservas />} />
          <Route path="/servicios" element={<Servicios />} />
          <Route path="/menu" element={<Menu />} />

          {/* Protected Routes */}
          <Route
            path="/admin/dashboard"
            element={
              <ProtectedRoute requiredRoles={['ROLE_ADMIN']}>
                <AdminDashboard />
              </ProtectedRoute>
            }
          />

          <Route
            path="/employee/dashboard"
            element={
              <ProtectedRoute requiredRoles={['ROLE_ADMIN', 'ROLE_EMPLOYEE']}>
                <EmployeeDashboard />
              </ProtectedRoute>
            }
          />

          <Route
            path="/client/reservas"
            element={
              <ProtectedRoute requiredRoles={['ROLE_CLIENT']}>
                <ClientReservas />
              </ProtectedRoute>
            }
          />

          {/* Default Redirect */}
          <Route path="/" element={<Navigate to="/login" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
