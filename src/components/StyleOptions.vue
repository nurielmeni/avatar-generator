<template>
  <q-card flat bordered class="q-mb-md">
    <q-card-section>
      <div class="text-subtitle2 q-mb-sm">
        <q-icon name="settings" class="q-mr-xs" />
        Style-Specific Options
      </div>
    </q-card-section>

    <q-separator v-if="Object.keys(styleOptions).length > 0" />

    <q-card-section v-if="Object.keys(styleOptions).length > 0">
      <div v-for="(property, key) in styleOptions" :key="key" class="q-mb-md">
        <!-- Text/String Input -->
        <q-input
          v-if="property.type === 'string' && !property.enum"
          :model-value="
            String(modelValue[key as keyof StyleOptionValues] || property.default || '')
          "
          :label="getOptionLabel(key, property)"
          outlined
          dense
          :hint="property.description"
          @update:model-value="handleOptionChange(key, $event)"
        />

        <!-- Select for Array with Enum items -->
        <q-select
          v-if="property.type === 'array' && property.items?.enum"
          :model-value="
            Array.isArray(modelValue[key as keyof StyleOptionValues]) &&
            (modelValue[key as keyof StyleOptionValues] as unknown[]).length > 0
              ? (modelValue[key as keyof StyleOptionValues] as unknown[])[0]
              : property.default && Array.isArray(property.default) && property.default.length > 0
                ? property.default[0]
                : property.items.enum[0]
          "
          :options="property.items.enum"
          :label="getOptionLabel(key, property)"
          outlined
          dense
          emit-value
          map-options
          :hint="
            isClothingGraphicDisabled(key)
              ? 'Only works with Graphic Shirt clothing'
              : property.description
          "
          :disable="isClothingGraphicDisabled(key)"
          @update:model-value="handleArrayEnumChange(key, $event)"
        >
          <template v-slot:option="scope">
            <q-item v-bind="scope.itemProps">
              <q-item-section>
                <q-item-label>{{ formatEnumValue(scope.opt) }}</q-item-label>
              </q-item-section>
            </q-item>
          </template>
        </q-select>

        <!-- Select (Enum) -->
        <q-select
          v-else-if="property.type === 'string' && property.enum"
          :model-value="modelValue[key as keyof StyleOptionValues] || property.default"
          :options="property.enum"
          :label="getOptionLabel(key, property)"
          outlined
          dense
          emit-value
          map-options
          :hint="property.description"
          @update:model-value="handleOptionChange(key, $event)"
        >
          <template v-slot:option="scope">
            <q-item v-bind="scope.itemProps">
              <q-item-section>
                <q-item-label>{{ formatEnumValue(scope.opt) }}</q-item-label>
              </q-item-section>
            </q-item>
          </template>
        </q-select>

        <!-- Number Input (Slider) -->
        <div v-else-if="property.type === 'number'" class="q-mb-md">
          <div class="text-caption q-mb-xs">
            {{ getOptionLabel(key, property) }}:
            <strong>{{
              modelValue[key as keyof StyleOptionValues] || property.default || 0
            }}</strong>
          </div>
          <q-slider
            :model-value="
              (modelValue[key as keyof StyleOptionValues] as number) ||
              (property.default as number) ||
              0
            "
            :min="property.minimum || 0"
            :max="property.maximum || 100"
            :step="1"
            label
            @update:model-value="handleOptionChange(key, $event)"
          />
          <div v-if="property.description" class="text-caption text-grey-7 q-mt-xs">
            {{ property.description }}
          </div>
        </div>

        <!-- Boolean Toggle -->
        <q-toggle
          v-else-if="property.type === 'boolean'"
          :model-value="
            (modelValue[key as keyof StyleOptionValues] as boolean) ||
            (property.default as boolean) ||
            false
          "
          :label="getOptionLabel(key, property)"
          @update:model-value="handleOptionChange(key, $event)"
        />

        <!-- Array Input (for colors or similar) -->
        <div v-else-if="property.type === 'array' && isColorField(key, property)">
          <div class="text-caption q-mb-xs">{{ getOptionLabel(key, property) }}</div>
          <div v-if="property.description" class="text-caption text-grey-7 q-mb-xs">
            {{ property.description }}
          </div>
          <color-picker
            :model-value="getColorValue(modelValue[key as keyof StyleOptionValues], 0)"
            :label="`Color ${1}`"
            @update:model-value="handleColorChange(key, $event, 0)"
          />
        </div>

        <!-- Array Input (non-color arrays) -->
        <q-input
          v-else-if="property.type === 'array'"
          :model-value="formatArrayValue(modelValue[key as keyof StyleOptionValues])"
          :label="getOptionLabel(key, property)"
          outlined
          dense
          placeholder="Comma-separated values"
          :hint="property.description || 'Enter values separated by commas'"
          @update:model-value="(v) => v && handleArrayChange(String(key) as string, v as string)"
        />
      </div>
    </q-card-section>

    <q-card-section v-else class="text-center text-grey-6">
      <q-icon name="info" size="md" class="q-mr-sm" />
      <span class="text-caption">No additional options available for this style</span>
    </q-card-section>
  </q-card>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import {
  getStyleOptions,
  getOptionLabel as getOptionLabelFn,
  type OptionProperty,
  type StyleOptions,
} from '../services/avatarStyleOptions';
import ColorPicker from './ColorPicker.vue';

