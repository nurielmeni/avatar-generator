/**
 * Avatar Editor Store
 * Manages avatar style selection, options, and combinations
 */

import { defineStore } from 'pinia';
import { ref, computed, watch } from 'vue';
import { useLocalStorage } from '@vueuse/core';
import * as collection from '@dicebear/collection';
import { createAvatar } from '@dicebear/core';
import {
  parseSchemaOptions,
  generateRandomOptions,
  type StyleOptions,
} from 'src/services/avatarSchemaParser';
import {
  generateAvatarCombinations,
  type AvatarCombinations,
} from 'src/services/avatarCombinations';

// Available styles with their schemas
const availableStyles = {
  adventurer: collection.adventurer,
  adventurerNeutral: collection.adventurerNeutral,
  avataaars: collection.avataaars,
  avataaarsNeutral: collection.avataaarsNeutral,
  bigEars: collection.bigEars,
  bigEarsNeutral: collection.bigEarsNeutral,
  bigSmile: collection.bigSmile,
  bottts: collection.bottts,
  botttsNeutral: collection.botttsNeutral,
  croodles: collection.croodles,
  croodlesNeutral: collection.croodlesNeutral,
  dylan: collection.dylan,
  funEmoji: collection.funEmoji,
  lorelei: collection.lorelei,
  loreleiNeutral: collection.loreleiNeutral,
  micah: collection.micah,
  miniavs: collection.miniavs,
  notionists: collection.notionists,
  notionistsNeutral: collection.notionistsNeutral,
  openPeeps: collection.openPeeps,
  personas: collection.personas,
  pixelArt: collection.pixelArt,
  pixelArtNeutral: collection.pixelArtNeutral,
};

type StyleName = keyof typeof availableStyles;

// Parsed style options cache
const styleOptionsCache: Record<string, StyleOptions> = {};

function getStyleOptions(styleName: StyleName): StyleOptions {
  if (!styleOptionsCache[styleName]) {
    const style = availableStyles[styleName];
    styleOptionsCache[styleName] = parseSchemaOptions(style.schema ?? {});
  }
  return styleOptionsCache[styleName];
}

/**
 * Convert plain option map to DiceBear format (arrays + probabilities).
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

    converted[key] = styleOption.isArray ? (value ? [value] : []) : value;

    if (styleOption.hasProbability) {
      converted[`${key}Probability`] = value ? 100 : 0;
    }
  }

  return converted;
}

// Initialize options for all styles
const initialOptions: Record<string, Record<string, string>> = {};
try {
  for (const styleName in availableStyles) {
    const styleOptions = getStyleOptions(styleName as StyleName);
    console.log(`[${styleName}] Available options:`, Object.keys(styleOptions));
    initialOptions[styleName] = generateRandomOptions(styleOptions);
  }
} catch (e) {
  console.error('Failed to initialize avatar options:', e);
  // Fallback to just avataaars
  const styleOptions = getStyleOptions('avataaars');
  initialOptions['avataaars'] = generateRandomOptions(styleOptions);
}

export const useAvatarStore = defineStore('avatar', () => {
  // Selected style name
  const selectedStyleName = useLocalStorage<StyleName>('avatar_editor_style', 'avataaars');

  // All style options (persisted)
  const allStyleOptions = useLocalStorage<Record<string, Record<string, string>>>(
    'avatar_editor_options_v2',
    initialOptions,
  );

  // Current tab index
  const selectedTab = ref('0');

  // Current style's options
  const currentStyleOptions = computed({
    get: () => allStyleOptions.value[selectedStyleName.value] || {},
    set: (value) => {
      allStyleOptions.value[selectedStyleName.value] = value;
    },
  });

  // Current style definition
  const currentStyle = computed(() => availableStyles[selectedStyleName.value]);

  // Current style parsed options (schema)
  const currentStyleSchema = computed(() => getStyleOptions(selectedStyleName.value));

  // Current avatar preview
  const currentAvatar = computed(() => {
    const converted = convertOptionsForDiceBear(
      currentStyleOptions.value,
      currentStyleSchema.value,
    );
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return createAvatar(currentStyle.value as any, converted);
  });

  // Available style combinations for grid
  const styleCombinations = computed(() => {
    const result: Record<
      string,
      Array<{ active: boolean; avatar: unknown; options: Record<string, string> }>
    > = {};

    for (const styleName in availableStyles) {
      const styleKey = styleName as StyleName;
      const style = availableStyles[styleKey];
      const options = allStyleOptions.value[styleName] || {};
      const styleOptions = getStyleOptions(styleKey);
      const convertedOptions = convertOptionsForDiceBear(options, styleOptions);

      result[styleName] = [
        {
          active: selectedStyleName.value === styleName,
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          avatar: createAvatar(style as any, convertedOptions),
          options,
        },
      ];
    }

    return result;
  });

  // Current style option combinations
  const optionCombinations = computed((): AvatarCombinations => {
    return generateAvatarCombinations(
      currentStyle.value,
      currentStyleSchema.value,
      currentStyleOptions.value,
    );
  });

  // Actions
  function changeStyle(styleName: StyleName) {
    selectedStyleName.value = styleName;
    selectedTab.value = '0';
  }

  function updateOptions(options: Record<string, string>) {
    currentStyleOptions.value = options;
  }

  function randomize() {
    currentStyleOptions.value = generateRandomOptions(currentStyleSchema.value);
  }

  // Scroll to top when tab changes
  watch(selectedTab, () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });

  return {
    // State
    selectedStyleName,
    selectedTab,
    currentStyleOptions,
    currentStyle,
    currentStyleSchema,
    currentAvatar,
    styleCombinations,
    optionCombinations,
    availableStyles: computed(() => availableStyles),

    // Actions
    changeStyle,
    updateOptions,
    randomize,
  };
});
