<script setup lang="ts">
import { laneColour } from '../composables/laneColours'
import { idle, solid, type Bar, type Handoff, type LegendItem } from '../composables/lanes'

const KERNELS = ['A', 'B', 'C', 'D', 'E']
const BASELINE_LAUNCHES_PER_STEP = 30047
const LAUNCH_UNITS = 2
const KERNEL_UNITS = 0.8
const HANDOFF_UNITS = 0.15
const totalUnits = KERNELS.length * LAUNCH_UNITS + KERNEL_UNITS

const launchEnd = (i: number) => (i + 1) * LAUNCH_UNITS
const launches: Bar[] = KERNELS.map((name, i) =>
  solid({ start: i * LAUNCH_UNITS, end: launchEnd(i), label: `launch ${name}` }, laneColour.python),
)
const kernels: Bar[] = KERNELS.map((name, i) =>
  solid({ start: launchEnd(i), end: launchEnd(i) + KERNEL_UNITS, label: name }, laneColour.kernel),
)
const gaps: Bar[] = KERNELS.slice(1).map((_, i) =>
  idle({ start: launchEnd(i) + KERNEL_UNITS, end: launchEnd(i + 1), label: 'idle' }),
)

const handoffs: Handoff[] = KERNELS.map((_, i) => ({
  from: launchEnd(i) - HANDOFF_UNITS,
  to: launchEnd(i) + HANDOFF_UNITS,
}))

const rows = [
  { name: 'host', bars: launches },
  { name: 'device', bars: [...gaps, ...kernels] },
]
const legend: LegendItem[] = [
  { label: 'launch', fill: laneColour.python },
  { label: 'kernel', fill: laneColour.kernel },
]
</script>

<template>
  <div class="launch-overhead">
    <LaneChart :rows="rows" :total-units="totalUnits" :handoffs="handoffs" />
    <LaneLegend :items="legend" />
    <p class="point">The device runs one kernel per launch, then waits for the next launch.</p>
    <p class="count">
      <b>{{ BASELINE_LAUNCHES_PER_STEP.toLocaleString('en-US') }}</b> kernel launches per step
      <span>Measured baseline · per rank, NCCL excluded · 1 step = 2 micro-steps</span>
    </p>
  </div>
  <SourceNote
    site="pytorch"
    title="Accelerating PyTorch with CUDA Graphs"
    detail="Figure 1, redrawn"
    href="https://pytorch.org/blog/accelerating-pytorch-with-cuda-graphs/"
  />
</template>

<style scoped>
.launch-overhead {
  margin-top: 72px;
}

.count {
  margin: 44px 0 0;
  font-size: 30px;
  color: var(--text);
}

.count b {
  font-size: 72px;
  font-weight: 800;
}

.count span {
  display: block;
  margin-top: 6px;
  font-size: 22px;
  color: var(--muted);
}

.point {
  margin: 64px 0 0;
  font-size: 30px;
  color: var(--text);
}
</style>