interface StyleOptionValues {
  [key: string]: unknown;
}

interface Props {
  selectedStyle: string;
  modelValue: StyleOptionValues;
}

const props = withDefaults(defineProps<Props>(), {
  selectedStyle: 'avataaars',
  modelValue: () => ({}),
});

const emit = defineEmits<{
  'update:modelValue': [value: StyleOptionValues];
}>();

// Get style-specific options
const styleOptions = computed<StyleOptions>(() => {
  return getStyleOptions(props.selectedStyle);
});

// Handlers
const handleOptionChange = (key: string | number, value: unknown) => {
  emit('update:modelValue', {
    ...props.modelValue,
    [String(key)]: value,
  });
};

const handleArrayEnumChange = (key: string | number, value: unknown) => {
  // For array enum types, wrap the single selected value in an array
  const updatedValue = {
    ...props.modelValue,
    [String(key)]: [value],
  };

  // If changing clothing to non-graphicShirt, clear clothingGraphic
  if (String(key) === 'clothing' && value !== 'graphicShirt' && props.modelValue.clothingGraphic) {
    updatedValue.clothingGraphic = undefined;
  }

  emit('update:modelValue', updatedValue);
};

const handleArrayChange = (key: string | null, value: string | null) => {
  if (!key || !value) return;
  const arrayValue = value
    .split(',')
    .map((v) => v.trim())
    .filter((v) => v.length > 0);

  emit('update:modelValue', {
    ...props.modelValue,
    [key]: arrayValue.length > 0 ? arrayValue : undefined,
  });
};

// Check if a field is a color field based on naming patterns
const isColorField = (key: string | number, property: OptionProperty): boolean => {
  const keyStr = String(key).toLowerCase();
  // Check if it's a color field by name
  const isColorName = keyStr.includes('color') || keyStr.includes('colour');

  return isColorName && property.type === 'array';
};

// Check if clothingGraphic should be disabled (only works with graphicShirt)
const isClothingGraphicDisabled = (key: string | number): boolean => {
  if (String(key) !== 'clothingGraphic') return false;

  const clothing = props.modelValue.clothing;
  // Disabled if clothing is set to something other than graphicShirt
  if (Array.isArray(clothing) && clothing.length > 0) {
    return clothing[0] !== 'graphicShirt';
  }
  // Also disabled if clothing is explicitly set to a non-graphicShirt string
  if (typeof clothing === 'string') {
    return clothing !== 'graphicShirt';
  }
  // Not disabled if clothing is not set (will default to graphicShirt)
  return false;
};

// Get color value from array (returns first color with # prefix)
const getColorValue = (value: unknown, index: number): string => {
  if (Array.isArray(value) && value.length > index) {
    const color = value[index];
    if (typeof color === 'string' && color.length > 0) {
      // Ensure # prefix for hex colors
      return color.startsWith('#') ? color : `#${color}`;
    }
  }
  // Default color random 8 colors
  const defaultColors = [
    '#e6194b',
    '#3cb44b',
    '#ffe119',
    '#4363d8',
    '#f58231',
    '#911eb4',
    '#46f0f0',
    '#f032e6',
  ];
  return defaultColors[index % defaultColors.length] || '#000000';
};

// Handle color change for color picker
const handleColorChange = (key: string | number, color: string, index: number) => {
  const currentArray = Array.isArray(props.modelValue[String(key)])
    ? [...(props.modelValue[String(key)] as string[])]
    : [];

  // Update the color at the specified index
  // here we need to remove the # prefix before storing
  const cleanColor = color.replace(/^#/, '');
  currentArray[index] = cleanColor;

  emit('update:modelValue', {
    ...props.modelValue,
    [String(key)]: currentArray,
  });
};

const formatArrayValue = (value: unknown): string => {
  if (Array.isArray(value)) {
    return value.join(', ');
  }
  return '';
};

const formatEnumValue = (value: unknown): string => {
  if (typeof value === 'string') {
    return value.charAt(0).toUpperCase() + value.slice(1).replace(/-/g, ' ');
  }
  return String(value);
};

const getOptionLabel = (key: string | number, property: OptionProperty): string => {
  return getOptionLabelFn(String(key), property);
};
</script>

<script lang="ts">
export default {
  name: 'StyleOptions',
};
</script>

<style scoped lang="scss">
.q-mb-md {
  &:last-child {
    margin-bottom: 0;
  }
}
</style>
