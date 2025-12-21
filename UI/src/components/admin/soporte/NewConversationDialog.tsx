import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { type ClienteDTO } from '../../../types/api/Cliente';
import { useAuth } from '../../../hooks/useAuth';
import { MensajeSoporteService } from '../../../services/mensaje-soporte.service';
import { Remitente } from '../../../types/enums';

import { type MensajeSoporteDTO } from '../../../types/api/MensajeSoporte';

interface NewConversationDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    clientes: ClienteDTO[];
    onSuccess: (msg: MensajeSoporteDTO) => void;
}

export const NewConversationDialog = ({ open, onOpenChange, clientes, onSuccess }: NewConversationDialogProps) => {
    const { user } = useAuth();
    const [selectedClientId, setSelectedClientId] = useState<string>('');
    const [selectedClientName, setSelectedClientName] = useState<string>('');
    const [message, setMessage] = useState('');

    const handleSend = async () => {
        if (!selectedClientId || !message) {
            toast.error("Complete los campos");
            return;
        }

        try {
            const payload = {
                userId: user?.id || 'admin',
                userName: user?.username || 'Administrador',
                fechaMensaje: new Date().toISOString(),
                remitente: Remitente.ADMINISTRATIVO,
                leido: false,
                activo: true,
                mensaje: message,
                destinatarioId: selectedClientId,
                destinatarioName: selectedClientName
            };

            const resp = await MensajeSoporteService.createMensaje(payload as any);
            onSuccess(resp.data);
            onOpenChange(false);
            setMessage('');
            setSelectedClientId('');
            toast.success("Mensaje enviado");
        } catch (e) {
            toast.error("Error al enviar");
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>Contactar Cliente</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 pt-4">
                    <div className="grid gap-2">
                        <Label>Seleccionar Cliente</Label>
                        <Select
                            value={selectedClientId}
                            onValueChange={(val) => {
                                const c = clientes.find(cl => cl.keycloakId === val || String(cl.id) === val);
                                setSelectedClientId(val);
                                if (c) setSelectedClientName(`${c.nombre} ${c.apellido}`);
                            }}
                        >
                            <SelectTrigger><SelectValue placeholder="Buscar cliente..." /></SelectTrigger>
                            <SelectContent>
                                {clientes.map(c => (
                                    <SelectItem key={c.id} value={c.keycloakId || String(c.id)}>
                                        {c.nombre} {c.apellido} ({c.correo})
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="grid gap-2">
                        <Label>Mensaje</Label>
                        <Textarea
                            value={message}
                            onChange={e => setMessage(e.target.value)}
                            rows={4}
                            placeholder="Escribe tu mensaje..."
                        />
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
                        <Button onClick={handleSend} className="bg-yellow-600 hover:bg-yellow-700 text-white">Enviar</Button>
                    </DialogFooter>
                </div>
            </DialogContent>
        </Dialog>
    );
};
