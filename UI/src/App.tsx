import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from 'react-oidc-context';
import { oidcConfig } from './config/oidc-config';
import { ProtectedRoute } from './components/ProtectedRoute';
import { Login } from './pages/Login';
import { Unauthorized } from './pages/Unauthorized';

import { AdminDashboard } from './pages/admin/AdminDashboard';
import { AdminHabitaciones } from './pages/admin/Habitaciones';
import { AdminClientes } from './pages/admin/Clientes';
import { AdminReservas } from './pages/admin/ReservasAdmin';
import { AdminPagos } from './pages/admin/Pagos';
import { AdminMensajesSoporte } from './pages/admin/MensajesSoporte';
import { AdminCategorias } from './pages/admin/Categorias';
import { AdminEstados } from './pages/admin/Estados';
import { AdminReportes } from './pages/admin/Reportes';
import { AdminConfiguracion } from './pages/admin/Configuracion';
import { AdminServicios } from './pages/admin/Servicios';
import { AdminServiciosContratados } from './pages/admin/ServiciosContratados';
import { AdminContratarServicio } from './pages/admin/ContratarServicio';

import { EmployeeDashboard } from './pages/employee/EmployeeDashboard';
import { CheckIn } from './pages/employee/CheckIn';
import { EmployeeReservas } from './pages/employee/ReservasEmployee';
import { EmployeeMensajesSoporte } from './pages/employee/MensajesSoporte';
import { EmployeeServicios } from './pages/employee/Servicios';
import { EmployeeServiciosContratados } from './pages/employee/ServiciosContratados';
import { EmployeeContratarServicio } from './pages/employee/ContratarServicio';

import { ClientReservas } from './pages/client/ClientReservas';
import { NuevaReserva } from './pages/client/NuevaReserva';
import { Perfil } from './pages/client/Perfil';
import { ClientMensajesSoporte } from './pages/client/MensajesSoporte';
import { Servicios } from './pages/client/Servicios';
import { MisServicios } from './pages/client/MisServicios';
import { Menu } from './pages/client/Menu';
import { StripeTest } from './pages/client/StripeTest';

import { Toaster } from 'sonner';
import { AuthTokenSync } from './components/AuthTokenSync';
import './api/axios-interceptors';
import './App.css';
import { Home } from './pages/HomePage';


