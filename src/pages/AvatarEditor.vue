<template>
  <q-page class="avatar-editor-page">
    <!-- Loading State -->
    <div v-if="isLoading" class="loading-state">
      <q-spinner-rings color="white" size="80px" />
      <div class="text-white q-mt-md">Loading...</div>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="error-state">
      <q-icon name="error" color="white" size="80px" />
      <div class="text-white q-mt-md">{{ error }}</div>
    </div>

    <!-- Main Content -->
    <template v-else>
      <!-- Sticky Header -->
      <div class="editor-header" ref="headerRef">
        <div class="header-content">
          <div class="text-h5">Avatar Editor</div>
          <div class="header-actions">
            <q-btn round flat icon="shuffle" color="primary" @click="store.randomize()" size="md">
              <q-tooltip>Randomize</q-tooltip>
            </q-btn>
            <q-btn round unelevated color="primary" icon="download" @click="downloadPNG" size="md">
              <q-tooltip>Download PNG</q-tooltip>
            </q-btn>
          </div>
        </div>
      </div>

      <!-- Sticky Preview -->
      <div class="editor-preview" ref="previewRef">
        <div class="preview-container" v-html="store.currentAvatar.toString()" />
      </div>

      <!-- Tabs and Options -->
      <div class="editor-tabs-container" ref="tabsRef">
        <q-tabs
          v-model="store.selectedTab"
          dense
          mobile-arrows
          class="text-grey-8"
          no-caps
          active-color="primary"
          indicator-color="primary"
        >
          <q-tab
            v-for="(key, index) in optionKeys"
            :key="key"
            :name="index.toString()"
            :label="formatLabel(key)"
            :disable="!hasMultipleOptions(key)"
          />
        </q-tabs>
        <q-separator />
        <q-tab-panels
          v-model="store.selectedTab"
          animated
          transition-prev="slide-down"
          transition-next="slide-up"
          class="editor-options"
        >
          <q-tab-panel
            v-for="(key, index) in optionKeys"
            :key="key"
            :name="index.toString()"
            class="q-pa-md"
          >
            <div class="options-grid">
              <!-- Grid items for style selection -->
              <template v-if="key === 'style'">
                <div
                  v-for="styleName in Object.keys(store.styleCombinations)"
                  :key="styleName"
                  class="option-item-wrapper"
                  :class="{ 'option-item-active': store.selectedStyleName === styleName }"
                  @click="() => store.changeStyle(styleName as any)"
                >
                  <div class="option-item">
                    <div class="option-avatar">
                      <img
                        :src="(store.styleCombinations[styleName]?.[0]?.avatar as any)?.toDataUri()"
                        alt="avatar"
                      />
                    </div>
                  </div>
                </div>
              </template>

              <!-- Grid items for other options -->
              <template v-else>
                <div
                  v-for="(combination, ci) in store.optionCombinations[key] || []"
                  :key="`${key}-${ci}`"
                  class="option-item-wrapper"
                  :class="{ 'option-item-active': combination.active }"
                  @click="() => handleOptionClick(combination)"
                >
                  <div class="option-item">
                    <div class="option-avatar">
                      <img :src="combination.avatar.toDataUri()" alt="avatar" />
                    </div>

                    <!-- Color picker for custom color -->
                    <div v-if="combination.isCustomColor" class="option-color-picker">
                      <input
                        type="color"
                        :value="'#' + (store.currentStyleOptions[key] || 'ffffff')"
                        @input="(e) => handleColorChange(key, (e.target as HTMLInputElement).value)"
                        class="color-input"
                      />
                      <div class="color-wheel-icon" />
                    </div>
                  </div>
                </div>
              </template>
            </div>
          </q-tab-panel>
        </q-tab-panels>
      </div>
    </template>
  </q-page>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useAvatarStore } from 'src/stores/avatarStore';
import type { AvatarCombination } from 'src/services/avatarCombinations';

const store = useAvatarStore();

const headerRef = ref<HTMLElement>();
const previewRef = ref<HTMLElement>();
const tabsRef = ref<HTMLElement>();
const isLoading = ref(true);
const error = ref('');

// Initialize store and handle errors
onMounted(() => {
  console.log('AvatarEditor mounted');
  console.log('Store:', store);
  console.log('Current avatar:', store.currentAvatar);
  console.log('Style combinations:', store.styleCombinations);

  try {
    // Give the store time to initialize
    setTimeout(() => {
      if (!store.currentAvatar) {
        error.value = 'Failed to initialize avatar store';
        console.error('No current avatar');
      }
      isLoading.value = false;
      console.log('Loading complete');
    }, 100);
  } catch (e) {
    console.error('Error in onMounted:', e);
    error.value = e instanceof Error ? e.message : 'Unknown error occurred';
    isLoading.value = false;
  }
});

// Get all option keys
const optionKeys = computed(() => {
  return ['style', ...Object.keys(store.optionCombinations)];
});

