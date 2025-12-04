<template>
  <q-card flat bordered>
    <q-card-section class="flex flex-center">
      <div v-if="isGenerating" class="text-center">
        <q-spinner-rings color="primary" size="80px" />
        <div class="text-caption q-mt-md">Generating avatar...</div>
      </div>

      <div v-else-if="error" class="text-center text-negative">
        <q-icon name="error_outline" size="60px" />
        <div class="text-subtitle2 q-mt-md">{{ error }}</div>
      </div>

      <div v-else-if="svg" v-html="svg" />

      <div v-else class="text-center text-grey-6">
        <q-icon name="image" size="60px" />
        <div class="text-caption q-mt-md">No avatar generated</div>
      </div>
    </q-card-section>

    <q-separator v-if="showActions" />

    <q-card-actions v-if="showActions" align="center">
      <q-btn
        flat
        dense
        icon="refresh"
        label="Regenerate"
        color="primary"
        @click="$emit('regenerate')"
        :disable="isGenerating"
      />
      <q-btn
        flat
        dense
        icon="shuffle"
        label="Random"
        color="secondary"
        @click="$emit('randomize')"
        :disable="isGenerating"
      />
      <q-btn
        flat
        dense
        icon="content_copy"
        label="Copy SVG"
        @click="handleCopySVG"
        :disable="isGenerating || !svg"
      />
    </q-card-actions>
  </q-card>
</template>

<script setup lang="ts">
import { useQuasar } from 'quasar';

interface Props {
  svg?: string;
  isGenerating?: boolean;
  error?: string | null;
  size?: number;
  backgroundColor?: string;
  showActions?: boolean;
  borderRadius?: number;
}

const props = withDefaults(defineProps<Props>(), {
  svg: '',
  isGenerating: false,
  error: null,
  size: 256,
  backgroundColor: '#f5f5f5',
  showActions: true,
  borderRadius: 0,
});

const emit = defineEmits<{
  regenerate: [];
  randomize: [];
  copySVG: [];
}>();

const $q = useQuasar();

const handleCopySVG = async () => {
  emit('copySVG');
  try {
    await navigator.clipboard.writeText(props.svg);
    $q.notify({
      type: 'positive',
      message: 'SVG copied to clipboard!',
      position: 'top',
      timeout: 2000,
    });
  } catch {
    $q.notify({
      type: 'negative',
      message: 'Failed to copy SVG',
      position: 'top',
      timeout: 2000,
    });
  }
};
</script>

<style scoped lang="scss"></style>
