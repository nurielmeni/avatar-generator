/**
 * Avatar Persistence Service
 * Handles saving and loading avatar configurations to/from localStorage
 */

import type { AvatarOptions } from '../composables/useAvatarGenerator';

const STORAGE_KEY = 'avatar-generator-config';
const FAVORITES_KEY = 'avatar-generator-favorites';
const RECENT_KEY = 'avatar-generator-recent';

export interface SavedAvatar {
  id: string;
  name: string;
  options: AvatarOptions;
  timestamp: number;
  svg?: string;
}

/**
 * Save current avatar configuration
 */
export const saveConfig = (options: AvatarOptions): boolean => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(options));
    return true;
  } catch (e) {
    console.error('Failed to save config:', e);
    return false;
  }
};

/**
 * Load saved avatar configuration
 */
export const loadConfig = (): AvatarOptions | null => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (!saved) return null;
    return JSON.parse(saved) as AvatarOptions;
  } catch (e) {
    console.error('Failed to load config:', e);
    return null;
  }
};

/**
 * Clear saved configuration
 */
export const clearConfig = (): boolean => {
  try {
    localStorage.removeItem(STORAGE_KEY);
    return true;
  } catch (e) {
    console.error('Failed to clear config:', e);
    return false;
  }
};

/**
 * Save avatar to favorites
 */
export const addToFavorites = (
  name: string,
  options: AvatarOptions,
  svg?: string,
): SavedAvatar | null => {
  try {
    const favorites = getFavorites();
    const newFavorite: SavedAvatar = {
      id: generateId(),
      name,
      options,
      timestamp: Date.now(),
      ...(svg ? { svg } : {}),
    };
    favorites.push(newFavorite);
    localStorage.setItem(FAVORITES_KEY, JSON.stringify(favorites));
    return newFavorite;
  } catch (e) {
    console.error('Failed to add to favorites:', e);
    return null;
  }
};

/**
 * Get all favorite avatars
 */
export const getFavorites = (): SavedAvatar[] => {
  try {
    const saved = localStorage.getItem(FAVORITES_KEY);
    if (!saved) return [];
    return JSON.parse(saved) as SavedAvatar[];
  } catch (e) {
    console.error('Failed to get favorites:', e);
    return [];
  }
};

/**
 * Remove avatar from favorites
 */
export const removeFromFavorites = (id: string): boolean => {
  try {
    const favorites = getFavorites();
    const filtered = favorites.filter((fav) => fav.id !== id);
    localStorage.setItem(FAVORITES_KEY, JSON.stringify(filtered));
    return true;
  } catch (e) {
    console.error('Failed to remove from favorites:', e);
    return false;
  }
};

/**
 * Clear all favorites
 */
export const clearFavorites = (): boolean => {
  try {
    localStorage.removeItem(FAVORITES_KEY);
    return true;
  } catch (e) {
    console.error('Failed to clear favorites:', e);
    return false;
  }
};

/**
 * Add to recent history
 */
export const addToRecent = (options: AvatarOptions, svg?: string): boolean => {
  try {
    const recent = getRecent();
    const newRecent: SavedAvatar = {
      id: generateId(),
      name: `${options.style}-${options.seed}`,
      options,
      timestamp: Date.now(),
      ...(svg ? { svg } : {}),
    };

    // Keep only last 10 recent items
    recent.unshift(newRecent);
    const trimmed = recent.slice(0, 10);

    localStorage.setItem(RECENT_KEY, JSON.stringify(trimmed));
    return true;
  } catch (e) {
    console.error('Failed to add to recent:', e);
    return false;
  }
};

/**
 * Get recent avatar history
 */
export const getRecent = (): SavedAvatar[] => {
  try {
    const saved = localStorage.getItem(RECENT_KEY);
    if (!saved) return [];
    return JSON.parse(saved) as SavedAvatar[];
  } catch (e) {
    console.error('Failed to get recent:', e);
    return [];
  }
};

/**
 * Clear recent history
 */
export const clearRecent = (): boolean => {
  try {
    localStorage.removeItem(RECENT_KEY);
    return true;
  } catch (e) {
    console.error('Failed to clear recent:', e);
    return false;
  }
};

/**
 * Export all data as JSON
 */
export const exportData = (): string | null => {
  try {
    const data = {
      config: loadConfig(),
      favorites: getFavorites(),
      recent: getRecent(),
      exportedAt: new Date().toISOString(),
    };
    return JSON.stringify(data, null, 2);
  } catch (e) {
    console.error('Failed to export data:', e);
    return null;
  }
};

/**
 * Import data from JSON
 */
export const importData = (jsonData: string): boolean => {
  try {
    const data = JSON.parse(jsonData);

    if (data.config) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data.config));
    }
    if (data.favorites) {
      localStorage.setItem(FAVORITES_KEY, JSON.stringify(data.favorites));
    }
    if (data.recent) {
      localStorage.setItem(RECENT_KEY, JSON.stringify(data.recent));
    }

    return true;
  } catch (e) {
    console.error('Failed to import data:', e);
    return false;
  }
};

/**
 * Generate unique ID
 */
const generateId = (): string => {
  return `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
};

/**
 * Get storage usage info
 */
export const getStorageInfo = (): {
  used: number;
  available: number;
  percentage: number;
} => {
  try {
    let used = 0;

    // Calculate used storage
    for (const key in localStorage) {
      if (Object.prototype.hasOwnProperty.call(localStorage, key)) {
        used += localStorage[key].length + key.length;
      }
    }

    // localStorage typically has 5-10MB limit, we'll use 5MB as conservative estimate
    const available = 5 * 1024 * 1024; // 5MB in bytes
    const percentage = (used / available) * 100;

    return {
      used,
      available,
      percentage: Math.min(percentage, 100),
    };
  } catch (e) {
    console.error('Failed to get storage info:', e);
    return { used: 0, available: 0, percentage: 0 };
  }
};
