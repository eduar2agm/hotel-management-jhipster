
import { useEffect, useState } from 'react';
import { HabitacionService } from '../../services';
import { getImageUrl } from '../../utils/imageUtils';
import type { HabitacionDTO } from '../../types/api/Habitacion';
import { RoomInfoModal } from '../modals/RoomInfoModal';
import { Search } from 'lucide-react';

export const ImageCarousel = () => {
    const [rooms, setRooms] = useState<HabitacionDTO[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedRoom, setSelectedRoom] = useState<HabitacionDTO | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    useEffect(() => {
        const loadRooms = async () => {
            try {
                // Fetch rooms
                const res = await HabitacionService.getHabitacions({ page: 0, size: 50 });

                // Keep only rooms with images
                const roomsWithImages = res.data.filter(h => !!h.imagen);

                setRooms(roomsWithImages);
            } catch (error) {
                console.error("Failed to load carousel images", error);
            } finally {
                setLoading(false);
            }
        };
        loadRooms();
    }, []);

    const handleRoomClick = (room: HabitacionDTO) => {
        setSelectedRoom(room);
        setIsModalOpen(true);
    };

    if (loading || rooms.length === 0) return null;

    // Duplicate rooms to create seamless loop
    const displayRooms = [...rooms, ...rooms];

    return (
        <div className="w-full bg-gray-900 border-y border-gray-800 overflow-hidden py-8">
            <style>
                {`
                @keyframes scroll-rtl {
                    0% { transform: translateX(0); }
                    100% { transform: translateX(-50%); }
                }
                .animate-scroll-rooms {
                    animation: scroll-rtl 40s linear infinite;
                }
                .animate-scroll-rooms:hover {
                    animation-play-state: paused;
                }
                `}
            </style>

            <div className="relative w-full max-w-[1920px] mx-auto">
                {/* Gradient Masks for fade effect */}
                <div className="absolute left-0 top-0 bottom-0 w-20 z-10 bg-gradient-to-r from-gray-900 to-transparent pointer-events-none"></div>
                <div className="absolute right-0 top-0 bottom-0 w-20 z-10 bg-gradient-to-l from-gray-900 to-transparent pointer-events-none"></div>

                <div
                    className="flex gap-6 w-max animate-scroll-rooms"
                >
                    {displayRooms.map((room, idx) => (
                        <div
                            key={`${room.id}-${idx}`}
                            onClick={() => handleRoomClick(room)}
                            className="relative w-80 h-50 flex-shrink-0 rounded-lg overflow-hidden border-2 border-gray-700 shadow-xl group hover:border-yellow-500 transition-all cursor-pointer"
                        >
                            <img
                                src={room.imagen ? getImageUrl(room.imagen) : ''}
                                alt={`Habitación ${room.numero}`}
                                className="w-full h-full object-cover grayscale-50 group-hover:grayscale-0 transition-all duration-500 transform group-hover:scale-110"
                            />

                            {/* Overlay with info */}
                            <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 transition-all duration-300 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100">
                                <div className="bg-yellow-500 text-black px-4 py-2 rounded-full font-bold flex items-center gap-2 transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300 shadow-lg">
                                    <Search size={18} />
                                    <span>Ver información</span>
                                </div>
                            </div>

                            {/* Corner Badge for Room Number */}
                            <div className="absolute top-2 left-2 bg-black/60 backdrop-blur-md text-white text-[10px] px-2 py-0.5 rounded border border-white/10 opacity-0 group-hover:opacity-100 transition-opacity">
                                Nº {room.numero}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <RoomInfoModal
                room={selectedRoom}
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
            />
        </div>
    );
};
