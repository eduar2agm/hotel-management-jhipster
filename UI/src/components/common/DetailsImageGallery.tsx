
import { useState, useEffect } from 'react';
import { Button } from '../ui/button';
import { ChevronLeft, ChevronRight, Image as ImageIcon } from 'lucide-react';
import { getImageUrl } from '../../utils/imageUtils';
import type { ImagenDTO } from '../../types/api/Imagen';

interface DetailsImageGalleryProps {
    mainImage?: string | null;
    extraImages?: ImagenDTO[];
    className?: string;
    autoPlay?: boolean;
    autoPlayInterval?: number;
}

export function DetailsImageGallery({
    mainImage,
    extraImages = [],
    className = "h-64 w-full",
    autoPlay = true,
    autoPlayInterval = 5000
}: DetailsImageGalleryProps) {
    const images = [];

    const mainImageSrc = mainImage ? getImageUrl(mainImage) : null;

    if (mainImageSrc) {
        images.push({ id: 'main', src: mainImageSrc });
    }

    extraImages?.forEach((img, idx) => {
        let src = '';
        if (img.fichero) {
            src = `data:${img.ficheroContentType};base64,${img.fichero}`;
        } else if (img.nombreArchivo) {
            src = getImageUrl(img.nombreArchivo);
        }

        // Add if valid src and not a duplicate of main image
        if (src && src !== mainImageSrc) {
            images.push({ id: img.id || `extra-${idx}`, src });
        }
    });

    const [currentIndex, setCurrentIndex] = useState(0);
    const [isPlaying, setIsPlaying] = useState(autoPlay);

    // Reset index if images array changes or shrinks
    if (currentIndex >= images.length && images.length > 0) {
        setCurrentIndex(0);
    }


    useEffect(() => {
        let interval: any;
        if (isPlaying && images.length > 1) {
            interval = setInterval(() => {
                setCurrentIndex((prev) => (prev + 1) % images.length);
            }, autoPlayInterval);
        }
        return () => clearInterval(interval);
    }, [isPlaying, images.length, autoPlayInterval]);

    const handleNext = () => {
        setCurrentIndex((prev) => (prev + 1) % images.length);
        setIsPlaying(false); // Stop autoplay on interaction
    };

    const handlePrev = () => {
        setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
        setIsPlaying(false); // Stop autoplay on interaction
    };

    if (images.length === 0) {
        return (
            <div className={`flex items-center justify-center bg-muted text-muted-foreground rounded-lg overflow-hidden ${className}`}>
                <ImageIcon className="h-12 w-12 opacity-50" />
            </div>
        );
    }

    return (
        <div
            className={`relative group rounded-lg overflow-hidden bg-black/5 ${className}`}
            onMouseEnter={() => setIsPlaying(false)}
            onMouseLeave={() => setIsPlaying(autoPlay)}
        >
            {images[currentIndex] && (
                <img
                    src={images[currentIndex].src}
                    alt="Gallery"
                    className="w-full h-full object-cover transition-all duration-500"
                />
            )}

            {images.length > 1 && (
                <>
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-60 pointer-events-none" />

                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={handlePrev}
                        className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/30 hover:bg-black/50 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity backdrop-blur-sm"
                    >
                        <ChevronLeft className="h-6 w-6" />
                    </Button>

                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={handleNext}
                        className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/30 hover:bg-black/50 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity backdrop-blur-sm"
                    >
                        <ChevronRight className="h-6 w-6" />
                    </Button>

                    <div className="absolute bottom-3 left-0 right-0 z-10 flex flex-col items-center gap-2">
                        <div className="flex justify-center gap-1.5 px-4 backdrop-blur-sm bg-black/20 p-1.5 rounded-full">
                            {images.map((_, idx) => (
                                <button
                                    key={idx}
                                    onClick={() => { setCurrentIndex(idx); setIsPlaying(false); }}
                                    className={`h-2 rounded-full shadow-sm transition-all duration-300 ${idx === currentIndex ? 'w-6 bg-yellow-400' : 'w-2 bg-white/50 hover:bg-white/80'}`}
                                    aria-label={`Go to slide ${idx + 1}`}
                                />
                            ))}
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}