// Check if option has multiple values
function hasMultipleOptions(key: string): boolean {
  if (key === 'style') {
    return Object.keys(store.availableStyles).length > 1;
  }
  const options = store.optionCombinations[key] || [];
  return options.length > 1;
}

// Format option key to readable label
function formatLabel(key: string): string {
  if (key === 'style') return 'Style';
  return key
    .replace(/([A-Z])/g, ' $1')
    .replace(/^./, (str) => str.toUpperCase())
    .trim();
}

// Handle option selection
function handleOptionClick(combination: AvatarCombination) {
  if (!combination.isCustomColor) {
    store.updateOptions(combination.options);
  }
}

// Handle color change
function handleColorChange(key: string, value: string) {
  const cleanValue = value.replace('#', '');
  store.updateOptions({
    ...store.currentStyleOptions,
    [key]: cleanValue,
  });
}

// Download avatar as PNG (render SVG to canvas, then to PNG)
async function downloadPNG() {
  try {
    const svg = store.currentAvatar.toString();

    // Create image from SVG
    const img = new Image();
    const svgBlob = new Blob([svg], { type: 'image/svg+xml' });
    const svgUrl = URL.createObjectURL(svgBlob);

    await new Promise<void>((resolve, reject) => {
      img.onload = () => resolve();
      img.onerror = () => reject(new Error('Failed to load SVG image'));
      img.src = svgUrl;
    });

    const canvas = document.createElement('canvas');
    canvas.width = img.width || 512;
    canvas.height = img.height || 512;
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      throw new Error('Canvas context not available');
    }
    ctx.drawImage(img, 0, 0);

    URL.revokeObjectURL(svgUrl);

    canvas.toBlob((blob) => {
      if (!blob) return;
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `avatar-${Date.now()}.png`;
      link.click();
      URL.revokeObjectURL(url);
    }, 'image/png');
  } catch (e) {
    console.error('Failed to download PNG', e);
  }
}
</script>

<style scoped lang="scss">
.avatar-editor-page {
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 0;
}

.loading-state,
.error-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  color: white;
}

.editor-header,
.editor-preview,
.editor-tabs {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  z-index: 100;
}

.editor-header {
  padding: 16px 20px;

  .header-content {
    max-width: 960px;
    margin: 0 auto;
    display: flex;
    justify-content: space-between;
    align-items: center;
    color: white;
  }

  .header-actions {
    display: flex;
    gap: 8px;
  }
}

.editor-preview {
  padding: 40px 20px;
  display: flex;
  justify-content: center;
  align-items: center;

  .preview-container {
    max-width: min(32vh, 90vw);
    width: 100%;
    border-radius: 20px;
    overflow: hidden;
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
    background: white;

    :deep(svg) {
      display: block;
      width: 100%;
      height: auto;
    }
  }
}

.editor-tabs-container {
  background: rgb(255, 255, 255);
  border-top-left-radius: 8px;
  border-top-right-radius: 8px;
  box-shadow: 0 -4px 12px rgba(0, 0, 0, 0.1);
}

.editor-options {
  background: white;
  min-height: 50vh;

  :deep(.q-tab-panel) {
    max-width: 960px;
    margin: 0 auto;
  }
}

.options-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(88px, 1fr));
  gap: 20px;
  width: 100%;
}

.option-item-wrapper {
  position: relative;
  cursor: pointer;
  padding: 6px;
  transition: all 0.2s ease;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    right: 0;
    bottom: 0;
    left: 0;
    border-radius: 18px;
    border: 0 solid #1976d2;
    transition: border-width 0.15s ease;
    pointer-events: none;
  }

  &:hover::before {
    border-width: 3px;
  }

  &-active::before {
    border-width: 3px !important;
  }
}

.option-item {
  position: relative;
  border-radius: 12px;
  overflow: hidden;
  background: white;
  aspect-ratio: 1;
  width: 100%;

  .option-avatar {
    width: 100%;
    height: 100%;
    display: block;
    background: white;

    img {
      width: 100%;
      height: 100%;
      display: block;
      object-fit: cover;
    }

    :deep(svg) {
      width: 100%;
      height: 100%;
      display: block;
    }
  }

  .option-color-picker {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    cursor: pointer;

    .color-input {
      position: absolute;
      bottom: 4px;
      right: 4px;
      width: 28px;
      height: 28px;
      opacity: 0;
      cursor: pointer;
    }

    .color-wheel-icon {
      position: absolute;
      bottom: 4px;
      right: 4px;
      width: 28px;
      height: 28px;
      border: 2px solid white;
      border-radius: 50%;
      background: conic-gradient(
        red 0%,
        orange 14.29%,
        yellow 28.57%,
        green 42.86%,
        blue 57.14%,
        indigo 71.43%,
        violet 85.71%,
        red 100%
      );
      pointer-events: none;

      &::after {
        content: '';
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        width: 10px;
        height: 10px;
        border-radius: 50%;
        background: white;
      }
    }
  }
}

@media (max-width: 768px) {
  .options-grid {
    grid-template-columns: repeat(auto-fill, minmax(72px, 1fr));
    gap: 16px;
  }
}
</style>
