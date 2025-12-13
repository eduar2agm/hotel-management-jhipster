import { DashboardLayout } from '../../components/DashboardLayout';

export const ClientReservas = () => {
    return (
        <DashboardLayout title="Mis Reservas" role="Cliente">
            <div style={{ marginTop: '30px', maxWidth: '600px', margin: '30px auto' }}>
                <div style={{ border: '1px solid #e0e0e0', borderRadius: '12px', overflow: 'hidden', background: 'white', color: '#333', boxShadow: '0 4px 15px rgba(0,0,0,0.05)' }}>
                    <div style={{ background: 'linear-gradient(135deg, #007bff 0%, #0056b3 100%)', color: 'white', padding: '20px' }}>
                        <h3 style={{ margin: 0, fontSize: '1.4rem' }}>🏖️ Tu Próxima Estancia</h3>
                        <p style={{ margin: '5px 0 0 0', opacity: 0.9 }}>Faltan 2 días</p>
                    </div>
                    <div style={{ padding: '25px', textAlign: 'left' }}>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '20px' }}>
                            <div>
                                <small style={{ color: '#888', textTransform: 'uppercase', fontSize: '0.75rem', fontWeight: 'bold' }}>Fecha de Entrada</small>
                                <p style={{ margin: '5px 0', fontSize: '1.1rem', fontWeight: '500' }}>15 Dic 2025</p>
                            </div>
                            <div>
                                <small style={{ color: '#888', textTransform: 'uppercase', fontSize: '0.75rem', fontWeight: 'bold' }}>Fecha de Salida</small>
                                <p style={{ margin: '5px 0', fontSize: '1.1rem', fontWeight: '500' }}>20 Dic 2025</p>
                            </div>
                            <div style={{ gridColumn: '1 / -1' }}>
                                <small style={{ color: '#888', textTransform: 'uppercase', fontSize: '0.75rem', fontWeight: 'bold' }}>Habitación</small>
                                <p style={{ margin: '5px 0', fontSize: '1.1rem', fontWeight: '500' }}>Suite de Lujo (Vistas al Mar)</p>
                            </div>
                        </div>

                        <div style={{ display: 'flex', gap: '10px', paddingTop: '15px', borderTop: '1px solid #eee' }}>
                            <button style={{ flex: 1, padding: '12px', cursor: 'pointer', background: 'white', color: '#333', border: '1px solid #ddd', borderRadius: '6px', fontWeight: '500', transition: 'all 0.2s' }}>Ver Detalles</button>
                            <button style={{ flex: 1, padding: '12px', cursor: 'pointer', background: 'white', color: '#333', border: '1px solid #ddd', borderRadius: '6px', fontWeight: '500' }}>Modificar</button>
                        </div>
                    </div>
                </div>

                <div style={{ marginTop: '40px', textAlign: 'center' }}>
                    <button style={{ padding: '15px 40px', fontSize: '1.1rem', background: '#28a745', color: 'white', border: 'none', borderRadius: '50px', cursor: 'pointer', boxShadow: '0 4px 10px rgba(40, 167, 69, 0.3)', fontWeight: 'bold' }}>
                        + Nueva Reserva
                    </button>
                </div>
            </div>
        </DashboardLayout>
    );
};
