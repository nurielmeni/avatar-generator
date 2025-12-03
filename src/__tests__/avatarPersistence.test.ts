import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import {
  saveConfig,
  loadConfig,
  clearConfig,
  addToFavorites,
  getFavorites,
  removeFromFavorites,
  clearFavorites,
  addToRecent,
  getRecent,
  clearRecent,
  exportData,
  importData,
  getStorageInfo,
} from '../services/avatarPersistence';
import type { AvatarOptions } from '../composables/useAvatarGenerator';

const mockOptions: AvatarOptions = {
  style: 'avataaars',
  seed: 'TestSeed',
  size: 256,
  backgroundColor: ['ff0000'],
  radius: 25,
  scale: 100,
  rotate: 0,
  translateX: 0,
  translateY: 0,
  flip: false,
};

describe('Avatar Persistence Service', () => {
  beforeEach(() => {
    // Clear localStorage before each test
    localStorage.clear();
  });

  afterEach(() => {
    // Clean up after each test
    localStorage.clear();
  });

  describe('Configuration Management', () => {
    it('should save configuration to localStorage', () => {
      const result = saveConfig(mockOptions);

      expect(result).toBe(true);
      const saved = localStorage.getItem('avatar-generator-config');
      expect(saved).toBeTruthy();

      const parsed = JSON.parse(saved!);
      expect(parsed.style).toBe('avataaars');
      expect(parsed.seed).toBe('TestSeed');
    });

    it('should load saved configuration', () => {
      saveConfig(mockOptions);
      const loaded = loadConfig();

      expect(loaded).toBeTruthy();
      expect(loaded?.style).toBe('avataaars');
      expect(loaded?.seed).toBe('TestSeed');
      expect(loaded?.size).toBe(256);
    });

    it('should return null when no config exists', () => {
      const loaded = loadConfig();
      expect(loaded).toBeNull();
    });

    it('should clear saved configuration', () => {
      saveConfig(mockOptions);
      const result = clearConfig();

      expect(result).toBe(true);
      const loaded = loadConfig();
      expect(loaded).toBeNull();
    });
  });

  describe('Favorites Management', () => {
    it('should add avatar to favorites', () => {
      const favorite = addToFavorites('My Favorite', mockOptions, '<svg>test</svg>');

      expect(favorite).toBeTruthy();
      expect(favorite?.name).toBe('My Favorite');
      expect(favorite?.options.style).toBe('avataaars');
      expect(favorite?.svg).toBe('<svg>test</svg>');
      expect(favorite?.id).toBeTruthy();
      expect(favorite?.timestamp).toBeTruthy();
    });

    it('should retrieve all favorites', () => {
      addToFavorites('Favorite 1', mockOptions);
      addToFavorites('Favorite 2', { ...mockOptions, seed: 'Seed2' });

      const favorites = getFavorites();

      expect(favorites).toHaveLength(2);
      expect(favorites?.[0]?.name).toBe('Favorite 1');
      expect(favorites?.[1]?.name).toBe('Favorite 2');
    });

    it('should remove favorite by id', () => {
      const fav1 = addToFavorites('Favorite 1', mockOptions);
      addToFavorites('Favorite 2', mockOptions);

      const result = removeFromFavorites(fav1!.id);

      expect(result).toBe(true);
      const favorites = getFavorites();
      expect(favorites).toHaveLength(1);
      expect(favorites?.[0]?.name).toBe('Favorite 2');
    });

    it('should clear all favorites', () => {
      addToFavorites('Favorite 1', mockOptions);
      addToFavorites('Favorite 2', mockOptions);

      const result = clearFavorites();

      expect(result).toBe(true);
      const favorites = getFavorites();
      expect(favorites).toHaveLength(0);
    });

    it('should return empty array when no favorites exist', () => {
      const favorites = getFavorites();
      expect(favorites).toEqual([]);
    });
  });

  describe('Recent History Management', () => {
    it('should add to recent history', () => {
      const result = addToRecent(mockOptions, '<svg>test</svg>');

      expect(result).toBe(true);
      const recent = getRecent();
      expect(recent).toHaveLength(1);
      expect(recent?.[0]?.options.style).toBe('avataaars');
    });

    it('should limit recent history to 10 items', () => {
      // Add 15 items
      for (let i = 0; i < 15; i++) {
        addToRecent({ ...mockOptions, seed: `Seed${i}` });
      }

      const recent = getRecent();

      expect(recent).toHaveLength(10);
      // Most recent should be first
      expect(recent?.[0]?.options.seed).toBe('Seed14');
    });

    it('should add new items to beginning of recent history', () => {
      addToRecent({ ...mockOptions, seed: 'First' });
      addToRecent({ ...mockOptions, seed: 'Second' });

      const recent = getRecent();

      expect(recent?.[0]?.options.seed).toBe('Second');
      expect(recent?.[1]?.options.seed).toBe('First');
    });

    it('should clear recent history', () => {
      addToRecent(mockOptions);
      addToRecent(mockOptions);

      const result = clearRecent();

      expect(result).toBe(true);
      const recent = getRecent();
      expect(recent).toHaveLength(0);
    });

    it('should return empty array when no recent history exists', () => {
      const recent = getRecent();
      expect(recent).toEqual([]);
    });
  });

  describe('Data Export/Import', () => {
    it('should export all data as JSON', () => {
      saveConfig(mockOptions);
      addToFavorites('Fav', mockOptions);
      addToRecent(mockOptions);

      const exported = exportData();

      expect(exported).toBeTruthy();
      const data = JSON.parse(exported!);

      expect(data.config).toBeTruthy();
      expect(data.favorites).toHaveLength(1);
      expect(data.recent).toHaveLength(1);
      expect(data.exportedAt).toBeTruthy();
    });

    it('should import data from JSON', () => {
      const exportedData = {
        config: mockOptions,
        favorites: [
          {
            id: 'test-id',
            name: 'Test Fav',
            options: mockOptions,
            timestamp: Date.now(),
          },
        ],
        recent: [],
        exportedAt: new Date().toISOString(),
      };

      const result = importData(JSON.stringify(exportedData));

      expect(result).toBe(true);

      const loaded = loadConfig();
      expect(loaded?.style).toBe('avataaars');

      const favorites = getFavorites();
      expect(favorites).toHaveLength(1);
    });

    it('should handle invalid JSON during import', () => {
      const result = importData('invalid json');
      expect(result).toBe(false);
    });

    it('should return null for export when no data exists', () => {
      const exported = exportData();
      expect(exported).toBeTruthy();

      const data = JSON.parse(exported!);
      expect(data.config).toBeNull();
      expect(data.favorites).toEqual([]);
      expect(data.recent).toEqual([]);
    });
  });

  describe('Storage Info', () => {
    it('should calculate storage usage', () => {
      saveConfig(mockOptions);
      addToFavorites('Fav', mockOptions);

      const info = getStorageInfo();

      expect(info).toHaveProperty('used');
      expect(info).toHaveProperty('available');
      expect(info).toHaveProperty('percentage');

      expect(info.used).toBeGreaterThan(0);
      expect(info.available).toBeGreaterThan(0);
      expect(info.percentage).toBeGreaterThanOrEqual(0);
      expect(info.percentage).toBeLessThanOrEqual(100);
    });

    it('should return zero values when storage is empty', () => {
      const info = getStorageInfo();

      expect(info.used).toBeGreaterThanOrEqual(0);
      expect(info.percentage).toBeGreaterThanOrEqual(0);
    });
  });

  describe('Data Integrity', () => {
    it('should maintain data structure after save/load cycle', () => {
      saveConfig(mockOptions);
      const loaded = loadConfig();

      expect(loaded).toEqual(mockOptions);
    });

    it('should preserve SVG content in favorites', () => {
      const svgContent = '<svg width="256" height="256"><circle/></svg>';
      addToFavorites('Test', mockOptions, svgContent);

      const favorites = getFavorites();

      expect(favorites?.[0]?.svg).toBe(svgContent);
    });

    it('should handle avatars without SVG in favorites', () => {
      const favorite = addToFavorites('No SVG', mockOptions);

      expect(favorite).toBeTruthy();
      expect(favorite?.svg).toBeUndefined();
    });

    it('should generate unique IDs for favorites', () => {
      const fav1 = addToFavorites('Fav 1', mockOptions);
      const fav2 = addToFavorites('Fav 2', mockOptions);

      expect(fav1?.id).not.toBe(fav2?.id);
    });

    it('should preserve timestamp order in recent history', () => {
      addToRecent({ ...mockOptions, seed: 'First' });

      // Wait a bit to ensure different timestamps
      const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

      return delay(10).then(() => {
        addToRecent({ ...mockOptions, seed: 'Second' });

        const recent = getRecent();

        expect(recent?.[0]?.timestamp).toBeGreaterThan(recent?.[1]?.timestamp ?? 0);
      });
    });
  });

  describe('Error Handling', () => {
    it('should handle corrupt data gracefully', () => {
      localStorage.setItem('avatar-generator-config', 'invalid json');

      const loaded = loadConfig();
      expect(loaded).toBeNull();
    });

    it('should handle corrupt favorites data', () => {
      localStorage.setItem('avatar-generator-favorites', '{invalid}');

      const favorites = getFavorites();
      expect(favorites).toEqual([]);
    });

    it('should handle corrupt recent data', () => {
      localStorage.setItem('avatar-generator-recent', 'not json');

      const recent = getRecent();
      expect(recent).toEqual([]);
    });
  });
});
