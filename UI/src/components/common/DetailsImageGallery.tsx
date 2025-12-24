
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

        if (src) {
            const getFilename = (path: string) => path.split('/').pop()?.split('?')[0] || '';
            const srcFilename = getFilename(decodeURIComponent(src));
            const mainFilename = mainImageSrc ? getFilename(decodeURIComponent(mainImageSrc)) : '';

            // Check for exact match OR filename match (ignoring folder structure differences which often cause duplicates)
            const isDuplicate = mainImageSrc && (
                src === mainImageSrc ||
                decodeURIComponent(src).trim() === decodeURIComponent(mainImageSrc).trim() ||
                (srcFilename && mainFilename && srcFilename === mainFilename)
            );

            if (!isDuplicate) {
                images.push({ id: img.id || `extra-${idx}`, src });
            }
        }
    });

    const [failedImages, setFailedImages] = useState<Set<string>>(new Set());
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isPlaying, setIsPlaying] = useState(autoPlay);

    // Filter out failed images from the display list
    const validImages = images.filter(img => !failedImages.has(img.src));

    // Reset index if validImages shrinks or current index is out of bounds
    useEffect(() => {
        if (currentIndex >= validImages.length && validImages.length > 0) {
            setCurrentIndex(0);
        }
    }, [validImages.length, currentIndex]);

    useEffect(() => {
        let interval: any;
        if (isPlaying && validImages.length > 1) {
            interval = setInterval(() => {
                setCurrentIndex((prev) => (prev + 1) % validImages.length);
            }, autoPlayInterval);
        }
        return () => clearInterval(interval);
    }, [isPlaying, validImages.length, autoPlayInterval]);

    const handleNext = () => {
        if (validImages.length === 0) return;
        setCurrentIndex((prev) => (prev + 1) % validImages.length);
        setIsPlaying(false);
    };

    const handlePrev = () => {
        if (validImages.length === 0) return;
        setCurrentIndex((prev) => (prev - 1 + validImages.length) % validImages.length);
        setIsPlaying(false);
    };

    const handleImageError = (src: string) => {
        console.warn("Image failed to load:", src);
        setFailedImages(prev => {
            const next = new Set(prev);
            next.add(src);
            return next;
        });
        // If the current image failed, try to move to the next one immediately if possible
        if (validImages.length > 1) {
            setCurrentIndex((prev) => (prev + 1) % (validImages.length - 1));
        }
    };

    if (validImages.length === 0) {
        // If we have "images" originally but all failed, maybe show Main anyway with a placeholder or just the empty state?
        // If we really have no images (or all failed), show placeholder.
        return (
            <div className={`flex items-center justify-center bg-muted text-muted-foreground rounded-lg overflow-hidden ${className}`}>
                {/* Only attempt to show the first image if it exists to trigger potential load (and then fail), 
                    but since we filter validImages, we just show placeholder here. */}
                <ImageIcon className="h-12 w-12 opacity-50" />
            </div>
        );
    }

    const currentImage = validImages[currentIndex];

    // Safety check in case render happens before effect resets index
    if (!currentImage) return null;

    return (
        <div
            className={`relative group rounded-lg overflow-hidden bg-black/5 ${className}`}
            onMouseEnter={() => setIsPlaying(false)}
            onMouseLeave={() => setIsPlaying(autoPlay)}
        >
            <img
                key={currentImage.src} // Key helps React remount if src changes
                src={currentImage.src}
                alt="Gallery"
                onError={() => handleImageError(currentImage.src)}
                className="w-full h-full object-cover transition-all duration-500"
            />

            {validImages.length > 1 && (
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
                            {validImages.map((_, idx) => (
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
