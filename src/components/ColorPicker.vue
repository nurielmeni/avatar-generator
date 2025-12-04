<template>
  <q-input
    :model-value="modelValue"
    :label="label"
    outlined
    dense
    :hint="hint"
    @update:model-value="emit('update:modelValue', String($event))"
  >
    <template v-slot:prepend>
      <div class="color-preview" :style="{ backgroundColor: modelValue }" @click="openPicker" />
    </template>
    <template v-slot:append>
      <q-icon name="colorize" class="cursor-pointer" @click="openPicker">
        <q-popup-proxy ref="popupRef" cover transition-show="scale" transition-hide="scale">
          <q-color
            :model-value="modelValue"
            @update:model-value="emit('update:modelValue', $event ?? '')"
            format-model="hex"
            no-header
            no-footer
          />
        </q-popup-proxy>
      </q-icon>
    </template>
  </q-input>
</template>

<script setup lang="ts">
import { ref } from 'vue';

interface Props {
  modelValue?: string;
  label?: string;
  hint?: string;
}

withDefaults(defineProps<Props>(), {
  modelValue: '#cccccc',
  label: '',
  hint: '',
});

const emit = defineEmits<{
  'update:modelValue': [value: string];
}>();

const popupRef = ref();

const openPicker = () => {
  popupRef.value?.show();
};
</script>

<script lang="ts">
export default {
  name: 'ColorPicker',
};
</script>

<style scoped lang="scss">
.color-preview {
  width: 24px;
  height: 24px;
  border-radius: 4px;
  border: 1px solid rgba(0, 0, 0, 0.12);
  cursor: pointer;
  transition: transform 0.2s;

  &:hover {
    transform: scale(1.1);
  }
}
</style>
