import { DashboardLayout } from '../../components/DashboardLayout';

export const EmployeeDashboard = () => {
    return (
        <DashboardLayout title="Operaciones Diarias" role="Empleado">
            <div style={{ marginTop: '30px', textAlign: 'left', maxWidth: '800px', margin: '30px auto' }}>
                <div style={{ background: 'white', color: '#333', padding: '20px', borderRadius: '10px', boxShadow: '0 2px 10px rgba(0,0,0,0.05)' }}>
                    <h3 style={{ borderBottom: '2px solid #f0f0f0', paddingBottom: '10px', marginBottom: '20px' }}>📅 Tareas Pendientes (Hoy)</h3>
                    <ul style={{ listStyle: 'none', padding: 0 }}>
                        <li style={{ padding: '15px', borderBottom: '1px solid #eee', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div>
                                <strong style={{ display: 'block', fontSize: '1.1rem' }}>Check-in: Juan Pérez</strong>
                                <span style={{ color: '#666', fontSize: '0.9rem' }}>Reserva #12345 • Habitación 101</span>
                            </div>
                            <button style={{ background: '#28a745', color: 'white', border: 'none', padding: '8px 15px', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>Realizar Check-in</button>
                        </li>
                        <li style={{ padding: '15px', borderBottom: '1px solid #eee', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div>
                                <strong style={{ display: 'block', fontSize: '1.1rem' }}>Check-out: Ana Gómez</strong>
                                <span style={{ color: '#666', fontSize: '0.9rem' }}>Reserva #12340 • Habitación 205</span>
                            </div>
                            <button style={{ background: '#dc3545', color: 'white', border: 'none', padding: '8px 15px', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>Procesar Salida</button>
                        </li>
                        <li style={{ padding: '15px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div>
                                <strong style={{ display: 'block', fontSize: '1.1rem' }}>Solicitud de Servicio</strong>
                                <span style={{ color: '#666', fontSize: '0.9rem' }}>Habitación 304 - Toallas extra</span>
                            </div>
                            <span style={{ background: '#ffc107', padding: '5px 10px', borderRadius: '20px', fontSize: '0.8rem', fontWeight: 'bold' }}>Pendiente</span>
                        </li>
                    </ul>
                </div>
            </div>
        </DashboardLayout>
    );
};
