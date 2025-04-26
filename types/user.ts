export interface User {
    uid: string;
    email: string;
    displayName?: string;
    photoURL?: string;
    createdAt?: string;
    updatedAt?: string;
    role?: 'user' | 'admin';
    isOnline?: boolean;
    lastSeen?: string;
    aboutMe?: string;
    favoriteArtists?: string[];
    musicGenres?: string[];
    socialLinks?: Record<string, string>;
    preferences?: {
        theme?: 'light' | 'dark';
        notifications?: boolean;
        [key: string]: any;
    };
} 