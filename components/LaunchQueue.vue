<script setup lang="ts">
import { laneColour } from '../composables/laneColours'
import { solid, type Bar, type Handoff, type LegendItem } from '../composables/lanes'

const KERNELS = ['A', 'B', 'C']
const LAUNCH_UNITS = 0.75
const KERNEL_UNITS = 2.6
const HANDOFF_GAP_PX = 150

const launchEnd = (i: number) => (i + 1) * LAUNCH_UNITS
const kernelStart = (i: number) => LAUNCH_UNITS + i * KERNEL_UNITS
const totalUnits = kernelStart(KERNELS.length)

const launches: Bar[] = KERNELS.map((name, i) =>
  solid({ start: i * LAUNCH_UNITS, end: launchEnd(i), label: `launch ${name}` }, laneColour.python),
)
const hostWork = solid({ start: launchEnd(KERNELS.length - 1), end: totalUnits, label: 'host keeps running' }, laneColour.python)
const kernels: Bar[] = KERNELS.map((name, i) =>
  solid({ start: kernelStart(i), end: kernelStart(i) + KERNEL_UNITS, label: `kernel ${name}` }, laneColour.kernel),
)
const handoffs: Handoff[] = KERNELS.map((_, i) => ({ from: launchEnd(i), to: kernelStart(i), straight: true }))

const rows = [
  { name: 'host', bars: [...launches, hostWork] },
  { name: 'device', bars: kernels },
]
const legend: LegendItem[] = [
  { label: 'python', fill: laneColour.python },
  { label: 'kernel', fill: laneColour.kernel },
]
</script>

<template>
  <div class="launch-queue">
    <LaneChart :rows="rows" :total-units="totalUnits" :handoffs="handoffs" :handoff-gap="HANDOFF_GAP_PX" />
    <LaneLegend :items="legend" />
  </div>
  <blockquote>
    “A stream operates like a work-queue into which programs can add operations, such as memory copies or kernel
    launches, to be executed in order.”
  </blockquote>
  <SourceNote
    site="nvidia"
    title="CUDA Programming Guide"
    detail="2.5 Asynchronous Execution, figure redrawn"
    href="https://docs.nvidia.com/cuda/cuda-programming-guide/02-basics/asynchronous-execution.html"
  />
</template>

<style scoped>
.launch-queue {
  margin-top: 72px;
}

blockquote {
  margin: 64px 0 0;
  padding-left: 24px;
  border-left: 4px solid #8a90a066;
  font-size: 28px;
  line-height: 1.5;
  color: var(--text);
}
</style>
