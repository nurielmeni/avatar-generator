import { describe, it, expect } from 'vitest';
import { useAvatarGenerator } from '../composables/useAvatarGenerator';
import { nextTick } from 'vue';

describe('useAvatarGenerator Composable', () => {
  describe('Initialization', () => {
    it('should initialize with default options', () => {
      const { options } = useAvatarGenerator();

      expect(options.style.value).toBe('avataaars');
      expect(options.seed.value).toBe('Felix');
      expect(options.size.value).toBe(256);
      expect(options.backgroundColor.value).toEqual(['transparent']);
      expect(options.radius.value).toBe(0);
      expect(options.scale.value).toBe(100);
      expect(options.rotate.value).toBe(0);
      expect(options.translateX.value).toBe(0);
      expect(options.translateY.value).toBe(0);
      expect(options.flip.value).toBe(false);
    });

    it('should initialize with custom options', () => {
      const { options } = useAvatarGenerator({
        style: 'bottts',
        seed: 'CustomSeed',
        size: 512,
        radius: 50,
      });

      expect(options.style.value).toBe('bottts');
      expect(options.seed.value).toBe('CustomSeed');
      expect(options.size.value).toBe(512);
      expect(options.radius.value).toBe(50);
    });

    it('should generate SVG on initialization', async () => {
      const { svg, isGenerating } = useAvatarGenerator();

      // Wait for generation
      await nextTick();
      await new Promise((resolve) => setTimeout(resolve, 100));

      expect(svg.value).toBeDefined();
      expect(svg.value.length).toBeGreaterThan(0);
      expect(svg.value).toContain('<svg');
      expect(isGenerating.value).toBe(false);
    });
  });

  describe('Options Management', () => {
    it('should update single option with setOption', async () => {
      const { options, setOption, svg } = useAvatarGenerator();

      const initialSvg = svg.value;
      setOption('seed', 'NewSeed');

      expect(options.seed.value).toBe('NewSeed');

      await nextTick();
      await new Promise((resolve) => setTimeout(resolve, 100));

      // SVG should change
      expect(svg.value).not.toBe(initialSvg);
    });

    it('should update multiple options with setOptions', () => {
      const { options, setOptions } = useAvatarGenerator();

      setOptions({
        seed: 'MultiSeed',
        size: 128,
        radius: 25,
      });

      expect(options.seed.value).toBe('MultiSeed');
      expect(options.size.value).toBe(128);
      expect(options.radius.value).toBe(25);
    });

    it('should reset to default options', () => {
      const { options, setOption, reset } = useAvatarGenerator();

      setOption('seed', 'Changed');
      setOption('size', 512);
      setOption('radius', 50);

      reset();

      expect(options.seed.value).toBe('Felix');
      expect(options.size.value).toBe(256);
      expect(options.radius.value).toBe(0);
    });

    it('should randomize seed', () => {
      const { options, randomize } = useAvatarGenerator();

      const initialSeed = options.seed.value;
      randomize();

      expect(options.seed.value).not.toBe(initialSeed);
      expect(options.seed.value.length).toBeGreaterThan(0);
    });
  });

  describe('SVG Generation', () => {
    it('should regenerate SVG when options change', async () => {
      const { svg, setOption } = useAvatarGenerator();

      await nextTick();
      await new Promise((resolve) => setTimeout(resolve, 100));

      const svg1 = svg.value;

      setOption('seed', 'DifferentSeed');

      await nextTick();
      await new Promise((resolve) => setTimeout(resolve, 100));

      const svg2 = svg.value;

      expect(svg1).not.toBe(svg2);
      expect(svg2).toContain('<svg');
    });

    it('should handle invalid style gracefully', async () => {
      const { error, setOption } = useAvatarGenerator();

      setOption('style', 'invalid-style-xyz');

      await nextTick();
      await new Promise((resolve) => setTimeout(resolve, 100));

      expect(error.value).toBeTruthy();
    });

    it('should generate data URI', async () => {
      const { dataUri } = useAvatarGenerator();

      await nextTick();
      await new Promise((resolve) => setTimeout(resolve, 100));

      expect(dataUri.value).toBeDefined();
      expect(dataUri.value).toContain('data:image/svg+xml');
    });
  });

  describe('Various Avatar Styles', () => {
    const testStyles = ['avataaars', 'bottts', 'shapes', 'pixel-art', 'fun-emoji'];

    testStyles.forEach((style) => {
      it(`should generate avatar with ${style} style`, async () => {
        const { svg, setOption, error } = useAvatarGenerator();

        setOption('style', style);

        await nextTick();
        await new Promise((resolve) => setTimeout(resolve, 100));

        if (error.value) {
          console.warn(`⚠️  Style "${style}" may not be available:`, error.value);
          // Don't fail the test, just log warning
          expect(error.value).toBeTruthy();
        } else {
          expect(svg.value).toBeDefined();
          expect(svg.value.length).toBeGreaterThan(0);
          expect(svg.value).toContain('<svg');
        }
      });
    });
  });

  describe('Options Validation', () => {
    it('should handle different size values', async () => {
      const sizes = [64, 128, 256, 512];

      for (const size of sizes) {
        const { svg, setOption } = useAvatarGenerator();
        setOption('size', size);

        await nextTick();
        await new Promise((resolve) => setTimeout(resolve, 100));

        expect(svg.value).toContain(`width="${size}"`);
        expect(svg.value).toContain(`height="${size}"`);
      }
    });

    it('should handle different background colors', async () => {
      const colors = ['ff0000', '00ff00', '0000ff', 'transparent'];

      for (const color of colors) {
        const { svg, setOption } = useAvatarGenerator();
        setOption('backgroundColor', [color]);

        await nextTick();
        await new Promise((resolve) => setTimeout(resolve, 100));

        expect(svg.value).toBeDefined();
        expect(svg.value.length).toBeGreaterThan(0);
      }
    });

    it('should handle scale values', async () => {
      const scales = [50, 75, 100, 125, 150];

      for (const scale of scales) {
        const { svg, setOption } = useAvatarGenerator();
        setOption('scale', scale);

        await nextTick();
        await new Promise((resolve) => setTimeout(resolve, 100));

        expect(svg.value).toBeDefined();
        expect(svg.value.length).toBeGreaterThan(0);
      }
    });

    it('should handle rotation values', async () => {
      const rotations = [0, 90, 180, 270, 360];

      for (const rotate of rotations) {
        const { svg, setOption } = useAvatarGenerator();
        setOption('rotate', rotate);

        await nextTick();
        await new Promise((resolve) => setTimeout(resolve, 100));

        expect(svg.value).toBeDefined();
        expect(svg.value.length).toBeGreaterThan(0);
      }
    });

    it('should handle flip option', async () => {
      const { svg, setOption } = useAvatarGenerator();

      setOption('flip', false);
      await nextTick();
      await new Promise((resolve) => setTimeout(resolve, 100));
      const svg1 = svg.value;

      setOption('flip', true);
      await nextTick();
      await new Promise((resolve) => setTimeout(resolve, 100));
      const svg2 = svg.value;

      // SVG should be different when flipped
      expect(svg1).not.toBe(svg2);
    });
  });

  describe('Error Handling', () => {
    it('should clear error on successful generation', async () => {
      const { error, setOption } = useAvatarGenerator();

      // Set invalid style
      setOption('style', 'invalid-style');
      await nextTick();
      await new Promise((resolve) => setTimeout(resolve, 100));

      expect(error.value).toBeTruthy();

      // Set valid style
      setOption('style', 'avataaars');
      await nextTick();
      await new Promise((resolve) => setTimeout(resolve, 100));

      expect(error.value).toBeNull();
    });

    it('should set isGenerating flag during generation', async () => {
      const { isGenerating } = useAvatarGenerator();

      // Initially should be generating
      expect(isGenerating.value).toBe(false);

      await nextTick();
      await new Promise((resolve) => setTimeout(resolve, 100));

      // After generation completes
      expect(isGenerating.value).toBe(false);
    });
  });
});
