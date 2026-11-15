<script setup lang="ts">
import { THEMES } from '../composables/themes'
</script>

<template>
  <p><code>torch.compile</code> is all you need</p>
</template>

<style scoped>
p {
  margin: 220px 0 0;
  text-align: center;
  font-size: 72px;
  font-weight: 700;
}

code {
  font-family: var(--mono);
  font-size: 0.92em;
  color: v-bind('THEMES.kernel.colour');
}
</style>
