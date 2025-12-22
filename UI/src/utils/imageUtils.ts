export const getImageUrl = (path: string | null | undefined): string => {
    if (!path) return '';
    if (path.startsWith('http://') || path.startsWith('https://') || path.startsWith('data:')) {
        return path;
    }
    // Prepend /images/ for local paths, ensuring no double slashes, and avoid duplicating "images" if already present
    const cleanPath = path.startsWith('/') ? path.substring(1) : path;

    if (cleanPath.startsWith('images/')) {
        return `/${cleanPath}`;
    }

    return `/images/${cleanPath}`;
};
