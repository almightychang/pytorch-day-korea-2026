<script setup lang="ts">
import { laneColour } from '../composables/laneColours'
import { idle, solid, waiting, type Bar, type LegendItem } from '../composables/lanes'

const CYCLES = 3
const PYTHON_UNITS = 2
const KERNEL_UNITS = 2
const D2H_UNITS = 0.4
const CYCLE_UNITS = PYTHON_UNITS + KERNEL_UNITS + D2H_UNITS
const totalUnits = CYCLES * CYCLE_UNITS

const host: Bar[] = []
const device: Bar[] = []
const copy: Bar[] = []
for (let cycle = 0; cycle < CYCLES; cycle++) {
  const start = cycle * CYCLE_UNITS
  const launched = start + PYTHON_UNITS
  const finished = launched + KERNEL_UNITS
  const copied = finished + D2H_UNITS
  host.push(solid({ start, end: launched }, laneColour.python))
  host.push(waiting({ start: launched, end: copied, label: 'waiting for the device' }))
  device.push(idle({ start: cycle ? start - D2H_UNITS : start, end: launched, label: 'waiting for the host' }))
  device.push(solid({ start: launched, end: finished, label: 'kernel' }, laneColour.kernel))
  copy.push(solid({ start: finished, end: copied }, laneColour.d2h))
}

const rows = [
  { name: 'host', bars: host },
  { name: 'device', bars: device },
  { name: 'copy', bars: copy },
]
const legend: LegendItem[] = [
  { label: 'python', fill: laneColour.python },
  { label: 'waiting for the GPU' },
  { label: 'kernel', fill: laneColour.kernel },
  { label: 'd2h', fill: laneColour.d2h },
]
</script>

<template>
  <div class="wait-cycle">
    <LaneChart :rows="rows" :total-units="totalUnits" />
    <LaneLegend :items="legend" />
  </div>
</template>

<style scoped>
.wait-cycle {
  margin-top: 160px;
}
</style>
