<template>
  <q-page class="avatar-generator-page q-pa-md">
    <div class="row q-col-gutter-md">
      <!-- Header -->
      <div class="col-12">
        <div class="text-h4 q-mb-xs">
          <q-icon name="account_circle" class="q-mr-sm" />
          Avatar Generator
        </div>
        <div class="text-subtitle2 text-grey-7 q-mb-md">
          Create unique avatars with DiceBear - customize, download, and save your favorites
        </div>
      </div>

      <!-- Preview Section -->
      <div class="col-12 col-md-6">
        <avatar-preview
          :svg="svg"
          :is-generating="isGenerating"
          :error="error"
          :size="options.size.value"
          :background-color="previewBackground"
          :border-radius="options.radius.value"
          :show-actions="true"
          @regenerate="generate"
          @randomize="handleRandomize"
          @copy-s-v-g="copySVG"
        />

        <!-- Avatar Info -->
        <q-card flat bordered class="q-mt-md">
          <q-card-section>
            <div class="text-subtitle2 q-mb-sm">
              <q-icon name="info" class="q-mr-xs" />
              Current Configuration
            </div>
            <div class="text-caption">
              <div><strong>Style:</strong> {{ getCurrentStyleLabel() }}</div>
              <div><strong>Seed:</strong> {{ options.seed.value }}</div>
              <div><strong>Size:</strong> {{ options.size.value }}px</div>
            </div>
          </q-card-section>
        </q-card>

        <!-- Favorites -->
        <q-card flat bordered class="q-mt-md" v-if="favorites.length > 0">
          <q-card-section>
            <div class="text-subtitle2 q-mb-sm">
              <q-icon name="favorite" class="q-mr-xs" />
              Favorites ({{ favorites.length }})
            </div>
            <div class="row q-gutter-sm">
              <q-card
                v-for="fav in favorites.slice(0, 6)"
                :key="fav.id"
                flat
                bordered
                class="cursor-pointer favorite-card"
                @click="loadFavorite(fav)"
              >
                <q-card-section class="q-pa-sm" v-if="fav.svg">
                  <div class="favorite-preview" v-html="fav.svg" />
                </q-card-section>
                <q-card-section class="q-pa-xs text-center">
                  <div class="text-caption ellipsis">{{ fav.name }}</div>
                </q-card-section>
                <q-btn
                  flat
                  dense
                  round
                  size="xs"
                  icon="close"
                  class="absolute-top-right q-ma-xs"
                  @click.stop="removeFavorite(fav.id)"
                />
              </q-card>
            </div>
          </q-card-section>
        </q-card>
      </div>

      <!-- Controls Section -->
      <div class="col-12 col-md-6">
        <avatar-controls
          :model-value="{
            style: options.style.value,
            seed: options.seed.value,
            size: options.size.value,
            backgroundColor: options.backgroundColor.value,
            radius: options.radius.value,
            scale: options.scale.value,
            rotate: options.rotate.value,
            translateX: options.translateX.value,
            translateY: options.translateY.value,
            flip: options.flip.value,
          }"
          :has-avatar="!!svg"
          @update:style="setOption('style', $event)"
          @update:seed="setOption('seed', $event)"
          @update:size="setOption('size', $event)"
          @update:background-color="setOption('backgroundColor', $event)"
          @update:radius="setOption('radius', $event)"
          @update:scale="setOption('scale', $event)"
          @update:rotate="setOption('rotate', $event)"
          @update:translate-x="setOption('translateX', $event)"
          @update:translate-y="setOption('translateY', $event)"
          @update:flip="setOption('flip', $event)"
          @randomize="handleRandomize"
          @download-p-n-g="handleDownloadPNG"
          @download-s-v-g="handleDownloadSVG"
          @save-to-favorites="handleSaveToFavorites"
          @reset="handleReset"
        />
      </div>
    </div>

    <!-- Save to Favorites Dialog -->
    <q-dialog v-model="showSaveDialog">
      <q-card style="min-width: 350px">
        <q-card-section>
          <div class="text-h6">Save to Favorites</div>
        </q-card-section>

        <q-card-section class="q-pt-none">
          <q-input
            v-model="favoriteName"
            dense
            autofocus
            label="Give it a name"
            @keyup.enter="confirmSaveToFavorites"
          />
        </q-card-section>

        <q-card-actions align="right" class="text-primary">
          <q-btn flat label="Cancel" v-close-popup />
          <q-btn
            flat
            label="Save"
            @click="confirmSaveToFavorites"
            :disable="!favoriteName.trim()"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useQuasar } from 'quasar';
import { useAvatarGenerator } from '../composables/useAvatarGenerator';
import AvatarPreview from '../components/AvatarPreview.vue';
import AvatarControls from '../components/AvatarControls.vue';
import {
  saveConfig,
  loadConfig,
  addToFavorites,
  getFavorites,
  removeFromFavorites,
  addToRecent,
  type SavedAvatar,
} from '../services/avatarPersistence';
import { getStyleByKey } from '../services/avatarStyles';

const $q = useQuasar();

// Initialize avatar generator
const {
  options,
  svg,
  isGenerating,
  error,
  generate,
  setOption,
  randomize,
  reset,
  downloadPNG,
  downloadSVG,
  copySVG,
} = useAvatarGenerator();

// Favorites
const favorites = ref<SavedAvatar[]>([]);
const showSaveDialog = ref(false);
const favoriteName = ref('');

// Computed
const previewBackground = computed(() => {
  const bg = options.backgroundColor.value[0];
  return bg === 'transparent' ? '#f5f5f5' : `#${bg}`;
});

