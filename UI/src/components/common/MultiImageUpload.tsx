
import { useState, useRef } from 'react';
import type { ImagenDTO } from '../../types/api/Imagen';
import { ImagenService } from '../../services/imagen.service';
import { Button } from '../ui/button';
import { Card, CardContent } from '../ui/card';
import { Upload, Trash, Image as ImageIcon } from 'lucide-react';
import { getImageUrl } from '../../utils/imageUtils';

interface MultiImageUploadProps {
    parentId: number | undefined;
    parentType: 'habitacion' | 'servicio';
    images: ImagenDTO[] | null | undefined;
    onUpdate: () => void;
}

export function MultiImageUpload({ parentId, parentType, images, onUpdate }: MultiImageUploadProps) {
    const [uploading, setUploading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const files = event.target.files;
        if (!files || files.length === 0 || !parentId) return;

        setUploading(true);
        try {
            for (let i = 0; i < files.length; i++) {
                const file = files[i];
                const base64 = await toBase64(file);

                // Construct DTO
                const newImage: any = {
                    nombre: file.name,
                    fichero: base64,
                    ficheroContentType: file.type,
                    activo: true,
                };

                if (parentType === 'habitacion') {
                    newImage.habitacion = { id: parentId };
                } else {
                    newImage.servicio = { id: parentId };
                }

                await ImagenService.createImagen(newImage);
            }
            onUpdate();
        } catch (error) {
            console.error('Error uploading images', error);
            alert('Error al subir imágenes. Verifique que no excedan el tamaño permitido.');
        } finally {
            setUploading(false);
            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }
        }
    };

    const handleDelete = async (imageId: number) => {
        if (!window.confirm('¿Estás seguro de eliminar esta imagen?')) return;
        try {
            await ImagenService.deleteImagen(imageId);
            onUpdate();
        } catch (error) {
            console.error('Error deleting image', error);
            alert('Error al eliminar la imagen.');
        }
    };

    const toBase64 = (file: File): Promise<string> => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = () => {
                const result = reader.result as string;
                // Remove functionality prefix data:image/png;base64,
                const parts = result.split(',');
                resolve(parts.length > 1 ? parts[1] : parts[0]);
            };
            reader.onerror = error => reject(error);
        });
    };

    if (!parentId) {
        return <div className="text-sm text-gray-500">Guarda primero para subir imágenes adicionales.</div>;
    }

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">Galería de Imágenes</h3>
                <div className="flex gap-2">
                    <input
                        type="file"
                        multiple
                        accept="image/*"
                        className="hidden"
                        ref={fileInputRef}
                        onChange={handleFileSelect}
                    />
                    <Button
                        type="button"
                        variant="outline"
                        onClick={() => fileInputRef.current?.click()}
                        disabled={uploading}
                    >
                        <Upload className="mr-2 h-4 w-4" />
                        {uploading ? 'Subiendo...' : 'Agregar Imágenes'}
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {images && images.map((img) => (
                    <Card key={img.id} className="relative group overflow-hidden">
                        <CardContent className="p-0 aspect-square relative">
                            {img.fichero ? (
                                <img
                                    src={`data:${img.ficheroContentType};base64,${img.fichero}`}
                                    alt={img.nombre}
                                    className="w-full h-full object-cover"
                                />
                            ) : img.nombreArchivo ? (
                                // Fallback if hosted externally or purely path based (future proofing)
                                <img
                                    src={getImageUrl(img.nombreArchivo)}
                                    alt={img.nombre}
                                    className="w-full h-full object-cover"
                                    onError={(e) => {
                                        // fallback
                                        (e.target as HTMLImageElement).src = '/placeholder.png';
                                    }}
                                />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center bg-gray-100">
                                    <ImageIcon className="h-8 w-8 text-gray-400" />
                                </div>
                            )}

                            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                <Button
                                    type="button"
                                    variant="destructive"
                                    size="icon"
                                    onClick={() => img.id && handleDelete(img.id)}
                                >
                                    <Trash className="h-4 w-4" />
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                ))}
                {(!images || images.length === 0) && (
                    <div className="col-span-full text-center py-8 text-gray-500 border-2 border-dashed rounded-lg">
                        No hay imágenes adicionales.
                    </div>
                )}
            </div>
        </div>
    );
}
