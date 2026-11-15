<script setup lang="ts">
import type { Run } from './RunBars.vue'

const DEVICES: { name: string; runs: Run[] }[] = [
  {
    name: 'RTX 5090',
    runs: [
      { name: 'RLDX-1', value: 75.1, tone: 'muted' },
      { name: 'RLDX-1.1', value: 42.4 },
      { name: '+ quantization', value: 20.2 },
    ],
  },
  {
    name: 'Jetson Thor',
    runs: [
      { name: 'RLDX-1', note: 'not supported' },
      { name: 'RLDX-1.1', value: 155.9 },
      { name: '+ quantization', value: 86.1 },
    ],
  },
]
const PX_PER_MS = 7
</script>

<template>
  <section v-for="device in DEVICES" :key="device.name">
    <h3>{{ device.name }}</h3>
    <RunBars compact :runs="device.runs" unit="ms" :px-per-unit="PX_PER_MS" :digits="0" />
  </section>
  <SourceNote
    site="github"
    title="RLWRLD/RLDX-1 v1.1.0"
    detail="docs/optimization.md"
    href="https://github.com/RLWRLD/RLDX-1/blob/v1.1.0/docs/optimization.md"
  />
</template>

<style scoped>
section {
  margin-top: 44px;
}

h3 {
  margin: 0 0 18px;
  font-size: 30px;
  font-weight: 700;
}
</style>
