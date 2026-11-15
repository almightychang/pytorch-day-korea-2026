<script setup lang="ts">
import { TO_BE } from '../composables/dataFlow'
import { THEMES } from '../composables/themes'
</script>

<template>
  <div class="to-be-flow">
    <DataFlow :lanes="TO_BE.lanes" :nodes="TO_BE.nodes" :column-px="TO_BE.columnPx" />
  </div>
  <p class="themes">
    <span v-for="theme in THEMES" :key="theme.label"><i :style="{ background: theme.colour }" />{{ theme.label }}</span>
  </p>
</template>

<style scoped>
.to-be-flow {
  margin-top: 60px;
}

.themes {
  display: flex;
  gap: 36px;
  margin: 36px 0 0;
  font-size: 22px;
  color: var(--muted);
}

.themes span {
  display: flex;
  align-items: center;
  gap: 10px;
}

.themes i {
  width: 18px;
  height: 18px;
  border-radius: 4px;
}
</style>
