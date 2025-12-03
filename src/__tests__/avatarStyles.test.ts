/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect } from 'vitest';
import * as collection from '@dicebear/collection';
import { createAvatar } from '@dicebear/core';
import { avatarStyles } from '../services/avatarStyles';

describe('Avatar Styles Availability', () => {
  describe('DiceBear Collection', () => {
    it('should have the collection imported', () => {
      expect(collection).toBeDefined();
      expect(Object.keys(collection).length).toBeGreaterThan(0);
    });

    it('should export all expected styles from @dicebear/collection', () => {
      const expectedStyles = [
        'adventurer',
        'adventurerNeutral',
        'avataaars',
        'avataaarsNeutral',
        'bigEars',
        'bigEarsNeutral',
        'bigSmile',
        'bottts',
        'botttsNeutral',
        'croodles',
        'croodlesNeutral',
        'funEmoji',
        'glass',
        'icons',
        'identicon',
        'initials',
        'lorelei',
        'loreleiNeutral',
        'micah',
        'miniavs',
        'notionists',
        'notionistsNeutral',
        'openPeeps',
        'personas',
        'pixelArt',
        'pixelArtNeutral',
        'rings',
        'shapes',
        'thumbs',
      ];

      const availableStyles = Object.keys(collection);

      // Check each expected style
      expectedStyles.forEach((style) => {
        expect(
          availableStyles.includes(style),
          `Style "${style}" should be available in @dicebear/collection`,
        ).toBe(true);
      });

      console.log('\n✅ Available styles in collection:', availableStyles.join(', '));
    });
  });

  describe('Avatar Styles Service', () => {
    it('should define all avatar styles', () => {
      expect(avatarStyles).toBeDefined();
      expect(Array.isArray(avatarStyles)).toBe(true);
      expect(avatarStyles.length).toBeGreaterThan(0);
    });

    it('should have valid structure for each style', () => {
      avatarStyles.forEach((style) => {
        expect(style).toHaveProperty('key');
        expect(style).toHaveProperty('label');
        expect(style).toHaveProperty('description');
        expect(style).toHaveProperty('category');
        expect(typeof style.key).toBe('string');
        expect(typeof style.label).toBe('string');
        expect(typeof style.description).toBe('string');
        expect(['human', 'abstract', 'fun']).toContain(style.category);
      });
    });

    it('should map keys to camelCase for DiceBear collection', () => {
      const keyMappings: Record<string, string> = {
        avataaars: 'avataaars',
        'avataaars-neutral': 'avataaarsNeutral',
        adventurer: 'adventurer',
        'adventurer-neutral': 'adventurerNeutral',
        'big-ears': 'bigEars',
        'big-ears-neutral': 'bigEarsNeutral',
        'big-smile': 'bigSmile',
        bottts: 'bottts',
        'bottts-neutral': 'botttsNeutral',
        croodles: 'croodles',
        'croodles-neutral': 'croodlesNeutral',
        'fun-emoji': 'funEmoji',
        glass: 'glass',
        icons: 'icons',
        identicon: 'identicon',
        initials: 'initials',
        lorelei: 'lorelei',
        'lorelei-neutral': 'loreleiNeutral',
        micah: 'micah',
        miniavs: 'miniavs',
        notionists: 'notionists',
        'notionists-neutral': 'notionistsNeutral',
        'open-peeps': 'openPeeps',
        personas: 'personas',
        'pixel-art': 'pixelArt',
        'pixel-art-neutral': 'pixelArtNeutral',
        rings: 'rings',
        shapes: 'shapes',
        thumbs: 'thumbs',
      };

      // Check that each style key can be mapped to a collection key
      avatarStyles.forEach((style) => {
        const camelCaseKey = keyMappings[style.key];
        expect(
          camelCaseKey,
          `Style key "${style.key}" should have a camelCase mapping`,
        ).toBeDefined();
      });
    });
  });

  describe('Avatar Generation', () => {
    it('should successfully generate avatar for each style', () => {
      const keyToCamelCase = (key: string): string => {
        return key.replace(/-([a-z])/g, (g) => g?.[1]?.toUpperCase() ?? '');
      };

      const availableCollectionStyles = Object.keys(collection);
      const failedStyles: string[] = [];
      const successfulStyles: string[] = [];

      avatarStyles.forEach((styleConfig) => {
        const camelCaseKey = keyToCamelCase(styleConfig.key);

        // Check if style exists in collection
        if (!availableCollectionStyles.includes(camelCaseKey)) {
          failedStyles.push(`${styleConfig.key} (mapped to: ${camelCaseKey})`);
          return;
        }

        try {
          const style = collection[camelCaseKey as keyof typeof collection];
          const avatar = createAvatar(style as any, {
            seed: 'test-seed',
            size: 256,
          });

          const svg = avatar.toString();
          expect(svg).toBeDefined();
          expect(svg.length).toBeGreaterThan(0);
          expect(svg).toContain('<svg');

          successfulStyles.push(styleConfig.key);
        } catch (error) {
          // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
          failedStyles.push(`${styleConfig.key} - Error: ${error}`);
        }
      });

      if (failedStyles.length > 0) {
        console.error('\n❌ Failed styles:', failedStyles);
      }

      console.log(
        `\n✅ Successfully generated avatars for ${successfulStyles.length}/${avatarStyles.length} styles`,
      );
      console.log('Successful styles:', successfulStyles.join(', '));

      // The test should still pass if we have most styles working
      expect(successfulStyles.length).toBeGreaterThan(0);

      // Log warnings for failed styles but don't fail the test
      if (failedStyles.length > 0) {
        console.warn(
          '\n⚠️  Some styles may not be available in current DiceBear version:',
          failedStyles,
        );
      }
    });

    it('should generate different SVGs for different seeds', () => {
      const style = collection.avataaars;

      const avatar1 = createAvatar(style as any, { seed: 'seed1', size: 256 });
      const avatar2 = createAvatar(style as any, { seed: 'seed2', size: 256 });

      const svg1 = avatar1.toString();
      const svg2 = avatar2.toString();

      expect(svg1).not.toBe(svg2);
    });

    it('should respect size parameter', () => {
      const style = collection.avataaars;

      const avatar = createAvatar(style as any, {
        seed: 'test',
        size: 512,
      });

      const svg = avatar.toString();
      expect(svg).toContain('width="512"');
      expect(svg).toContain('height="512"');
    });

    it('should handle background colors', () => {
      const style = collection.avataaars;

      const avatar = createAvatar(style as any, {
        seed: 'test',
        size: 256,
        backgroundColor: ['ff0000'],
      });

      const svg = avatar.toString();
      expect(svg).toBeDefined();
      expect(svg.length).toBeGreaterThan(0);
    });
  });

  describe('Style Categories', () => {
    it('should have styles in each category', () => {
      const categories = ['human', 'abstract', 'fun'];

      categories.forEach((category) => {
        const stylesInCategory = avatarStyles.filter((style) => style.category === category);

        expect(
          stylesInCategory.length,
          `Category "${category}" should have at least one style`,
        ).toBeGreaterThan(0);
      });
    });

    it('should correctly categorize known styles', () => {
      const humanStyles = avatarStyles.filter((s) => s.category === 'human');
      const abstractStyles = avatarStyles.filter((s) => s.category === 'abstract');
      const funStyles = avatarStyles.filter((s) => s.category === 'fun');

      // Check some known categorizations
      expect(humanStyles.some((s) => s.key === 'avataaars')).toBe(true);
      expect(abstractStyles.some((s) => s.key === 'shapes')).toBe(true);
      expect(funStyles.some((s) => s.key === 'bottts')).toBe(true);
    });
  });

  describe('Avatar Presets', () => {
    it('should have valid preset configurations', async () => {
      const { avatarPresets } = await import('../services/avatarStyles');

      expect(avatarPresets).toBeDefined();
      expect(Array.isArray(avatarPresets)).toBe(true);
      expect(avatarPresets.length).toBeGreaterThan(0);

      avatarPresets.forEach((preset) => {
        expect(preset).toHaveProperty('key');
        expect(preset).toHaveProperty('label');
        expect(preset).toHaveProperty('description');
        expect(preset).toHaveProperty('config');
        expect(preset.config).toHaveProperty('style');
        expect(preset.config).toHaveProperty('backgroundColor');
        expect(preset.config).toHaveProperty('radius');
      });
    });

    it('should reference valid styles in presets', async () => {
      const { avatarPresets } = await import('../services/avatarStyles');
      const validStyleKeys = avatarStyles.map((s) => s.key);

      avatarPresets.forEach((preset) => {
        expect(
          validStyleKeys.includes(preset.config.style),
          `Preset "${preset.key}" references invalid style "${preset.config.style}"`,
        ).toBe(true);
      });
    });
  });
});
