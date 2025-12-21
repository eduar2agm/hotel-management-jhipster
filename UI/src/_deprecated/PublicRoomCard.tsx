

// import { Button } from '@/components/ui/button';
// import { Card, CardContent } from '@/components/ui/card';
// import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
// import { BedDouble, DollarSign, Image as ImageIcon, Info } from 'lucide-react';
// import { useState } from 'react';
// import { getImageUrl } from '../../utils/imageUtils';

// interface PublicRoomCardProps {
//     titulo: string;
//     precio: number;
//     capacidad: number;
//     imagen: string;
//     descripcion: string;
// }

// export const PublicRoomCard = ({ titulo, precio, capacidad, imagen, descripcion }: PublicRoomCardProps) => {
//     const [isDetailsOpen, setIsDetailsOpen] = useState(false);

//     return (
//         <>
//             <Card className="overflow-hidden hover:shadow-xl transition-all group border-gray-200 h-full flex flex-col">
//                 <div className="relative h-48 w-full bg-gray-200 overflow-hidden">
//                     {imagen ? (
//                         <img
//                             src={getImageUrl(imagen)}
//                             alt={titulo}
//                             className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
//                         />
//                     ) : (
//                         <div className="w-full h-full flex flex-col items-center justify-center text-gray-400 bg-gray-100">
//                             <ImageIcon className="h-12 w-12 mb-2 opacity-50" />
//                             <span className="text-xs font-semibold">Sin Imagen</span>
//                         </div>
//                     )}
//                 </div>

//                 <CardContent className="p-5 flex-1 flex flex-col">
//                     <div className="flex justify-between items-start mb-3">
//                         <div>
//                             <h3 className="font-bold text-lg text-gray-900">{titulo}</h3>
//                             <p className="text-sm text-yellow-600 font-bold flex items-center gap-1">
//                                 <DollarSign className="h-3.5 w-3.5" />
//                                 {precio} / noche
//                             </p>
//                         </div>
//                         <div className="flex items-center text-gray-500 text-xs font-medium bg-gray-100 px-2 py-1 rounded">
//                             <BedDouble className="h-3.5 w-3.5 mr-1" />
//                             {capacidad} pax
//                         </div>
//                     </div>

//                     <p className="text-gray-500 text-sm line-clamp-2 mb-4 h-10">
//                         {descripcion || 'Sin descripción detallada disponible.'}
//                     </p>

//                     <div className="mt-auto pt-4 border-t border-gray-100">
//                         <Button
//                             variant="outline"
//                             className="w-full text-blue-600 border-blue-200 hover:bg-blue-50"
//                             onClick={() => setIsDetailsOpen(true)}
//                         >
//                             Ver Detalles
//                         </Button>
//                     </div>
//                 </CardContent>
//             </Card>

//             <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
//                 <DialogContent className="max-w-md">
//                     <DialogHeader>
//                         <DialogTitle className="text-xl font-bold flex items-center gap-2">
//                             <Info className="h-5 w-5 text-blue-500" />
//                             {titulo}
//                         </DialogTitle>
//                         <DialogDescription>
//                             Información completa de la unidad.
//                         </DialogDescription>
//                     </DialogHeader>
//                     <div className="space-y-4">
//                         <div className="relative h-56 w-full rounded-lg overflow-hidden bg-gray-100">
//                             {imagen ? (
//                                 <img src={getImageUrl(imagen)} alt={`Full ${titulo}`} className="w-full h-full object-cover" />
//                             ) : (
//                                 <div className="flex items-center justify-center h-full text-gray-400">
//                                     <ImageIcon className="h-12 w-12" />
//                                 </div>
//                             )}
//                         </div>
//                         <div className="grid grid-cols-2 gap-4 text-sm">
//                             <div>
//                                 <span className="font-semibold text-gray-500 block">Precio Base</span>
//                                 <span className="text-gray-900 font-bold">${precio}</span>
//                             </div>
//                             <div>
//                                 <span className="font-semibold text-gray-500 block">Capacidad</span>
//                                 <span className="text-gray-900">{capacidad} Personas</span>
//                             </div>
//                         </div>
//                         <div>
//                             <span className="font-semibold text-gray-500 block text-sm mb-1">Descripción</span>
//                             <p className="text-sm text-gray-700 bg-gray-50 p-3 rounded-md border border-gray-100">
//                                 {descripcion || 'No hay descripción disponible para esta habitación.'}
//                             </p>
//                         </div>
//                     </div>
//                 </DialogContent>
//             </Dialog>
//         </>
//     );
// };
