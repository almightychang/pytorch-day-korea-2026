<script setup lang="ts">
import { laneColour } from '../composables/laneColours'
import { solid, type Bar, type LegendItem } from '../composables/lanes'

const WORKERS = 2
const BATCHES = 6
const STEPS = 4
const PLAN_UNITS = 3
const PLAN_GAP_UNITS = 0.4
const WORKER_STAGGER_UNITS = 1.3
const H2D_UNITS = 0.5
const STEP_UNITS = 2.2

const planStart = (batch: number) =>
  (batch % WORKERS) * WORKER_STAGGER_UNITS + Math.floor(batch / WORKERS) * (PLAN_UNITS + PLAN_GAP_UNITS)
const planEnd = (batch: number) => planStart(batch) + PLAN_UNITS
const firstStepStart = planEnd(0) + H2D_UNITS
const totalUnits = firstStepStart + STEPS * STEP_UNITS

const batches = Array.from({ length: BATCHES }, (_, batch) => batch)
const plans = (worker: number): Bar[] =>
  batches
    .filter((batch) => batch % WORKERS === worker)
    .map((batch) => solid({ start: planStart(batch), end: planEnd(batch), label: `plan ${batch + 1}` }, laneColour.python))
const uploads: Bar[] = batches
  .filter((batch) => planEnd(batch) + H2D_UNITS <= totalUnits)
  .map((batch) => solid({ start: planEnd(batch), end: planEnd(batch) + H2D_UNITS, label: 'H2D' }, laneColour.h2d))
const steps: Bar[] = Array.from({ length: STEPS }, (_, step) =>
  solid(
    { start: firstStepStart + step * STEP_UNITS, end: firstStepStart + (step + 1) * STEP_UNITS, label: `step ${step + 1}` },
    laneColour.kernel,
  ),
)

const rows = [
  ...Array.from({ length: WORKERS }, (_, worker) => ({ name: `worker ${worker + 1}`, bars: plans(worker) })),
  { name: 'main', bars: uploads },
  { name: 'device', bars: steps },
]
const legend: LegendItem[] = [
  { label: 'plan on the host', fill: laneColour.python },
  { label: 'h2d', fill: laneColour.h2d },
  { label: 'step', fill: laneColour.kernel },
]
</script>

<template>
  <div class="host-planner">
    <LaneChart :rows="rows" :total-units="totalUnits" />
    <LaneLegend :items="legend" />
  </div>
</template>

<style scoped>
.host-planner {
  margin-top: 88px;
}
</style>
