<template>
  <div class="avatar-controls">
    <!-- Style Selection -->
    <q-card flat bordered class="q-mb-md">
      <q-card-section>
        <div class="text-subtitle2 q-mb-sm">
          <q-icon name="palette" class="q-mr-xs" />
          Avatar Style
        </div>
        <q-select
          v-model="selectedStyle"
          :options="styleOptions"
          option-value="key"
          option-label="label"
          outlined
          dense
          emit-value
          map-options
          @update:model-value="handleStyleChange"
        >
          <template v-slot:option="scope">
            <q-item v-bind="scope.itemProps">
              <q-item-section>
                <q-item-label>{{ scope.opt.label }}</q-item-label>
                <q-item-label caption>{{ scope.opt.description }}</q-item-label>
              </q-item-section>
              <q-item-section side>
                <q-badge :color="getCategoryColor(scope.opt.category)">
                  {{ scope.opt.category }}
                </q-badge>
              </q-item-section>
            </q-item>
          </template>
        </q-select>
      </q-card-section>
    </q-card>

    <!-- Presets -->
    <q-card flat bordered class="q-mb-md">
      <q-card-section>
        <div class="text-subtitle2 q-mb-sm">
          <q-icon name="auto_awesome" class="q-mr-xs" />
          Quick Presets
        </div>
        <div class="row q-gutter-sm">
          <q-btn
            v-for="preset in presets"
            :key="preset.key"
            outline
            dense
            :label="preset.label"
            :color="selectedPreset === preset.key ? 'primary' : 'grey-7'"
            @click="applyPreset(preset)"
            size="sm"
          />
        </div>
      </q-card-section>
    </q-card>

    <!-- Seed Input -->
    <q-card flat bordered class="q-mb-md">
      <q-card-section>
        <div class="text-subtitle2 q-mb-sm">
          <q-icon name="tune" class="q-mr-xs" />
          Seed & Customization
        </div>
        <q-input
          v-model="seed"
          outlined
          dense
          label="Seed (name, text, or ID)"
          @update:model-value="handleSeedChange"
          class="q-mb-md"
        >
          <template v-slot:append>
            <q-btn flat dense round icon="shuffle" @click="$emit('randomize')" size="sm">
              <q-tooltip>Random seed</q-tooltip>
            </q-btn>
          </template>
        </q-input>

        <!-- Size Slider -->
        <div class="q-mb-md">
          <div class="text-caption q-mb-xs">Size: {{ size }}px</div>
          <q-slider
            v-model="size"
            :min="64"
            :max="512"
            :step="16"
            label
            @update:model-value="handleSizeChange"
            color="primary"
          />
        </div>

        <!-- Radius Slider -->
        <div class="q-mb-md">
          <div class="text-caption q-mb-xs">Border Radius: {{ radius }}%</div>
          <q-slider
            v-model="radius"
            :min="0"
            :max="50"
            :step="5"
            label
            @update:model-value="handleRadiusChange"
            color="secondary"
          />
        </div>

        <!-- Scale Slider -->
        <div class="q-mb-md">
          <div class="text-caption q-mb-xs">Scale: {{ scale }}%</div>
          <q-slider
            v-model="scale"
            :min="50"
            :max="150"
            :step="5"
            label
            @update:model-value="handleScaleChange"
            color="accent"
          />
        </div>
      </q-card-section>
    </q-card>

    <!-- Background Color -->
    <q-card flat bordered class="q-mb-md">
      <q-card-section>
        <div class="text-subtitle2 q-mb-sm">
          <q-icon name="color_lens" class="q-mr-xs" />
          Background
        </div>
        <div class="row q-gutter-sm q-mb-sm">
          <q-btn
            v-for="color in backgroundColors"
            :key="color.value"
            :style="{ backgroundColor: color.display }"
            round
            size="sm"
            class="color-btn"
            @click="handleBackgroundChange(color.value)"
          >
            <q-tooltip>{{ color.label }}</q-tooltip>
          </q-btn>
        </div>
        <q-input
          v-model="customBackground"
          outlined
          dense
          label="Custom hex color"
          placeholder="e.g., ff5733"
          @update:model-value="handleCustomBackgroundChange"
          maxlength="6"
        >
          <template v-slot:prepend>
            <span class="text-caption">#</span>
          </template>
        </q-input>
      </q-card-section>
    </q-card>

    <!-- Advanced Options -->
    <q-expansion-item
      v-model="showAdvanced"
      icon="settings"
      label="Advanced Options"
      class="q-mb-md"
      bordered
    >
      <q-card>
        <q-card-section>
          <!-- Rotate -->
          <div class="q-mb-md">
            <div class="text-caption q-mb-xs">Rotate: {{ rotate }}°</div>
            <q-slider
              v-model="rotate"
              :min="0"
              :max="360"
              :step="15"
              label
              @update:model-value="handleRotateChange"
            />
          </div>

          <!-- Flip -->
          <q-toggle
            v-model="flip"
            label="Flip horizontally"
            @update:model-value="handleFlipChange"
            class="q-mb-md"
          />

          <!-- Translate X -->
          <div class="q-mb-md">
            <div class="text-caption q-mb-xs">Position X: {{ translateX }}</div>
            <q-slider
              v-model="translateX"
              :min="-50"
              :max="50"
              :step="5"
              label
              @update:model-value="handleTranslateXChange"
            />
          </div>

          <!-- Translate Y -->
          <div class="q-mb-md">
            <div class="text-caption q-mb-xs">Position Y: {{ translateY }}</div>
            <q-slider
              v-model="translateY"
              :min="-50"
              :max="50"
              :step="5"
              label
              @update:model-value="handleTranslateYChange"
            />
          </div>
        </q-card-section>
      </q-card>
    </q-expansion-item>

    <!-- Action Buttons -->
    <q-card flat bordered>
      <q-card-section>
        <div class="text-subtitle2 q-mb-sm">
          <q-icon name="download" class="q-mr-xs" />
          Download & Actions
        </div>
        <div class="row q-gutter-sm">
          <q-btn
            unelevated
            color="primary"
            icon="download"
            label="Download PNG"
            @click="$emit('downloadPNG')"
            :disable="!hasAvatar"
            class="col"
          />
          <q-btn
            unelevated
            color="secondary"
            icon="code"
            label="Download SVG"
            @click="$emit('downloadSVG')"
            :disable="!hasAvatar"
            class="col"
          />
        </div>
        <div class="row q-gutter-sm q-mt-sm">
          <q-btn
            outline
            color="positive"
            icon="favorite"
            label="Save to Favorites"
            @click="$emit('saveToFavorites')"
            :disable="!hasAvatar"
            class="col"
          />
          <q-btn
            outline
            color="grey-7"
            icon="refresh"
            label="Reset"
            @click="$emit('reset')"
            class="col"
          />
        </div>
      </q-card-section>
    </q-card>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import { avatarStyles, avatarPresets, type AvatarPreset } from '../services/avatarStyles';

