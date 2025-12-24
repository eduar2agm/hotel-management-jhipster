import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { 
    AreaChart, 
    Area, 
    XAxis, 
    YAxis, 
    CartesianGrid, 
    Tooltip, 
    Legend, 
    ResponsiveContainer 
} from 'recharts';
import { ReservaService } from '../../services';

interface GraficoReservasProps {
    className?: string;
}

export const GraficoReservas: React.FC<GraficoReservasProps> = ({ className }) => {
    const [data, setData] = useState<any[]>([]);
    const [periodo, setPeriodo] = useState<'semana' | 'mes'>('semana');
    const [loading, setLoading] = useState<boolean>(false);
    const [errorMsg, setErrorMsg] = useState<string | null>(null);

    useEffect(() => {
        fetchData(periodo);
    }, [periodo]);

    const fetchData = async (p: string) => {
        setLoading(true);
        setErrorMsg(null);
        try {
            const response = await ReservaService.getStatsGrafico(p);
            setData(response.data);
        } catch (error: any) {
            console.error("Error fetching chart data", error);
            setErrorMsg(error.message || "Error al cargar datos");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Card className={`shadow-xl border-border bg-card ${className}`}>
            <CardHeader className="flex flex-row items-center justify-between pb-4 border-b border-border">
                <div>
                    <CardTitle className="text-lg font-bold text-card-foreground">Estadísticas Detalladas</CardTitle>
                    <CardDescription>Reservas apiladas por estado</CardDescription>
                </div>
                <div className="flex bg-muted rounded-md p-1">
                    <button
                        onClick={() => setPeriodo('semana')}
                        className={`px-3 py-1.5 text-sm font-medium rounded-sm transition-all ${
                            periodo === 'semana' 
                            ? 'bg-background text-foreground shadow-sm' 
                            : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                        }`}
                    >
                        Semana
                    </button>
                    <button
                        onClick={() => setPeriodo('mes')}
                        className={`px-3 py-1.5 text-sm font-medium rounded-sm transition-all ${
                            periodo === 'mes' 
                            ? 'bg-background text-foreground shadow-sm' 
                            : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                        }`}
                    >
                        Mes
                    </button>
                </div>
            </CardHeader>
            <CardContent className="p-6">
                {errorMsg && (
                    <div className="text-red-500 mb-4 text-center text-sm bg-red-100/10 p-2 rounded">
                        Error: {errorMsg}. Asegúrate de reiniciar el backend.
                    </div>
                )}
                <div className="h-[350px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart
                            data={data}
                            margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                        >
                            <defs>
                                <linearGradient id="colorConfirmadas" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#22c55e" stopOpacity={0.8}/>
                                    <stop offset="95%" stopColor="#22c55e" stopOpacity={0}/>
                                </linearGradient>
                                <linearGradient id="colorPendientes" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#eab308" stopOpacity={0.8}/>
                                    <stop offset="95%" stopColor="#eab308" stopOpacity={0}/>
                                </linearGradient>
                                <linearGradient id="colorFinalizadas" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/>
                                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                                </linearGradient>
                                <linearGradient id="colorCanceladas" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#ef4444" stopOpacity={0.8}/>
                                    <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" strokeOpacity={0.5} />
                            <XAxis 
                                dataKey="name" 
                                stroke="#94a3b8" 
                                fontSize={12} 
                                tickLine={false} 
                                axisLine={false} 
                            />
                            <YAxis 
                                stroke="#94a3b8" 
                                fontSize={12} 
                                tickLine={false} 
                                axisLine={false} 
                            />
                            <Tooltip 
                                contentStyle={{ 
                                    backgroundColor: 'var(--card)', 
                                    borderRadius: '8px', 
                                    border: '1px solid var(--border)', 
                                    color: 'var(--card-foreground)',
                                    boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                                }}
                                itemStyle={{ fontSize: '13px', fontWeight: 500 }}
                            />
                            <Legend wrapperStyle={{ paddingTop: '20px' }}/>
                            <Area 
                                type="monotone" 
                                dataKey="CANCELADA" 
                                stroke="#ef4444" 
                                fill="url(#colorCanceladas)" 
                                name="Canceladas" 
                                strokeWidth={2}
                            />
                            <Area 
                                type="monotone" 
                                dataKey="PENDIENTE" 
                                stroke="#eab308" 
                                fill="url(#colorPendientes)" 
                                name="Pendientes" 
                                strokeWidth={2}
                            />
                            <Area 
                                type="monotone" 
                                dataKey="FINALIZADA" 
                                stroke="#3b82f6" 
                                fill="url(#colorFinalizadas)" 
                                name="Finalizadas" 
                                strokeWidth={2}
                            />
                            <Area 
                                type="monotone" 
                                dataKey="CONFIRMADA" 
                                stroke="#22c55e" 
                                fill="url(#colorConfirmadas)" 
                                name="Confirmadas" 
                                strokeWidth={2}
                            />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            </CardContent>
        </Card>
    );
};
