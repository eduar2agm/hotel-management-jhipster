import { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMapEvents, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Edit, Save, MapPin } from 'lucide-react';
import { toast } from 'sonner';
import { saveUbicacion, getUbicacionPrincipal } from '@/services/ubicacion.service';
import { type IUbicacion } from '@/types/api/Ubicacion';

// Fix Leaflet Default Icon
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41]
});

L.Marker.prototype.options.icon = DefaultIcon;

// Helper component to handle map clicks
const MapEvents = ({ onDoubleClick }: { onDoubleClick: (lat: number, lng: number) => void }) => {
    useMapEvents({
        dblclick(e) {
            onDoubleClick(e.latlng.lat, e.latlng.lng);
        },
    });
    return null;
};

// Helper to auto-center map when coordinates change
const MapUpdater = ({ center }: { center: [number, number] }) => {
    const map = useMap();
    useEffect(() => {
        map.flyTo(center, map.getZoom());
    }, [center, map]);
    return null;
};

export const LocationMap = () => {
    const { isAdmin } = useAuth();
    const [loading, setLoading] = useState(true);
    const [location, setLocation] = useState<IUbicacion | null>(null);

    // Edit State
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editForm, setEditForm] = useState<IUbicacion>({
        latitud: 0,
        longitud: 0,
        nombre: '',
        direccion: '',
        googleMapsUrl: '',
        activo: true
    });

    // Confirmation for Double Click Map Update
    const [confirmPos, setConfirmPos] = useState<{lat: number, lng: number} | null>(null);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        setLoading(true);
        const data = await getUbicacionPrincipal();
        if (data) {
            setLocation(data);
            setEditForm(data);
        } else {
            // Default center if no data
            const defaultLoc = {
                latitud: 40.416775,
                longitud: -3.703790, // Madrid Default
                nombre: 'Ubicación Principal',
                direccion: '',
                activo: true
            };
            setLocation(defaultLoc);
            setEditForm(defaultLoc);
        }
        setLoading(false);
    };

    const handleOpenEdit = () => {
        if (location) {
            setEditForm({ ...location });
        }
        setIsDialogOpen(true);
    };

    const parseGoogleMapsUrl = (url: string) => {
        // Basic regex for standard google maps coords
        // Matches @-12.345,67.890
        const regexAt = /@(-?\d+\.\d+),(-?\d+\.\d+)/;
        const matchAt = url.match(regexAt);

        if (matchAt) {
            return { lat: parseFloat(matchAt[1]), lng: parseFloat(matchAt[2]) };
        }

        // Other format: ?q=lat,lng
        const regexQ = /[?&]q=(-?\d+\.\d+),(-?\d+\.\d+)/;
        const matchQ = url.match(regexQ);
        if (matchQ) {
            return { lat: parseFloat(matchQ[1]), lng: parseFloat(matchQ[2]) };
        }

        return null;
    };

    const handleUrlPaste = () => {
        const coords = parseGoogleMapsUrl(editForm.googleMapsUrl || '');
        if (coords) {
            // Clear the URL field after extraction to avoid DB length issues
            setEditForm({ ...editForm, latitud: coords.lat, longitud: coords.lng, googleMapsUrl: '' });
            toast.success("Coordenadas extraídas del link");
        } else {
            toast.error("No se pudieron extraer coordenadas del link");
        }
    };

    const handleSave = async () => {
        try {
            const saved = await saveUbicacion(editForm);
            setLocation(saved);
            setIsDialogOpen(false);
            toast.success("Ubicación actualizada");
        } catch (error) {
            console.error(error);
            toast.error("Error al guardar ubicación");
        }
    };

    const handleMapDoubleClick = (lat: number, lng: number) => {
        if (!isAdmin()) return;
        // If dialog is open, update form directly
        if (isDialogOpen) {
            setEditForm(prev => ({ ...prev, latitud: lat, longitud: lng }));
            toast.info("Coordenadas actualizadas desde el mapa");
        } else {
           // If dialog closed, maybe ask confirmation or nothing?
           // User request: "mediante el mismo mapa dando doble clic en algún lugar del mapa para que le muestre un pequeño mensaje de si desea que esa sea la nueva ubicación a mostrar."
           setConfirmPos({ lat, lng });
        }
    };

    const confirmNewLocation = async () => {
        if (!confirmPos) return;
        const newLoc = { ...editForm, latitud: confirmPos.lat, longitud: confirmPos.lng };
        // If we don't have an ID in editForm (because we haven't opened edit yet), we might be creating new?
        // Usually loadData handles `editForm` init with ID if exists.
        
        try {
            const saved = await saveUbicacion(newLoc);
            setLocation(saved);
            setEditForm(saved);
            setConfirmPos(null);
            toast.success("Nueva ubicación establecida");
        } catch (e) {
            toast.error("Error al guardar");
        }
    };

    if (loading || !location) return <div className="h-64 w-full bg-muted animate-pulse rounded-lg"></div>;

    return (
        <div className="w-full relative group z-0">
            <h2 className="text-3xl font-bold text-center mb-8">Nuestra Ubicación</h2>
            
            <div className="relative h-[500px] w-full rounded-xl overflow-hidden shadow-xl border border-gray-200">
                <MapContainer 
                    center={[location.latitud, location.longitud]} 
                    zoom={15} 
                    scrollWheelZoom={false} 
                    style={{ height: "100%", width: "100%" }}
                    doubleClickZoom={false} // Disable default dblclick zoom to handle it ourselves
                >
                    <TileLayer
                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    />
                    <MapUpdater center={[location.latitud, location.longitud]} />
                    <Marker position={[location.latitud, location.longitud]}>
                        <Popup>
                           <strong>{location.nombre}</strong><br/>
                           {location.direccion}
                        </Popup>
                    </Marker>
                    <MapEvents onDoubleClick={handleMapDoubleClick} />
                </MapContainer>

                {/* Admin Edit Button */}
                {isAdmin() && (
                    <div className="absolute top-4 right-4 z-[1000]">
                         <Button onClick={handleOpenEdit} className="bg-background text-foreground hover:bg-muted shadow-lg">
                            <Edit className="mr-2 h-4 w-4"/> Editar Ubicación
                        </Button>
                    </div>
                )}

                {/* Confirm Dialog for Map Double Click (Quick Update) */}
                {confirmPos && (
                    <div className="absolute inset-0 z-[2000] bg-muted flex items-center justify-center">
                        <div className="bg-card text-card-foreground p-6 rounded-lg shadow-2xl max-w-sm text-center">
                            <MapPin className="h-10 w-10 text-destructive mx-auto mb-4" />
                            <h3 className="font-bold text-lg mb-2">¿Cambiar ubicación aquí?</h3>
                            <p className="text-sm text-muted-foreground mb-6">
                                Has seleccionado una nueva posición en el mapa.<br/>
                                Lat: {confirmPos.lat.toFixed(4)}, Lng: {confirmPos.lng.toFixed(4)}
                            </p>
                            <div className="flex gap-4 justify-center">
                                <Button variant="outline" onClick={() => setConfirmPos(null)}>Cancelar</Button>
                                <Button onClick={confirmNewLocation}>Confirmar</Button>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Address and Visit Button */}
            {location && (
                <div className="mt-8 flex flex-col md:flex-row items-center justify-center gap-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
                    
                    <div className="bg-card/80 backdrop-blur-sm px-8 py-5 rounded-2xl shadow-sm border border-border flex items-center gap-4 max-w-2xl">
                         <div className="bg-muted p-3 rounded-full flex-shrink-0">
                            <MapPin className="text-primary h-6 w-6" />
                         </div>
                         <div className="flex flex-col">
                             <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-[0.2em] mb-1">Dirección</span>
                             <p className="text-foreground font-medium text-lg leading-tight">
                                {location.direccion || 'Dirección Principal'}
                             </p>
                         </div>
                    </div>

                    <Button 
                        onClick={() => window.open(`https://www.google.com/maps/search/?api=1&query=${location.latitud},${location.longitud}`, '_blank')}
                        className="bg-primary text-primary-foreground hover:bg-primary/90 px-8 py-4 h-auto rounded-xl text-md font-bold shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all flex items-center gap-2 group/btn"
                    >
                        <span>Cómo llegar</span>
                        <MapPin className="w-4 h-4 group-hover/btn:rotate-12 transition-transform" />
                    </Button>
                </div>
            )}

            {/* Admin Edit Modal */}
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent className="max-w-lg">
                    <DialogHeader>
                        <DialogTitle>Editar Ubicación</DialogTitle>
                    </DialogHeader>
                    
                    <div className="space-y-4 py-4">
                        <div className="grid gap-2">
                            <Label>Nombre del Lugar</Label>
                            <Input 
                                value={editForm.nombre} 
                                onChange={e => setEditForm({...editForm, nombre: e.target.value})} 
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label>Dirección</Label>
                            <Input 
                                value={editForm.direccion || ''} 
                                onChange={e => setEditForm({...editForm, direccion: e.target.value})} 
                            />
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4">
                             <div className="grid gap-2">
                                <Label>Latitud</Label>
                                <Input 
                                    type="number" 
                                    step="any"
                                    value={editForm.latitud} 
                                    onChange={e => setEditForm({...editForm, latitud: parseFloat(e.target.value)})} 
                                />
                            </div>
                             <div className="grid gap-2">
                                <Label>Longitud</Label>
                                <Input 
                                    type="number" 
                                    step="any"
                                    value={editForm.longitud} 
                                    onChange={e => setEditForm({...editForm, longitud: parseFloat(e.target.value)})} 
                                />
                            </div>
                        </div>

                        <div className="border-t pt-4">
                            <Label className="mb-2 block">Importar de Google Maps</Label>
                            <div className="flex gap-2">
                                <Input 
                                    placeholder="Pega el link de Google Maps aquí..."
                                    value={editForm.googleMapsUrl || ''} 
                                    onChange={e => setEditForm({...editForm, googleMapsUrl: e.target.value})} 
                                />
                                <Button variant="secondary" onClick={handleUrlPaste}>
                                    Extraer
                                </Button>
                            </div>
                            <p className="text-xs text-muted-foreground mt-2">
                                * Pega un link de Google Maps y pulsa extraer para obtener Lat/Lng automáticamente. 
                                O haz doble clic en el mapa si este modal está cerrado.
                            </p>
                        </div>
                    </div>

                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancelar</Button>
                        <Button onClick={handleSave}>Guardar Cambios</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
};
