<script setup lang="ts">
import { ref } from 'vue';

const tab = ref('mails');
</script>

<template>
  <q-page padding class="flex flex-center">
    <div style="width: 200px">
      <q-card>
        <q-tabs
          v-model="tab"
          dense
          outside-arrows
          mobile-arrows
          class="text-grey"
          active-color="primary"
          indicator-color="primary"
        >
          <q-tab name="mails" label="Mails" />
          <q-tab name="alarms" label="Alarms" />
          <q-tab name="movies" label="Movies" />
          <q-tab name="movies1" label="Movies1" />
          <q-tab name="movies2" label="Movies2" />
          <q-tab name="movies3" label="Movies3" />
          <q-tab name="movies4" label="Movies4" />
        </q-tabs>

        <q-separator />

        <q-tab-panels v-model="tab" animated>
          <q-tab-panel name="mails">Mails content</q-tab-panel>
          <q-tab-panel name="alarms">Alarms content</q-tab-panel>
          <q-tab-panel name="movies">Movies content</q-tab-panel>
          <q-tab-panel name="movies1">Movies1 content</q-tab-panel>
          <q-tab-panel name="movies2">Movies2 content</q-tab-panel>
          <q-tab-panel name="movies3">Movies3 content</q-tab-panel>
          <q-tab-panel name="movies4">Movies4 content</q-tab-panel>
        </q-tab-panels>
      </q-card>
    </div>
  </q-page>
</template>

<style scoped></style>