// Methods
const handleRandomize = () => {
  randomize();
  $q.notify({
    type: 'info',
    message: 'Seed randomized!',
    position: 'top',
    timeout: 1500,
  });
};

const handleDownloadPNG = async () => {
  await downloadPNG();
  $q.notify({
    type: 'positive',
    message: 'PNG downloaded successfully!',
    position: 'top',
    timeout: 2000,
  });
};

const handleDownloadSVG = () => {
  downloadSVG();
  $q.notify({
    type: 'positive',
    message: 'SVG downloaded successfully!',
    position: 'top',
    timeout: 2000,
  });
};

const handleSaveToFavorites = () => {
  favoriteName.value = `${options.style.value}-${options.seed.value}`;
  showSaveDialog.value = true;
};

const confirmSaveToFavorites = () => {
  if (!favoriteName.value.trim()) return;

  const saved = addToFavorites(
    favoriteName.value,
    {
      style: options.style.value,
      seed: options.seed.value,
      size: options.size.value,
      backgroundColor: options.backgroundColor.value,
      radius: options.radius.value,
      scale: options.scale.value,
      rotate: options.rotate.value,
      translateX: options.translateX.value,
      translateY: options.translateY.value,
      flip: options.flip.value,
    },
    svg.value,
  );

  if (saved) {
    favorites.value = getFavorites();
    showSaveDialog.value = false;
    favoriteName.value = '';
    $q.notify({
      type: 'positive',
      message: 'Saved to favorites!',
      position: 'top',
      timeout: 2000,
      icon: 'favorite',
    });
  }
};

const loadFavorite = (fav: SavedAvatar) => {
  setOption('style', fav.options.style);
  setOption('seed', fav.options.seed);
  setOption('size', fav.options.size);
  setOption('backgroundColor', fav.options.backgroundColor);
  setOption('radius', fav.options.radius);
  setOption('scale', fav.options.scale);
  setOption('rotate', fav.options.rotate);
  setOption('translateX', fav.options.translateX);
  setOption('translateY', fav.options.translateY);
  setOption('flip', fav.options.flip);

  $q.notify({
    type: 'info',
    message: `Loaded: ${fav.name}`,
    position: 'top',
    timeout: 1500,
  });
};

const removeFavorite = (id: string) => {
  $q.dialog({
    title: 'Remove Favorite',
    message: 'Are you sure you want to remove this favorite?',
    cancel: true,
    persistent: true,
  }).onOk(() => {
    if (removeFromFavorites(id)) {
      favorites.value = getFavorites();
      $q.notify({
        type: 'negative',
        message: 'Removed from favorites',
        position: 'top',
        timeout: 1500,
      });
    }
  });
};

const handleReset = () => {
  $q.dialog({
    title: 'Reset Configuration',
    message: 'Reset all settings to default?',
    cancel: true,
    persistent: true,
  }).onOk(() => {
    reset();
    $q.notify({
      type: 'info',
      message: 'Settings reset to default',
      position: 'top',
      timeout: 1500,
    });
  });
};

const getCurrentStyleLabel = () => {
  const style = getStyleByKey(options.style.value);
  return style ? style.label : options.style.value;
};

// Auto-save config on changes
const saveCurrentConfig = () => {
  saveConfig({
    style: options.style.value,
    seed: options.seed.value,
    size: options.size.value,
    backgroundColor: options.backgroundColor.value,
    radius: options.radius.value,
    scale: options.scale.value,
    rotate: options.rotate.value,
    translateX: options.translateX.value,
    translateY: options.translateY.value,
    flip: options.flip.value,
  });

  // Add to recent history
  addToRecent(
    {
      style: options.style.value,
      seed: options.seed.value,
      size: options.size.value,
      backgroundColor: options.backgroundColor.value,
      radius: options.radius.value,
      scale: options.scale.value,
      rotate: options.rotate.value,
      translateX: options.translateX.value,
      translateY: options.translateY.value,
      flip: options.flip.value,
    },
    svg.value,
  );
};

// Initialize
onMounted(() => {
  // Load favorites
  favorites.value = getFavorites();

  // Try to load saved config
  const savedConfig = loadConfig();
  if (savedConfig) {
    setOption('style', savedConfig.style);
    setOption('seed', savedConfig.seed);
    setOption('size', savedConfig.size);
    setOption('backgroundColor', savedConfig.backgroundColor);
    setOption('radius', savedConfig.radius);
    setOption('scale', savedConfig.scale);
    setOption('rotate', savedConfig.rotate);
    setOption('translateX', savedConfig.translateX);
    setOption('translateY', savedConfig.translateY);
    setOption('flip', savedConfig.flip);
  }

  // Save config periodically
  let saveTimeout: NodeJS.Timeout;
  const debouncedSave = () => {
    clearTimeout(saveTimeout);
    saveTimeout = setTimeout(saveCurrentConfig, 1000);
  };

  // Auto-save when avatar changes
  setInterval(() => {
    if (svg.value) {
      debouncedSave();
    }
  }, 2000);
});
</script>

<style scoped lang="scss">
.avatar-generator-page {
  max-width: 1400px;
  margin: 0 auto;

  .favorite-card {
    width: 80px;
    position: relative;
    transition: transform 0.2s;

    &:hover {
      transform: scale(1.05);
    }

    .favorite-preview {
      width: 60px;
      height: 60px;
      display: flex;
      align-items: center;
      justify-content: center;

      :deep(svg) {
        width: 100%;
        height: 100%;
      }
    }
  }
}
</style>
