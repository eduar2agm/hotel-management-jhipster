import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { CalendarCheck, DatabaseIcon, RefreshCw } from 'lucide-react';
import { Link } from 'react-router-dom';
import { CheckInCheckOutService, ReservaService, MensajeSoporteService, HabitacionService } from '../../services';
import type { CheckInCheckOutDTO, MensajeSoporteDTO } from '../../types/api';
import { toast } from 'sonner';
import { PageHeader } from '../../components/common/PageHeader';
import { DashboardStats } from '../../components/employee/dashboard/DashboardStats';
import { ActivityLog } from '../../components/employee/dashboard/ActivityLog';
import { ServiceRequestsWidget } from '../../components/employee/dashboard/ServiceRequestsWidget';

export const EmployeeDashboard = () => {
    // --- STATE ---
    const [loading, setLoading] = useState(true);
    const [recentActivity, setRecentActivity] = useState<CheckInCheckOutDTO[]>([]);
    const [serviceRequests, setServiceRequests] = useState<MensajeSoporteDTO[]>([]);
    
    // Stats
    const [stats, setStats] = useState({
        pendingCheckIns: 0,
        occupancyRate: 0,
        activeReservations: 0,
        pendingRequests: 0
    });

    const loadData = async () => {
        setLoading(true);
        try {
            const today = new Date();
            today.setHours(0, 0, 0, 0);

            // 1. Fetch All Reserves (Filtering handled here for demo, ideally backend filters)
            const reservasRes = await ReservaService.getReservas({ size: 1000, sort: 'fechaInicio,asc' });
            const allReservas = reservasRes.data;

            // 2. Fetch Active Rooms for Occupancy
            const habitacionesRes = await HabitacionService.getHabitacions({ size: 1000 });
            const totalRooms = habitacionesRes.data.length;

            // 3. Fetch Recent CheckIn/Out Activity
            const activityRes = await CheckInCheckOutService.getAll({ page: 0, size: 5, sort: 'fechaHoraCheckIn,desc' });
            setRecentActivity(activityRes.data);

            // 4. Fetch Service Requests (Unread Messages)
            const messagesRes = await MensajeSoporteService.getMensajes({ page: 0, size: 5, sort: 'fechaMensaje,desc', 'leido.equals': false });
            setServiceRequests(messagesRes.data);

            // --- PROCESS DATA ---
            
            // Check-ins for Today
            const pendingCheckIns = allReservas.filter(r => {
                if (!r.fechaInicio) return false;
                const start = new Date(r.fechaInicio);
                return start.toDateString() === today.toDateString() && r.estado !== 'CANCELADA'; // Assuming active
            });

            // Active Reservations (Occupancy proxy)
            const activeRes = allReservas.filter(r => {
                 if (!r.fechaInicio || !r.fechaFin) return false;
                 const start = new Date(r.fechaInicio);
                 const end = new Date(r.fechaFin);
                 const now = new Date();
                 return start <= now && end >= now && r.estado !== 'CANCELADA';
            });
            
            const occupancy = totalRooms > 0 ? Math.round((activeRes.length / totalRooms) * 100) : 0;

            setStats({
                pendingCheckIns: pendingCheckIns.length,
                occupancyRate: occupancy,
                activeReservations: activeRes.length,
                pendingRequests: Number(messagesRes.headers['x-total-count'] || messagesRes.data.length)
            });

        } catch (error) {
            console.error("Error loading dashboard data", error);
            toast.error("Error al actualizar el dashboard");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadData();
    }, []);

    return (
        <div className="font-sans text-gray-900 bg-gray-50 min-h-screen flex flex-col">

            {/* --- HERO SECTION --- */}
            <PageHeader
                title="Dashboard Operativo"
                icon={DatabaseIcon} 
                subtitle="Bienvenido al centro de control. Gestione reservas, huéspedes y servicios en tiempo real."
                category="Panel de Administración"
                className="bg-[#0F172A]" // Optional overrides if needed
            >
                <Button 
                    onClick={loadData} 
                    disabled={loading}
                    variant="outline" 
                    className="bg-transparent text-white border-white/20 hover:bg-white/10"
                >
                    <RefreshCw className={`mr-2 h-4 w-4 ${loading ? 'animate-spin' : ''}`} /> Actualizar
                </Button>
                <Link to="/employee/reservas">
                        <Button className="bg-yellow-600 hover:bg-yellow-700 text-white rounded-none px-6 py-6 shadow-lg transition-all border border-yellow-600/30">
                        <CalendarCheck className="mr-2 h-4 w-4" /> Ver Calendario
                    </Button>
                </Link>
            </PageHeader>

            <main className="flex-grow py-12 px-4 md:px-8 lg:px-20 relative z-10">
                <div className="max-w-6xl mx-auto -mt-16">
                    
                    {/* STATS GRID */}
                    <DashboardStats stats={stats} />

                    {/* CONTENT GRID */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        
                        {/* LEFT COLUMN: ACTIVITY LOG */}
                        <div className="lg:col-span-2 space-y-6">
                            <ActivityLog activities={recentActivity} />
                        </div>

                        {/* RIGHT COLUMN: NOTIFICATIONS */}
                        <div className="space-y-6">
                            <ServiceRequestsWidget requests={serviceRequests} />
                        </div>

                    </div>
                </div>
            </main>

        </div>
    );
};
