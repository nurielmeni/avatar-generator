/**
 * Avatar Generator Composable
 * Provides reactive avatar generation using DiceBear
 */

import { ref, computed, watchEffect, toRefs } from 'vue';
import { createAvatar } from '@dicebear/core';
import * as collection from '@dicebear/collection';

export interface AvatarOptions {
  style: string;
  seed: string;
  size: number;
  backgroundColor: string[];
  radius: number;
  scale: number;
  rotate: number;
  translateX: number;
  translateY: number;
  flip: boolean;
}

export const defaultOptions: AvatarOptions = {
  style: 'avataaars',
  seed: 'Felix',
  size: 256,
  backgroundColor: ['transparent'],
  radius: 0,
  scale: 100,
  rotate: 0,
  translateX: 0,
  translateY: 0,
  flip: false,
};

export function useAvatarGenerator(initialOptions?: Partial<AvatarOptions>) {
  // Merge initial options with defaults
  const options = ref<AvatarOptions>({
    ...defaultOptions,
    ...initialOptions,
  });

  const svg = ref<string>('');
  const dataUri = ref<string>('');
  const isGenerating = ref(false);
  const error = ref<string | null>(null);

  // Convert kebab-case to camelCase for DiceBear collection
  const kebabToCamel = (str: string): string => {
    return str.replace(/-([a-z])/g, (g) => g?.[1]?.toUpperCase() ?? '');
  };

  // Generate avatar
  const generate = () => {
    try {
      isGenerating.value = true;
      error.value = null;

      // Convert style key from kebab-case to camelCase
      const camelCaseKey = kebabToCamel(options.value.style);
      const styleKey = camelCaseKey as keyof typeof collection;
      const style = collection[styleKey];

      if (!style) {
        throw new Error(`Style "${options.value.style}" (${camelCaseKey}) not found`);
      }

      // Create avatar with current options
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const avatar = createAvatar(style as any, {
        seed: options.value.seed,
        size: options.value.size,
        backgroundColor: options.value.backgroundColor,
        radius: options.value.radius,
        scale: options.value.scale,
        rotate: options.value.rotate,
        translateX: options.value.translateX,
        translateY: options.value.translateY,
        flip: options.value.flip,
      });

      // Generate SVG
      svg.value = avatar.toString();

      // Generate data URI for download
      dataUri.value = avatar.toDataUri();
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Failed to generate avatar';
      console.error('Avatar generation error:', e);
    } finally {
      isGenerating.value = false;
    }
  };

  // Set a single option
  const setOption = <K extends keyof AvatarOptions>(key: K, value: AvatarOptions[K]) => {
    options.value[key] = value;
  };

  // Set multiple options at once
  const setOptions = (newOptions: Partial<AvatarOptions>) => {
    options.value = {
      ...options.value,
      ...newOptions,
    };
  };

  // Reset to default options
  const reset = () => {
    options.value = { ...defaultOptions };
  };

  // Randomize seed
  const randomize = () => {
    const randomSeed = Math.random().toString(36).substring(2, 15);
    setOption('seed', randomSeed);
  };

  // Download as PNG
  const downloadPNG = async () => {
    try {
      // Create a canvas element
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) throw new Error('Canvas context not available');

      canvas.width = options.value.size;
      canvas.height = options.value.size;

      // Create an image from SVG
      const img = new Image();
      const svgBlob = new Blob([svg.value], { type: 'image/svg+xml;charset=utf-8' });
      const url = URL.createObjectURL(svgBlob);

      await new Promise((resolve, reject) => {
        img.onload = resolve;
        img.onerror = reject;
        img.src = url;
      });

      // Draw image on canvas
      ctx.drawImage(img, 0, 0);

      // Convert to PNG and download
      canvas.toBlob((blob) => {
        if (!blob) return;
        const pngUrl = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.download = `avatar-${options.value.seed}.png`;
        link.href = pngUrl;
        link.click();
        URL.revokeObjectURL(pngUrl);
      }, 'image/png');

      URL.revokeObjectURL(url);
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Failed to download PNG';
      console.error('PNG download error:', e);
    }
  };

  // Download as SVG
  const downloadSVG = () => {
    try {
      const blob = new Blob([svg.value], { type: 'image/svg+xml;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.download = `avatar-${options.value.seed}.svg`;
      link.href = url;
      link.click();
      URL.revokeObjectURL(url);
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Failed to download SVG';
      console.error('SVG download error:', e);
    }
  };

  // Copy SVG to clipboard
  const copySVG = async () => {
    try {
      await navigator.clipboard.writeText(svg.value);
      return true;
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Failed to copy SVG';
      console.error('Copy error:', e);
      return false;
    }
  };

  // Copy data URI to clipboard
  const copyDataUri = async () => {
    try {
      await navigator.clipboard.writeText(dataUri.value);
      return true;
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Failed to copy data URI';
      console.error('Copy error:', e);
      return false;
    }
  };

  // Auto-generate on option changes
  watchEffect(() => {
    // Watch all options
    void JSON.stringify(options.value);
    void generate();
  });

  return {
    // State
    options: toRefs(options.value),
    svg,
    dataUri,
    isGenerating,
    error,

    // Methods
    generate,
    setOption,
    setOptions,
    reset,
    randomize,
    downloadPNG,
    downloadSVG,
    copySVG,
    copyDataUri,

    // Computed
    svgUrl: computed(() => {
      if (!svg.value) return '';
      const blob = new Blob([svg.value], { type: 'image/svg+xml;charset=utf-8' });
      return URL.createObjectURL(blob);
    }),
  };
}
