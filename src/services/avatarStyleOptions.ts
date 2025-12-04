/**
 * Avatar Style Options Service
 * Extracts and exposes style-specific options from DiceBear schemas
 */

import * as collection from '@dicebear/collection';
import { schema as coreSchema } from '@dicebear/core';

export interface OptionProperty {
  type: string;
  title?: string;
  description?: string;
  default?: unknown;
  enum?: unknown[];
  minimum?: number;
  maximum?: number;
  items?: {
    type: string;
    enum?: unknown[];
  };
}

export interface StyleOptions {
  [key: string]: OptionProperty;
}

// Map of style keys to their collection modules
const styleModules: Record<string, unknown> = collection;

/**
 * Get available options for a specific style
 */
export const getStyleOptions = (styleKey: string): StyleOptions => {
  try {
    // Convert kebab-case to camelCase
    const camelCaseKey = styleKey.replace(/-([a-z])/g, (g) => g?.[1]?.toUpperCase() ?? '');
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const styleModule = (styleModules as any)[camelCaseKey];

    if (!styleModule || !styleModule.schema || !styleModule.schema.properties) {
      return {};
    }

    // Merge core schema properties with style-specific properties
    const coreProperties = coreSchema.properties || {};
    const styleProperties = styleModule.schema.properties || {};

    // Return only style-specific options (exclude core options like seed, size, etc.)
    const coreKeys = Object.keys(coreProperties);
    const styleSpecificOptions: StyleOptions = {};

    for (const [key, value] of Object.entries(styleProperties)) {
      if (!coreKeys.includes(key)) {
        styleSpecificOptions[key] = value as OptionProperty;
      }
    }

    return styleSpecificOptions;
  } catch (error) {
    console.error(`Failed to get options for style "${styleKey}":`, error);
    return {};
  }
};

/**
 * Get a human-readable label for an option property
 */
export const getOptionLabel = (key: string, property: OptionProperty): string => {
  if (property.title) {
    return property.title;
  }
  // Convert camelCase to Title Case
  return key
    .replace(/([A-Z])/g, ' $1')
    .replace(/^./, (str) => str.toUpperCase())
    .trim();
};

/**
 * Get all available styles with their options
 */
export const getAllStyleOptions = (): Record<string, StyleOptions> => {
  const allOptions: Record<string, StyleOptions> = {};

  const styleKeys = [
    'avataaars',
    'avataaars-neutral',
    'adventurer',
    'adventurer-neutral',
    'big-ears',
    'big-ears-neutral',
    'big-smile',
    'bottts',
    'bottts-neutral',
    'croodles',
    'croodles-neutral',
    'fun-emoji',
    'glass',
    'icons',
    'identicon',
    'initials',
    'lorelei',
    'lorelei-neutral',
    'micah',
    'miniavs',
    'notionists',
    'notionists-neutral',
    'open-peeps',
    'personas',
    'pixel-art',
    'pixel-art-neutral',
    'rings',
    'shapes',
    'thumbs',
  ];

  for (const key of styleKeys) {
    const options = getStyleOptions(key);
    if (Object.keys(options).length > 0) {
      allOptions[key] = options;
    }
  }

  return allOptions;
};
