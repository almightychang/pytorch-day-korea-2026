<script setup lang="ts">
defineProps<{ label: string; height?: number }>()
</script>

<template>
  <div class="placeholder" :style="{ height: `${height ?? 560}px` }">{{ label }}</div>
</template>

<style scoped>
.placeholder {
  margin: 40px 0;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 3px dashed #8a90a066;
  border-radius: 16px;
  font-size: 36px;
  color: var(--muted);
}
</style>