interface Props {
  modelValue: {
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
  };
  hasAvatar?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  hasAvatar: false,
});

const emit = defineEmits<{
  'update:modelValue': [value: Props['modelValue']];
  'update:style': [value: string];
  'update:seed': [value: string];
  'update:size': [value: number];
  'update:backgroundColor': [value: string[]];
  'update:radius': [value: number];
  'update:scale': [value: number];
  'update:rotate': [value: number];
  'update:translateX': [value: number];
  'update:translateY': [value: number];
  'update:flip': [value: boolean];
  randomize: [];
  downloadPNG: [];
  downloadSVG: [];
  saveToFavorites: [];
  reset: [];
}>();

// Local state
const selectedStyle = ref(props.modelValue.style);
const seed = ref(props.modelValue.seed);
const size = ref(props.modelValue.size);
const radius = ref(props.modelValue.radius);
const scale = ref(props.modelValue.scale);
const rotate = ref(props.modelValue.rotate);
const translateX = ref(props.modelValue.translateX);
const translateY = ref(props.modelValue.translateY);
const flip = ref(props.modelValue.flip);
const customBackground = ref('');
const showAdvanced = ref(false);
const selectedPreset = ref<string | null>(null);

// Style options
const styleOptions = computed(() => avatarStyles);

// Presets
const presets = computed(() => avatarPresets);

