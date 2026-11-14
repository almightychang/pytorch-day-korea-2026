<script setup lang="ts">
defineProps<{ step: number }>()

const FOCUS = 'ML Performance'
const FIELDS = [
  { name: 'Research', area: '1 / 1 / 4 / 6' },
  { name: 'Data', area: '1 / 6 / 3 / 10' },
  { name: 'Evaluation', area: '1 / 10 / 3 / 13' },
  { name: 'ML Performance', area: '3 / 6 / 5 / 11' },
  { name: 'Infra', area: '3 / 11 / 6 / 13' },
  { name: 'Serving', area: '4 / 1 / 7 / 4' },
  { name: 'MLOps', area: '4 / 4 / 7 / 6' },
  { name: 'Applications', area: '5 / 6 / 7 / 11' },
  { name: 'Hardware', area: '6 / 11 / 7 / 13' },
]
</script>

<template>
  <div class="mosaic">
    <div
      v-for="field in FIELDS"
      :key="field.name"
      class="field"
      :class="{ focus: step >= 1 && field.name === FOCUS, dim: step >= 1 && field.name !== FOCUS }"
      :style="{ gridArea: field.area }"
    >
      {{ field.name }}
    </div>
  </div>
</template>

<style scoped>
.mosaic {
  display: grid;
  grid-template-columns: repeat(12, 1fr);
  grid-template-rows: repeat(6, 1fr);
  gap: 16px;
  height: 100%;
}

.field {
  display: flex;
  align-items: flex-end;
  padding: 28px 32px;
  border-radius: 16px;
  background: var(--panel);
  font-size: 44px;
  font-weight: 800;
  color: var(--muted);
  transition: opacity 0.6s, color 0.6s, background 0.6s;
}

.field.focus {
  background: var(--accent);
  color: var(--bg);
}

.field.dim {
  opacity: 0.4;
}
</style>
