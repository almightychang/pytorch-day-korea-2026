<script setup lang="ts">
import type { LegendItem } from '../composables/lanes'

defineProps<{ items: LegendItem[]; measuredOn?: string }>()
</script>

<template>
  <div class="legend">
    <span v-for="item in items" :key="item.label">
      <i :class="{ hatched: !item.fill }" :style="{ background: item.fill }" />{{ item.label }}
    </span>
    <span v-if="measuredOn" class="badge measured">{{ measuredOn }}</span>
    <IllustrativeBadge v-else class="badge" />
  </div>
</template>

<style scoped>
.legend {
  display: flex;
  align-items: center;
  gap: 36px;
  margin-top: 24px;
  font-size: 22px;
  color: var(--muted);
}

.legend span {
  display: flex;
  align-items: center;
  gap: 10px;
}

.legend i {
  width: 18px;
  height: 18px;
  border-radius: 4px;
}

.legend .hatched {
  background: repeating-linear-gradient(-45deg, #8a90a080 0 4px, transparent 4px 8px);
}

.legend .badge {
  margin-left: auto;
}

.measured {
  padding: 4px 16px;
  border: 2px solid #8a90a066;
  border-radius: 999px;
  font-family: var(--mono);
  font-size: 18px;
  font-weight: 600;
}
</style>
