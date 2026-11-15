<script setup lang="ts">
import { laneColour } from '../composables/laneColours'
import { solid, type Bar, type LegendItem, type Row, type Span } from '../composables/lanes'
import { sceneLegend, sceneRows } from '../composables/sceneLanes'
import { scenes } from '../scenes'

const H2D_UNITS = 1.2
const LANE_ORDER = ['host', 'copy', 'device']

const forward = scenes.implicitD2h
const totalUnits = H2D_UNITS + forward.totalUnits

const duration = (spans: Span[]) => spans.reduce((sum, span) => sum + span.end - span.start, 0)
const planUnits = duration(forward.host.filter((span) => span.state === 'python'))
const kernelUnits = duration(forward.kernels)

const upload = (start: number): Bar => solid({ start, end: start + H2D_UNITS, label: 'H2D' }, laneColour.h2d)
const later = (bar: Bar, units: number): Bar => ({ ...bar, start: bar.start + units, end: bar.end + units, label: undefined })
const inOrder = (rows: Row[]) => LANE_ORDER.map((lane) => rows.find((row) => row.name === lane)!)

const asIs: Row[] = inOrder(sceneRows(forward)).map((row) => ({
  ...row,
  bars: [...(row.name === 'copy' ? [upload(0)] : []), ...row.bars.map((bar) => later(bar, H2D_UNITS))],
}))

const computeStart = planUnits + H2D_UNITS
const toBe: Row[] = inOrder([
  { name: 'host', bars: [solid({ start: 0, end: planUnits, label: 'plan' }, laneColour.python)] },
  { name: 'copy', bars: [upload(planUnits)] },
  { name: 'device', bars: [solid({ start: computeStart, end: computeStart + kernelUnits, label: 'forward' }, laneColour.kernel)] },
])

const legend: LegendItem[] = [...sceneLegend(forward), { label: 'h2d', fill: laneColour.h2d }]
</script>

<template>
  <section>
    <h3>as-is</h3>
    <LaneChart :rows="asIs" :total-units="totalUnits" />
  </section>
  <section>
    <h3>to-be</h3>
    <LaneChart :rows="toBe" :total-units="totalUnits" />
  </section>
  <LaneLegend :items="legend" />
</template>

<style scoped>
section {
  margin-top: 48px;
}

h3 {
  margin: 0 0 18px;
  font-family: var(--mono);
  font-size: 24px;
  font-weight: 400;
  color: var(--muted);
}
</style>