// Background colors
const backgroundColors = [
  { label: 'Transparent', value: 'transparent', display: 'transparent' },
  { label: 'White', value: 'ffffff', display: '#ffffff' },
  { label: 'Light Gray', value: 'f5f5f5', display: '#f5f5f5' },
  { label: 'Sky Blue', value: 'b6e3f4', display: '#b6e3f4' },
  { label: 'Lavender', value: 'c0aede', display: '#c0aede' },
  { label: 'Mint', value: 'a8e6cf', display: '#a8e6cf' },
  { label: 'Peach', value: 'ffd3b6', display: '#ffd3b6' },
  { label: 'Pink', value: 'ffd5dc', display: '#ffd5dc' },
  { label: 'Yellow', value: 'ffeca8', display: '#ffeca8' },
  { label: 'Dark', value: '2d2d2d', display: '#2d2d2d' },
];

// Watch for external changes
watch(
  () => props.modelValue,
  (newValue) => {
    selectedStyle.value = newValue.style;
    seed.value = newValue.seed;
    size.value = newValue.size;
    radius.value = newValue.radius;
    scale.value = newValue.scale;
    rotate.value = newValue.rotate;
    translateX.value = newValue.translateX;
    translateY.value = newValue.translateY;
    flip.value = newValue.flip;
  },
  { deep: true },
);

// Handlers
const handleStyleChange = (value: string) => {
  emit('update:style', value);
};

const handleSeedChange = (value: string | number | null) => {
  if (typeof value === 'string') {
    emit('update:seed', value);
  }
};

const handleSizeChange = (value: number | null) => {
  if (value !== null) emit('update:size', value);
};

const handleRadiusChange = (value: number | null) => {
  if (value !== null) emit('update:radius', value);
};

const handleScaleChange = (value: number | null) => {
  if (value !== null) emit('update:scale', value);
};

const handleRotateChange = (value: number | null) => {
  if (value !== null) emit('update:rotate', value);
};

const handleTranslateXChange = (value: number | null) => {
  if (value !== null) emit('update:translateX', value);
};

const handleTranslateYChange = (value: number | null) => {
  if (value !== null) emit('update:translateY', value);
};

const handleFlipChange = (value: boolean) => {
  emit('update:flip', value);
};

const handleBackgroundChange = (value: string) => {
  emit('update:backgroundColor', [value]);
};

const handleCustomBackgroundChange = (value: string | number | null) => {
  if (typeof value === 'string' && value && /^[0-9A-Fa-f]{6}$/.test(value)) {
    emit('update:backgroundColor', [value]);
  }
};

const applyPreset = (preset: AvatarPreset) => {
  selectedPreset.value = preset.key;
  emit('update:style', preset.config.style);
  emit('update:radius', preset.config.radius);

  // Apply random background from preset
  const bgOptions = preset.config.backgroundColor;
  if (bgOptions.length > 0) {
    const randomBg = bgOptions[Math.floor(Math.random() * bgOptions.length)];
    if (randomBg) {
      emit('update:backgroundColor', [randomBg]);
    }
  }

  // Randomize seed for variety
  emit('randomize');
};

const getCategoryColor = (category: string): string => {
  switch (category) {
    case 'human':
      return 'blue';
    case 'abstract':
      return 'purple';
    case 'fun':
      return 'orange';
    default:
      return 'grey';
  }
};
</script>

<style scoped lang="scss">
.avatar-controls {
  .color-btn {
    border: 2px solid #ddd;
    min-width: 36px;
    min-height: 36px;

    &:hover {
      border-color: #999;
    }
  }
}
</style>
