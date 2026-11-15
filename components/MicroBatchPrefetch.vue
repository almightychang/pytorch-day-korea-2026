<script setup lang="ts">
import { laneColour } from '../composables/laneColours'
import { solid, type Bar, type LegendItem, type Row } from '../composables/lanes'

const STEPS = 3
const STEP_UNITS = 2.4
const H2D_UNITS = 0.6
const PREFETCH_LEAD_UNITS = 0.6
const totalUnits = STEPS * (STEP_UNITS + H2D_UNITS)

const steps = Array.from({ length: STEPS }, (_, step) => step)
const upload = (start: number): Bar => solid({ start, end: start + H2D_UNITS, label: 'H2D' }, laneColour.h2d)
const compute = (step: number, start: number): Bar =>
  solid({ start, end: start + STEP_UNITS, label: `step ${step + 1}` }, laneColour.kernel)

const blockingStart = (step: number) => step * (H2D_UNITS + STEP_UNITS)
const blocking: Row[] = [
  { name: 'compute', bars: steps.flatMap((step) => [upload(blockingStart(step)), compute(step, blockingStart(step) + H2D_UNITS)]) },
]

const overlappedStart = (step: number) => H2D_UNITS + step * STEP_UNITS
const prefetchStart = (step: number) => (step ? overlappedStart(step - 1) + PREFETCH_LEAD_UNITS : 0)
const overlapped: Row[] = [
  { name: 'copy', bars: [...steps, STEPS].map((step) => upload(prefetchStart(step))) },
  { name: 'compute', bars: steps.map((step) => compute(step, overlappedStart(step))) },
]

const CASES = [
  { title: 'without prefetch', rows: blocking },
  { title: 'with prefetch', rows: overlapped },
]
const legend: LegendItem[] = [
  { label: 'h2d', fill: laneColour.h2d },
  { label: 'step', fill: laneColour.kernel },
]
</script>

<template>
  <section v-for="example in CASES" :key="example.title">
    <h3>{{ example.title }}</h3>
    <LaneChart :rows="example.rows" :total-units="totalUnits" />
  </section>
  <LaneLegend :items="legend" />
</template>

<style scoped>
section {
  margin-top: 56px;
}

h3 {
  margin: 0 0 20px;
  font-family: var(--mono);
  font-size: 24px;
  font-weight: 400;
  color: var(--muted);
}
</style>
