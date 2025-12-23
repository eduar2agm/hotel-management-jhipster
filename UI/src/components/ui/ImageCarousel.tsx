
import { useEffect, useState } from 'react';
import { HabitacionService } from '../../services';
import { getImageUrl } from '../../utils/imageUtils';

export const ImageCarousel = () => {
    const [images, setImages] = useState<string[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadImages = async () => {
            try {
                // Fetch a large number of rooms to discover images
                const res = await HabitacionService.getHabitacions({ page: 0, size: 50 });
                
                // Extract unique valid image URLs
                const uniqueImages = Array.from(new Set(
                    res.data
                        .map(h => h.imagen)
                        .filter((img): img is string => !!img)
                        .map(img => getImageUrl(img))
                ));
                
                setImages(uniqueImages);
            } catch (error) {
                console.error("Failed to load carousel images", error);
            } finally {
                setLoading(false);
            }
        };
        loadImages();
    }, []);

    if (loading || images.length === 0) return null;

    // Duplicate images to create seamless loop
    const displayImages = [...images, ...images];

    return (
        <div className="w-full bg-muted border-y border-border overflow-hidden py-8">
            <style>
                {`
                @keyframes scroll-rtl {
                    0% { transform: translateX(0); }
                    100% { transform: translateX(-50%); }
                }
                .animate-scroll-rooms {
                    animation: scroll-rtl 20s linear infinite;
                }
                .animate-scroll-rooms:hover {
                    animation-play-state: paused;
                }
                `}
            </style>
            
            <div className="relative w-full max-w-[1920px] mx-auto">
                {/* Gradient Masks for fade effect */}
                <div className="absolute left-0 top-0 bottom-0 w-20 z-10 bg-gradient-to-r from-muted to-transparent pointer-events-none"></div>
                <div className="absolute right-0 top-0 bottom-0 w-20 z-10 bg-gradient-to-l from-muted to-transparent pointer-events-none"></div>

                <div 
                    className="flex gap-6 w-max animate-scroll-rooms"
                >
                    {displayImages.map((src, idx) => (
                        <div 
                            key={`${src}-${idx}`} 
                            className="relative w-80 h-50 flex-shrink-0 rounded-lg overflow-hidden border-2 border-border shadow-xl group hover:border-yellow-500 transition-colors"
                        >
                            <img 
                                src={src} 
                                alt="Habitación" 
                                className="w-full h-full object-cover grayscale-50 group-hover:grayscale-0 transition-all duration-400 transform group-hover:scale-110"
                            />
                            <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors"></div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};
