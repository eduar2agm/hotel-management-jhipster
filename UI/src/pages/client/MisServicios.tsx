import { useEffect, useState } from 'react';
import { ReservaService } from '../../services/reserva.service';
import { ServicioContratadoService } from '../../services/servicio-contratado.service';
import type { ServicioContratadoDTO } from '../../types/api/ServicioContratado';
import { EstadoServicioContratado } from '../../types/api/ServicioContratado';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { Badge } from '@/components/ui/badge';
import { Navbar } from '../../components/layout/Navbar';
import { Footer } from '../../components/layout/Footer';
import { format } from 'date-fns';
import { Sparkles } from 'lucide-react';

import { PageHeader } from '../../components/common/PageHeader';

export const MisServicios = () => {
    const [items, setItems] = useState<ServicioContratadoDTO[]>([]);
    const [loading, setLoading] = useState(false);

    const loadData = async () => {
        setLoading(true);
        try {
            // 1. Get My Reservations
            // Note: This assumes getReservas returns the client's reservations when logged in as client
            const reservasRes = await ReservaService.getReservas({ size: 100 });
            const reservas = reservasRes.data;

            if (reservas.length > 0) {
                // 2. For each reservation, get services
                // Optimized: Run in parallel
                const validReservas = reservas.filter(r => r.id !== undefined && r.id !== null);
                const promises = validReservas.map(r => ServicioContratadoService.getByReservaId(r.id!));
                const results = await Promise.all(promises);

                // 3. Flatten list
                const allServices = results.flatMap(r => r.data);

                // Sort by date desc
                allServices.sort((a, b) => new Date(b.fechaContratacion || '').getTime() - new Date(a.fechaContratacion || '').getTime());

                setItems(allServices);
            } else {
                setItems([]);
            }

        } catch (error) {
            console.error('Error loading services', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { loadData(); }, []);

    const getStatusBadgeVariant = (estado: EstadoServicioContratado): "default" | "secondary" | "destructive" | "outline" | null | undefined => {
        switch (estado) {
            case EstadoServicioContratado.CONFIRMADO: return "default"; // Greenish usually handled by class not variant but default is safe
            case EstadoServicioContratado.PENDIENTE: return "secondary";
            case EstadoServicioContratado.COMPLETADO: return "outline";
            case EstadoServicioContratado.CANCELADO: return "destructive";
            default: return "secondary";
        }
    };

    return (
        <div className="font-sans text-gray-900 bg-gray-50 min-h-screen flex flex-col">
            <Navbar />

            <PageHeader
                title="Mis Servicios Contratados"
                subtitle="Historial de servicios adicionales y amenidades."
                category="Servicios y Amenidades"
                className="bg-[#0F172A]"
            />

            <main className="flex-grow py-5 px-4 md:px-8 lg:px-20 -mt-10 relative z-10">
                <Card className="max-w-7xl mx-auto border-t-4 border-yellow-600 shadow-xl bg-white">
                    <CardHeader className="border-b bg-gray-50/50 pb-6">
                        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                            <div>
                                <CardTitle className="text-xl font-bold text-gray-800 flex items-center gap-2">
                                    <Sparkles className="h-5 w-5 text-yellow-600" /> Servicios Activos e Históricos
                                </CardTitle>
                                <CardDescription>Mostrando {items.length} registros</CardDescription>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="p-0">
                        <div className="overflow-x-auto">
                            <Table>
                                <TableHeader>
                                    <TableRow className="bg-gray-50/50 hover:bg-gray-50/50">
                                        <TableHead className="font-bold text-gray-600">Servicio</TableHead>
                                        <TableHead className="font-bold text-gray-600">Fecha</TableHead>
                                        <TableHead className="font-bold text-gray-600">Reserva</TableHead>
                                        <TableHead className="font-bold text-gray-600 text-right">Cant.</TableHead>
                                        <TableHead className="font-bold text-gray-600 text-right">Total</TableHead>
                                        <TableHead className="font-bold text-gray-600 text-center">Estado</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {loading ? (
                                        <TableRow>
                                            <TableCell colSpan={6} className="h-24 text-center">Cargando...</TableCell>
                                        </TableRow>
                                    ) : items.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={6} className="h-24 text-center text-gray-500">No has contratado servicios aún.</TableCell>
                                        </TableRow>
                                    ) : (
                                        items.map((item) => (
                                            <TableRow key={item.id} className="hover:bg-gray-50/50 transition-colors">
                                                <TableCell className="font-medium text-blue-700">{item.servicio?.nombre}</TableCell>
                                                <TableCell>{item.fechaContratacion ? format(new Date(item.fechaContratacion), 'dd/MM/yyyy') : '-'}</TableCell>
                                                <TableCell>
                                                    <Badge variant="outline" className="font-mono bg-white">
                                                        #{item.reserva?.id}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell className="text-right">{item.cantidad}</TableCell>
                                                <TableCell className="text-right font-bold text-green-600">
                                                    ${(Number(item.precioUnitario) * item.cantidad).toFixed(2)}
                                                </TableCell>
                                                <TableCell className="text-center">
                                                    <Badge variant={getStatusBadgeVariant(item.estado)} className="shadow-sm">
                                                        {item.estado}
                                                    </Badge>
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    )}
                                </TableBody>
                            </Table>
                        </div>
                    </CardContent>
                </Card>
            </main>
            <Footer />
        </div>
    );
};
