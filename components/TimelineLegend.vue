<script setup lang="ts">
import { groupChips, laneGroups } from '../composables/timelineLanes'

defineProps<{ chips: boolean }>()
</script>

<template>
  <div class="legend">
    <template v-if="chips">
      <div v-for="group in laneGroups" :key="group.key" class="group">
        <span class="name">{{ group.label }}</span>
        <span v-for="chip in groupChips(group)" :key="chip.label" class="chip">
          <i :style="{ background: chip.color }" />{{ chip.label }}
        </span>
      </div>
    </template>
    <div class="aside"><slot /></div>
  </div>
</template>

<style scoped>
.legend {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 8px 40px;
  margin: 28px 0 16px;
  font-size: 22px;
}

.group {
  display: flex;
  align-items: center;
  gap: 16px;
}

.aside {
  margin-left: auto;
}

.name {
  font-family: var(--mono);
  font-size: 16px;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: var(--muted);
}

.chip {
  display: flex;
  align-items: center;
  gap: 8px;
  white-space: nowrap;
}

.chip i {
  width: 16px;
  height: 16px;
  border-radius: 4px;
}
</style>
