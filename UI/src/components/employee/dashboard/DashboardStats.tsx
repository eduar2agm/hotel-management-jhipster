import { ArrowRight, Users, BedDouble, Bell, CalendarCheck } from 'lucide-react';

interface DashboardStatsProps {
    stats: {
        pendingCheckIns: number;
        occupancyRate: number;
        activeReservations: number;
        pendingRequests: number;
    };
}

export const DashboardStats = ({ stats }: DashboardStatsProps) => {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {/* Stat 1: Check-ins */}
            <div className="bg-card p-6 rounded-sm shadow-lg border border-border border-t-4 border-t-emerald-500 flex items-start justify-between transform hover:-translate-y-1 transition-transform duration-300">
                <div>
                    <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-1">Check-ins Hoy</p>
                    <h3 className="text-3xl font-black text-card-foreground">{stats.pendingCheckIns}</h3>
                    <span className="text-xs text-emerald-600 dark:text-emerald-400 font-medium flex items-center mt-2">
                        <ArrowRight className="w-3 h-3 mr-1" /> Llegadas previstas
                    </span>
                </div>
                <div className="bg-emerald-50 dark:bg-emerald-500/10 p-3 rounded-full text-emerald-600 dark:text-emerald-400">
                    <Users className="w-6 h-6" />
                </div>
            </div>

            {/* Stat 2: Ocupación */}
            <div className="bg-card p-6 rounded-sm shadow-lg border border-border border-t-4 border-t-blue-500 flex items-start justify-between transform hover:-translate-y-1 transition-transform duration-300">
                <div>
                    <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-1">Ocupación</p>
                    <h3 className="text-3xl font-black text-card-foreground">{stats.occupancyRate}%</h3>
                    <span className="text-xs text-blue-600 dark:text-blue-400 font-medium flex items-center mt-2">
                        <ArrowRight className="w-3 h-3 mr-1" /> Habitaciones activas
                    </span>
                </div>
                <div className="bg-blue-50 dark:bg-blue-500/10 p-3 rounded-full text-blue-600 dark:text-blue-400">
                    <BedDouble className="w-6 h-6" />
                </div>
            </div>

             {/* Stat 3: Solicitudes */}
             <div className="bg-card p-6 rounded-sm shadow-lg border border-border border-t-4 border-t-yellow-500 flex items-start justify-between transform hover:-translate-y-1 transition-transform duration-300">
                <div>
                    <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-1">Solicitudes</p>
                    <h3 className="text-3xl font-black text-card-foreground">{stats.pendingRequests}</h3>
                    <span className="text-xs text-yellow-600 dark:text-yellow-400 font-medium flex items-center mt-2">
                        <ArrowRight className="w-3 h-3 mr-1" /> Sin leer
                    </span>
                </div>
                <div className="bg-yellow-50 dark:bg-yellow-500/10 p-3 rounded-full text-yellow-600 dark:text-yellow-400">
                    <Bell className="w-6 h-6" />
                </div>
            </div>

            {/* Stat 4: Reservas Activas */}
            <div className="bg-card p-6 rounded-sm shadow-lg border border-border border-t-4 border-t-indigo-500 flex items-start justify-between transform hover:-translate-y-1 transition-transform duration-300">
                <div>
                    <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-1">Huéspedes</p>
                    <h3 className="text-3xl font-black text-card-foreground">{stats.activeReservations}</h3>
                    <span className="text-xs text-indigo-600 dark:text-indigo-400 font-medium flex items-center mt-2">
                        <ArrowRight className="w-3 h-3 mr-1" /> Estancias en curso
                    </span>
                </div>
                <div className="bg-indigo-50 dark:bg-indigo-500/10 p-3 rounded-full text-indigo-600 dark:text-indigo-400">
                    <CalendarCheck className="w-6 h-6" />
                </div>
            </div>
        </div>
    );
};
