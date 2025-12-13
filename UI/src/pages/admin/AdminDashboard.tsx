import { DashboardLayout } from '../../components/DashboardLayout';

export const AdminDashboard = () => {
    return (
        <DashboardLayout title="Panel de Administración" role="Administrador">
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginTop: '30px' }}>
                <div style={{ padding: '20px', background: '#ffffff', color: '#333', borderRadius: '8px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)', border: '1px solid #eaeaea' }}>
                    <h3 style={{ marginTop: 0, color: '#333' }}>👥 Usuarios</h3>
                    <p style={{ color: '#666' }}>Gestionar empleados y clientes del sistema.</p>
                    <button style={{ marginTop: '10px', padding: '8px 16px', cursor: 'pointer', background: '#007bff', color: 'white', border: 'none', borderRadius: '4px' }}>Administrar</button>
                </div>
                <div style={{ padding: '20px', background: '#ffffff', color: '#333', borderRadius: '8px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)', border: '1px solid #eaeaea' }}>
                    <h3 style={{ marginTop: 0, color: '#333' }}>🏨 Habitaciones</h3>
                    <p style={{ color: '#666' }}>Configurar tipos, precios y mantenimientos.</p>
                    <button style={{ marginTop: '10px', padding: '8px 16px', cursor: 'pointer', background: '#6c757d', color: 'white', border: 'none', borderRadius: '4px' }}>Gestionar</button>
                </div>
                <div style={{ padding: '20px', background: '#ffffff', color: '#333', borderRadius: '8px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)', border: '1px solid #eaeaea' }}>
                    <h3 style={{ marginTop: 0, color: '#333' }}>📊 Reportes</h3>
                    <p style={{ color: '#666' }}>Ver métricas de ocupación e ingresos.</p>
                    <button style={{ marginTop: '10px', padding: '8px 16px', cursor: 'pointer', background: '#28a745', color: 'white', border: 'none', borderRadius: '4px' }}>Ver Dashboard</button>
                </div>
            </div>
        </DashboardLayout>
    );
};
