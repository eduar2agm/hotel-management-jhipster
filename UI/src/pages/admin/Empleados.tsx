import { useEffect, useState } from 'react';
import { EmployeeService, type EmployeeDTO } from '../../services/employee.service';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { UserCog, Plus, Pencil, Trash2, CheckCircle2, XCircle, Shield, User } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { PageHeader } from '@/components/common/PageHeader';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
    DialogDescription
} from '@/components/ui/dialog';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';

import { useAuth } from '../../hooks/useAuth';

export const AdminEmpleados = () => {
    const { user } = useAuth();
    const [employees, setEmployees] = useState<EmployeeDTO[]>([]);
    const [loading, setLoading] = useState(false);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [currentEmployee, setCurrentEmployee] = useState<Partial<EmployeeDTO>>({});
    const [isEditing, setIsEditing] = useState(false);
    const [saving, setSaving] = useState(false);
    const [isViewDetailsOpen, setIsViewDetailsOpen] = useState(false);

    const currentUserLogin = user?.username || '';

    useEffect(() => {
        loadEmployees();
    }, []);

    const loadEmployees = async () => {
        setLoading(true);
        try {
            const res = await EmployeeService.getAll();
            setEmployees(res.data);
        } catch (error) {
            toast.error('Error al cargar empleados');
        } finally {
            setLoading(false);
        }
    };

    const handleCreate = () => {
        setCurrentEmployee({
            login: '',
            firstName: '',
            lastName: '',
            email: '',
            role: 'EMPLOYEE',
            active: true
        });
        setIsEditing(false);
        setIsDialogOpen(true);
    };

    const handleEdit = (emp: EmployeeDTO) => {
        setCurrentEmployee({ ...emp });
        setIsEditing(true);
        setIsDialogOpen(true);
    };

    const handleViewDetails = (emp: EmployeeDTO) => {
        setCurrentEmployee({ ...emp });
        setIsViewDetailsOpen(true);
    };

    const handleDeactivate = async (login: string, active: boolean) => {
        if (login === currentUserLogin) {
            toast.error("No puedes desactivar tu propia cuenta.");
            return;
        }
        if (confirm(`¿Desea ${!active ? 'desactivar' : 'activar'} a este usuario?`)) { // Logic inverted in args vs naming, waiting. 
            // The arg 'active' usually means 'set to active'.
            // My previous code: handleDeactivate(emp.login, true) -> Deactivate. 
            // Wait, previous code: onClick={() => handleDeactivate(emp.login, true)} title="Desactivar"
            // So true meant "perform deactivate"? 
            // Let's refactor to be explicit.
            try {
                if (active) { // If 'active' param is true, we are ACTIVATING
                    await EmployeeService.activate(login);
                    toast.success('Usuario activado');
                } else { // If 'active' param is false, we are DEACTIVATING
                    await EmployeeService.deactivate(login);
                    toast.success('Usuario desactivado');
                }
                loadEmployees();
            } catch (error) {
                toast.error('Error al cambiar estado');
            }
        }
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            setSaving(true);
            if (isEditing) {
                if (currentEmployee.login === currentUserLogin && currentEmployee.role !== employees.find(e => e.login === currentUserLogin)?.role) {
                    toast.error("No puedes cambiar tu propio rol.");
                    return;
                }
                await EmployeeService.update(currentEmployee as EmployeeDTO);
                toast.success('Empleado actualizado');
            } else {
                const res = await EmployeeService.create(currentEmployee as EmployeeDTO);
                toast.success('Empleado creado exitosamente');
                alert(`IMPORTANTE:\n\nUsuario creado: ${currentEmployee.login}\nContraseña Temporal: ${res.data.password}\n\nEl usuario deberá cambiarla al iniciar sesión.`);
            }
            setIsDialogOpen(false);
            loadEmployees();
        } catch (error) {
            toast.error('Error al guardar empleado');
            console.error(error);
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="font-sans text-foreground bg-background min-h-screen flex flex-col">
            <PageHeader
                title="Gestión de Empleados"
                icon={UserCog}
                subtitle="Administre el personal, cuentas de acceso y roles del sistema."
                category="Administración"
                className="bg-slate-900"
            >
                <Button onClick={handleCreate} className="bg-yellow-600 hover:bg-yellow-700 text-white shadow-lg">
                    <Plus className="mr-2 h-5 w-5" /> Nuevo Empleado
                </Button>
            </PageHeader>

            <main className="flex-grow py-10 px-4 md:px-8 lg:px-20 -mt-10 relative z-10">
                <Card className="max-w-6xl mx-auto shadow-xl bg-card">
                    <CardHeader>
                        <CardTitle>Personal Registrado</CardTitle>
                        <CardDescription>Lista de usuarios con acceso administrativo o operativo.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Usuario</TableHead>
                                    <TableHead>Nombre Completo</TableHead>
                                    <TableHead>Email</TableHead>
                                    <TableHead>Rol (Asignado)</TableHead>
                                    <TableHead className="text-right">Acciones</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {employees.map((emp) => (
                                    <TableRow key={emp.login} className={!emp.active ? 'opacity-60 bg-slate-50 dark:bg-slate-900/50' : ''}>
                                        <TableCell className="font-mono font-bold">{emp.login}</TableCell>
                                        <TableCell>{emp.firstName} {emp.lastName}</TableCell>
                                        <TableCell>{emp.email}</TableCell>
                                        <TableCell>
                                            <Badge variant={emp.role === 'ADMIN' ? 'default' : 'secondary'} className="gap-1">
                                                <Shield className="h-3 w-3" />
                                                {emp.role === 'ADMIN' ? 'Administrador' : emp.role === 'EMPLOYEE' ? 'Empleado' : 'Desconocido'}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-right space-x-2">
                                            <Button variant="ghost" size="icon" onClick={() => handleViewDetails(emp)} title="Ver Detalles">
                                                <User className="h-4 w-4 text-slate-500" />
                                            </Button>

                                            <Button variant="ghost" size="icon" onClick={() => handleEdit(emp)} title="Editar">
                                                <Pencil className="h-4 w-4 text-blue-500" />
                                            </Button>

                                            {/* Logic: Show Deactivate (X) if active. Show Activate (Check) if inactive. 
                                                Disable if current user. */}
                                            {emp.active ? (
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() => handleDeactivate(emp.login, false)}
                                                    title="Desactivar"
                                                    disabled={emp.login === currentUserLogin}
                                                >
                                                    <XCircle className={`h-4 w-4 ${emp.login === currentUserLogin ? 'text-gray-300 opacity-50 cursor-not-allowed' : 'text-red-500'}`} />
                                                </Button>
                                            ) : (
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() => handleDeactivate(emp.login, true)}
                                                    title="Activar"
                                                    disabled={emp.login === currentUserLogin}
                                                >
                                                    <CheckCircle2 className={`h-4 w-4 ${emp.login === currentUserLogin ? 'text-gray-300 opacity-50 cursor-not-allowed' : 'text-green-500'}`} />
                                                </Button>
                                            )}
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>

                {/* Create/Edit Dialog */}
                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>{isEditing ? 'Editar Empleado' : 'Nuevo Empleado'}</DialogTitle>
                            <DialogDescription>
                                Configure los datos de acceso y el rol del personal.
                            </DialogDescription>
                        </DialogHeader>
                        <form onSubmit={handleSave} className="space-y-4">
                            {!isEditing && (
                                <div className="grid gap-2">
                                    <Label>Usuario (Login)</Label>
                                    <Input
                                        value={currentEmployee.login}
                                        onChange={e => setCurrentEmployee({ ...currentEmployee, login: e.target.value })}
                                        required
                                    />
                                </div>
                            )}
                            <div className="grid grid-cols-2 gap-4">
                                <div className="grid gap-2">
                                    <Label>Nombre</Label>
                                    <Input
                                        value={currentEmployee.firstName}
                                        onChange={e => setCurrentEmployee({ ...currentEmployee, firstName: e.target.value })}
                                        required
                                    />
                                </div>
                                <div className="grid gap-2">
                                    <Label>Apellido</Label>
                                    <Input
                                        value={currentEmployee.lastName}
                                        onChange={e => setCurrentEmployee({ ...currentEmployee, lastName: e.target.value })}
                                        required
                                    />
                                </div>
                            </div>
                            <div className="grid gap-2">
                                <Label>Email</Label>
                                <Input
                                    type="email"
                                    value={currentEmployee.email}
                                    onChange={e => setCurrentEmployee({ ...currentEmployee, email: e.target.value })}
                                    required
                                />
                            </div>

                            {/* Role Selection: Always visible but disabled if self-editing */}
                            {(
                                <div className="grid gap-2">
                                    <Label>Rol</Label>
                                    <Select
                                        value={currentEmployee.role}
                                        onValueChange={val => setCurrentEmployee({ ...currentEmployee, role: val })}
                                        disabled={isEditing && currentEmployee.login === currentUserLogin}
                                    >
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="EMPLOYEE">Empleado / Recepción</SelectItem>
                                            <SelectItem value="ADMIN">Administrador</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    {isEditing && currentEmployee.login === currentUserLogin && (
                                        <p className="text-xs text-muted-foreground">No puedes modificar tu propio rol.</p>
                                    )}
                                </div>
                            )}

                            <DialogFooter>
                                <Button type="submit" disabled={saving}>
                                    {saving ? 'Guardando...' : 'Guardar'}
                                </Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>

                {/* View Details Dialog */}
                <Dialog open={isViewDetailsOpen} onOpenChange={setIsViewDetailsOpen}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Detalles del Empleado</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <Label className="text-muted-foreground">Usuario</Label>
                                    <p className="font-semibold">{currentEmployee.login}</p>
                                </div>
                                <div>
                                    <Label className="text-muted-foreground">Estado</Label>
                                    <div>
                                        {currentEmployee.active ? (
                                            <Badge variant="default" className="bg-green-600">Activo</Badge>
                                        ) : (
                                            <Badge variant="destructive">Inactivo</Badge>
                                        )}
                                    </div>
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <Label className="text-muted-foreground">Nombre</Label>
                                    <p>{currentEmployee.firstName}</p>
                                </div>
                                <div>
                                    <Label className="text-muted-foreground">Apellido</Label>
                                    <p>{currentEmployee.lastName}</p>
                                </div>
                            </div>
                            <div>
                                <Label className="text-muted-foreground">Email</Label>
                                <p>{currentEmployee.email}</p>
                            </div>
                            <div>
                                <Label className="text-muted-foreground">Rol</Label>
                                <p className="font-medium">
                                    {currentEmployee.role === 'ADMIN' ? 'Administrador' : currentEmployee.role === 'EMPLOYEE' ? 'Empleado / Recepción' : currentEmployee.role}
                                </p>
                            </div>
                        </div>
                        <DialogFooter>
                            <Button variant="outline" onClick={() => setIsViewDetailsOpen(false)}>Cerrar</Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </main>
        </div>
    );
};