function App() {
  return (
    <AuthProvider {...oidcConfig}>
      <AuthTokenSync />
      <Toaster position="top-right" />
      <BrowserRouter>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/unauthorized" element={<Unauthorized />} />
          <Route path="/HomePage" element={<Home />} />

          {/* Admin Routes */}
          <Route path="/admin/dashboard" element={<ProtectedRoute requiredRoles={['ROLE_ADMIN']}><AdminDashboard /></ProtectedRoute>} />
          <Route path="/admin/habitaciones" element={<ProtectedRoute requiredRoles={['ROLE_ADMIN']}><AdminHabitaciones /></ProtectedRoute>} />
          <Route path="/admin/clientes" element={<ProtectedRoute requiredRoles={['ROLE_ADMIN']}><AdminClientes /></ProtectedRoute>} />
          <Route path="/admin/reservas" element={<ProtectedRoute requiredRoles={['ROLE_ADMIN']}><AdminReservas /></ProtectedRoute>} />
          <Route path="/admin/pagos" element={<ProtectedRoute requiredRoles={['ROLE_ADMIN']}><AdminPagos /></ProtectedRoute>} />
          <Route path="/admin/soporte" element={<ProtectedRoute requiredRoles={['ROLE_ADMIN']}><AdminMensajesSoporte /></ProtectedRoute>} />
          <Route path="/admin/categorias" element={<ProtectedRoute requiredRoles={['ROLE_ADMIN']}><AdminCategorias /></ProtectedRoute>} />
          <Route path="/admin/estados" element={<ProtectedRoute requiredRoles={['ROLE_ADMIN']}><AdminEstados /></ProtectedRoute>} />
          <Route path="/admin/reportes" element={<ProtectedRoute requiredRoles={['ROLE_ADMIN']}><AdminReportes /></ProtectedRoute>} />
          <Route path="/admin/configuracion" element={<ProtectedRoute requiredRoles={['ROLE_ADMIN']}><AdminConfiguracion /></ProtectedRoute>} />
          <Route path="/admin/servicios" element={<ProtectedRoute requiredRoles={['ROLE_ADMIN']}><AdminServicios /></ProtectedRoute>} />
          <Route path="/admin/servicios-contratados" element={<ProtectedRoute requiredRoles={['ROLE_ADMIN']}><AdminServiciosContratados basePath="/admin" /></ProtectedRoute>} />
          <Route path="/admin/servicios/contratar" element={<ProtectedRoute requiredRoles={['ROLE_ADMIN']}><AdminContratarServicio returnPath="/admin/servicios-contratados" /></ProtectedRoute>} />

          {/* Employee Routes */}
          <Route path="/employee/dashboard" element={<ProtectedRoute requiredRoles={['ROLE_ADMIN', 'ROLE_EMPLOYEE']}><EmployeeDashboard /></ProtectedRoute>} />
          <Route path="/employee/clientes" element={<ProtectedRoute requiredRoles={['ROLE_ADMIN', 'ROLE_EMPLOYEE']}><AdminClientes /></ProtectedRoute>} />
          <Route path="/employee/checkin" element={<ProtectedRoute requiredRoles={['ROLE_ADMIN', 'ROLE_EMPLOYEE']}><CheckIn /></ProtectedRoute>} />
          <Route path="/employee/reservas" element={<ProtectedRoute requiredRoles={['ROLE_ADMIN', 'ROLE_EMPLOYEE']}><EmployeeReservas /></ProtectedRoute>} />
          <Route path="/employee/soporte" element={<ProtectedRoute requiredRoles={['ROLE_ADMIN', 'ROLE_EMPLOYEE']}><EmployeeMensajesSoporte /></ProtectedRoute>} />
          <Route path="/employee/servicios" element={<ProtectedRoute requiredRoles={['ROLE_ADMIN', 'ROLE_EMPLOYEE']}><EmployeeServicios /></ProtectedRoute>} />
          <Route path="/employee/servicios-contratados" element={<ProtectedRoute requiredRoles={['ROLE_ADMIN', 'ROLE_EMPLOYEE']}><EmployeeServiciosContratados /></ProtectedRoute>} />
          <Route path="/employee/servicios/contratar" element={<ProtectedRoute requiredRoles={['ROLE_ADMIN', 'ROLE_EMPLOYEE']}><EmployeeContratarServicio /></ProtectedRoute>} />

          {/* Client Routes */}
          <Route path="/client/HomePage" element={<ProtectedRoute requiredRoles={['ROLE_CLIENT']}><Home /></ProtectedRoute>} />
          <Route path="/client/reservas" element={<ProtectedRoute requiredRoles={['ROLE_CLIENT']}><ClientReservas /></ProtectedRoute>} />
          <Route path="/client/nueva-reserva" element={<ProtectedRoute requiredRoles={['ROLE_CLIENT']}><NuevaReserva /></ProtectedRoute>} />
          <Route path="/client/perfil" element={<ProtectedRoute requiredRoles={['ROLE_CLIENT']}><Perfil /></ProtectedRoute>} />
          <Route path="/client/soporte" element={<ProtectedRoute requiredRoles={['ROLE_CLIENT']}><ClientMensajesSoporte /></ProtectedRoute>} />
          <Route path="/client/servicios" element={<ProtectedRoute requiredRoles={['ROLE_CLIENT']}><Servicios /></ProtectedRoute>} />
          <Route path="/client/mis-servicios" element={<ProtectedRoute requiredRoles={['ROLE_CLIENT']}><MisServicios /></ProtectedRoute>} />
          <Route path="/client/menu" element={<ProtectedRoute requiredRoles={['ROLE_CLIENT']}><Menu /></ProtectedRoute>} />
          <Route path="/client/stripe-test" element={<ProtectedRoute requiredRoles={['ROLE_CLIENT']}><StripeTest /></ProtectedRoute>} />

          {/* Catch all - Redirect to Home */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
