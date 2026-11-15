<script setup lang="ts">
defineProps<{ step: number }>()

const FOCUS = 'ML Performance'
const FOCUS_STEP = 1
const EFFECT_STEP = 2
const FIELDS: { name: string; area: string; effects?: string[] }[] = [
  { name: 'Research', area: '1 / 1 / 4 / 6', effects: ['Faster iteration', 'More experiments'] },
  { name: 'Data', area: '1 / 6 / 3 / 9' },
  { name: 'Evaluation', area: '1 / 9 / 3 / 13' },
  { name: 'ML Performance', area: '3 / 6 / 5 / 9' },
  { name: 'Infra', area: '3 / 9 / 6 / 13', effects: ['Understanding bottlenecks'] },
  { name: 'Serving', area: '4 / 1 / 7 / 4', effects: ['Faster inference', 'Edge deployment'] },
  { name: 'MLOps', area: '4 / 4 / 7 / 6' },
  { name: 'Applications', area: '5 / 6 / 7 / 9' },
  { name: 'Hardware', area: '6 / 9 / 7 / 13' },
]
</script>

<template>
  <div class="mosaic">
    <div
      v-for="field in FIELDS"
      :key="field.name"
      class="field"
      :class="{
        focus: step >= FOCUS_STEP && field.name === FOCUS,
        dim: step >= FOCUS_STEP && field.name !== FOCUS && !(step >= EFFECT_STEP && field.effects),
        affected: step >= EFFECT_STEP && field.effects,
      }"
      :style="{ gridArea: field.area }"
    >
      <span v-for="effect in field.effects" :key="effect" class="effect">{{ effect }}</span>
      <span class="name">{{ field.name }}</span>
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
  flex-direction: column;
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

.name {
  margin-top: auto;
}

.effect {
  display: flex;
  gap: 14px;
  margin-bottom: 14px;
  font-size: 32px;
  font-weight: 500;
  line-height: 1.35;
  color: var(--muted);
  opacity: 0;
  transition: opacity 0.6s;
}

.effect::before {
  content: '→';
  color: var(--accent);
}

.field.affected {
  color: var(--text);
}

.field.affected .effect {
  opacity: 1;
}

.field.dim {
  opacity: 0.4;
}
</style>
