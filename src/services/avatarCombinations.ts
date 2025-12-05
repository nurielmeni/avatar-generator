/**
 * Avatar Combinations Generator
 * Creates all possible option variations for grid display
 */

import { createAvatar } from '@dicebear/core';
import type { Style } from '@dicebear/core';
import type { StyleOptions } from './avatarSchemaParser';

export interface AvatarCombination {
  active: boolean;
  isCustomColor?: boolean;
  options: Record<string, string>;
  avatar: {
    toString: () => string;
    toDataUri: () => string;
  };
}

export type AvatarCombinations = Record<string, AvatarCombination[]>;

/**
 * Convert plain option map to the format DiceBear expects.
 * Handles array-typed fields and probability flags.
 */
function convertOptionsForDiceBear(
  options: Record<string, string>,
  styleOptions: StyleOptions,
): Record<string, unknown> {
  const converted: Record<string, unknown> = {};

  for (const [key, value] of Object.entries(options)) {
    const styleOption = styleOptions[key];

    if (!styleOption) {
      converted[key] = value;
      continue;
    }

    // DiceBear array fields expect an array, otherwise a string value
    converted[key] = styleOption.isArray ? (value ? [value] : []) : value;

    // When probability is supported, pass an explicit probability flag
    if (styleOption.hasProbability) {
      converted[`${key}Probability`] = value ? 100 : 0;
    }
  }

  return converted;
}

/**
 * Generate avatar combinations for all options
 */
export function generateAvatarCombinations(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  style: Style<any>,
  styleOptions: StyleOptions,
  selectedOptions: Record<string, string>,
): AvatarCombinations {
  const combinations: AvatarCombinations = {};

  for (const key in styleOptions) {
    if (!Object.prototype.hasOwnProperty.call(styleOptions, key)) {
      continue;
    }

    combinations[key] = [];

    const styleOption = styleOptions[key];
    if (!styleOption) continue;

    // Debug log
    if (key === 'accessories' || key === 'facialHair') {
      console.log(`[generateAvatarCombinations] ${key}:`, {
        values: styleOption.values,
        hasProbability: styleOption.hasProbability,
      });
    }

    const currentValue = selectedOptions[key];

    let activeItem: AvatarCombination | null = null;

    for (const value of styleOption.values) {
      const options = {
        ...selectedOptions,
        [key]: value,
      };

      const avatar = createAvatar(style, convertOptionsForDiceBear(options, styleOptions));
      const active = currentValue === value;

      const item: AvatarCombination = {
        active,
        avatar,
        options,
      };

      if (item.active) {
        activeItem = item;
      }

      combinations[key].push(item);
    }

    // Add custom color option for color fields
    if (styleOption.isColor) {
      const options = {
        ...selectedOptions,
        [key]: currentValue || '',
      };

      combinations[key].unshift({
        active: !activeItem,
        isCustomColor: true,
        avatar: createAvatar(style, convertOptionsForDiceBear(options, styleOptions)),
        options,
      });
    }
  }

  return combinations;
}
