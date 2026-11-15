<script setup lang="ts">
import type { LegendItem } from '../composables/lanes'

defineProps<{ items: LegendItem[] }>()
</script>

<template>
  <div class="legend">
    <span v-for="item in items" :key="item.label">
      <i :class="{ hatched: !item.fill }" :style="{ background: item.fill }" />{{ item.label }}
    </span>
    <IllustrativeBadge class="badge" />
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
</style>
