<script setup lang="ts">
import { solid, type LegendItem, type Row } from '../composables/lanes'
import { THEMES } from '../composables/themes'

const MICROSTEP_UNITS = 4
const PLAN_UNITS = 1.4
const H2D_UNITS = 0.8
const RUNNING = { name: 'n', fill: '#8a90a0' }
const NEXT = { name: 'n+1', fill: THEMES.host.colour }

const uploadStart = MICROSTEP_UNITS - H2D_UNITS
const planStart = uploadStart - PLAN_UNITS

const rows: Row[] = [
  { name: 'host', bars: [solid({ start: planStart, end: uploadStart, label: `plan ${NEXT.name}` }, NEXT.fill)] },
  { name: 'copy', bars: [solid({ start: uploadStart, end: MICROSTEP_UNITS, label: `H2D ${NEXT.name}` }, NEXT.fill)] },
  {
    name: 'device',
    bars: [RUNNING, NEXT].map((batch, order) =>
      solid(
        { start: order * MICROSTEP_UNITS, end: (order + 1) * MICROSTEP_UNITS, label: `micro-step ${batch.name}` },
        batch.fill,
      ),
    ),
  },
]
const legend: LegendItem[] = [RUNNING, NEXT].map((batch) => ({ label: `micro-batch ${batch.name}`, fill: batch.fill }))
</script>

<template>
  <div class="prefetch">
    <LaneChart :rows="rows" :total-units="2 * MICROSTEP_UNITS" />
    <LaneLegend :items="legend" />
  </div>
</template>

<style scoped>
.prefetch {
  margin-top: 150px;
}
</style>
