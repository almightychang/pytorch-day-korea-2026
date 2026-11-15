<script setup lang="ts">
import { useIsSlideActive } from '@slidev/client'
import { computed, onMounted, onUnmounted, ref, watch } from 'vue'
import { laneColour } from '../composables/laneColours'

type Kernel = { ops: string[]; reads: string[]; write: string }
type Move = { tensor: string; kernel: number; direction: 'load' | 'store'; start: number }
type Step = { kind: 'transfer' | 'compute'; start: number; duration: number }

const props = defineProps<{ fused?: boolean }>()

const SEPARATE: Kernel[] = [
  { ops: ['mul'], reads: ['x', 'w'], write: 't1' },
  { ops: ['add'], reads: ['t1', 'b'], write: 't2' },
  { ops: ['sigmoid'], reads: ['t2'], write: 'y' },
]
const FUSED: Kernel[] = [{ ops: SEPARATE.flatMap((kernel) => kernel.ops), reads: ['x', 'w', 'b'], write: 'y' }]
const kernels = props.fused ? FUSED : SEPARATE

const intermediates = new Set(kernels.slice(0, -1).map((kernel) => kernel.write))
const widestKernel = Math.max(...kernels.map((kernel) => kernel.reads.length))
const readCount = kernels.reduce((sum, kernel) => sum + kernel.reads.length, 0)

const MOVE_MS = 850
const COMPUTE_MS = 450
const KERNEL_GAP_MS = 500
const SLOT_PX = 136
const STAGE_PX = 520
const LEVEL_PX = 140
const TRAVEL_PX = 176

const moves: Move[] = []
const steps: Step[] = []
let clock = 0
const move = (tensor: string, kernel: number, direction: Move['direction']) => {
  moves.push({ tensor, kernel, direction, start: clock })
  steps.push({ kind: 'transfer', start: clock, duration: MOVE_MS })
  clock += MOVE_MS
}
kernels.forEach((kernel, index) => {
  for (const tensor of kernel.reads) move(tensor, index, 'load')
  for (const _ of kernel.ops) {
    steps.push({ kind: 'compute', start: clock, duration: COMPUTE_MS })
    clock += COMPUTE_MS
  }
  move(kernel.write, index, 'store')
  clock += KERNEL_GAP_MS
})
const opCount = kernels.reduce((sum, kernel) => sum + kernel.ops.length, 0)
const totalMs = clock

const now = ref(totalMs)
const isActive = useIsSlideActive()
let frame = 0

const progress = (move: Move) => Math.min(Math.max((now.value - move.start) / MOVE_MS, 0), 1)
const ease = (t: number) => (t < 0.5 ? 2 * t * t : 1 - (-2 * t + 2) ** 2 / 2)
const storeOf = (kernel: number) => moves.find((move) => move.kernel === kernel && move.direction === 'store')!

const isDone = (step: Step) => now.value >= step.start + step.duration
const done = computed(() => moves.filter((move) => progress(move) === 1).length)
const isStoring = (kernel: number) => progress(storeOf(kernel)) > 0
const isAirborne = (move: Move) =>
  now.value >= move.start && (move.direction === 'load' ? !isStoring(move.kernel) : progress(move) < 1)
const column = (move: Move) =>
  move.direction === 'load' ? kernels[move.kernel].reads.indexOf(move.tensor) : (widestKernel - 1) / 2
const firstColumn = (STAGE_PX - widestKernel * SLOT_PX) / 2
const flights = computed(() =>
  moves.filter(isAirborne).map((move) => {
    const lift = move.direction === 'load' ? ease(progress(move)) : 1 - ease(progress(move))
    return { ...move, left: firstColumn + column(move) * SLOT_PX, top: (1 - lift) * TRAVEL_PX }
  }),
)

const play = () => {
  cancelAnimationFrame(frame)
  const startedAt = performance.now()
  const tick = (at: number) => {
    now.value = Math.min(at - startedAt, totalMs)
    if (now.value < totalMs) frame = requestAnimationFrame(tick)
  }
  frame = requestAnimationFrame(tick)
}

onMounted(play)
watch(isActive, (active) => active && play())
onUnmounted(() => cancelAnimationFrame(frame))
</script>

<template>
  <div class="tensor-traffic">
    <section class="summary">
      <h3>{{ kernels.length }} {{ kernels.length > 1 ? 'kernels' : 'kernel' }}</h3>
      <div v-for="kernel in kernels" :key="kernel.write" class="row">
        <span class="reads">
          <span v-for="name in kernel.reads" :key="name" class="memory" :class="{ intermediate: intermediates.has(name) }">
            {{ name }}
          </span>
        </span>
        <span class="arrow">→</span>
        <span class="op">{{ kernel.ops.join(' · ') }}</span>
        <span class="arrow">→</span>
        <span class="memory" :class="{ intermediate: intermediates.has(kernel.write) }">{{ kernel.write }}</span>
      </div>
    </section>

    <section class="traffic">
      <p class="count">
        <b>{{ done }}</b> memory operations
        <span>
          <i class="transfer" />{{ readCount }} reads + {{ kernels.length }} {{ kernels.length > 1 ? 'writes' : 'write' }}
          <i class="compute" />{{ opCount }} computes
        </span>
      </p>
      <div class="ticks">
        <i v-for="(step, index) in steps" :key="index" :class="[step.kind, { done: isDone(step) }]" />
      </div>
      <div class="stage" :style="{ width: `${STAGE_PX}px`, height: `${TRAVEL_PX + LEVEL_PX}px` }">
        <div class="level registers">kernel · registers</div>
        <div class="level hbm" :style="{ top: `${TRAVEL_PX}px` }">global memory (HBM)</div>
        <span
          v-for="flight in flights"
          :key="`${flight.kernel}-${flight.tensor}-${flight.direction}`"
          class="flight"
          :class="{ intermediate: intermediates.has(flight.tensor) }"
          :style="{ left: `${flight.left}px`, transform: `translateY(${flight.top}px)` }"
        >
          {{ flight.tensor }}
        </span>
      </div>
    </section>
  </div>

  <SourceNote
    site="pytorch"
    title="Why Is PyTorch Compile So Fast: Kernel Fusion"
    detail="example and counts"
    href="https://pytorch.org/blog/why-is-pytorch-compile-so-fast-kernel-fusion/"
  />
</template>

<style scoped>
.tensor-traffic {
  display: grid;
  grid-template-columns: 1fr 1fr;
  place-items: center;
  margin-top: 40px;
}

h3 {
  margin: 0 0 28px;
  font-size: 30px;
  font-weight: 600;
}

.row {
  display: flex;
  align-items: center;
  gap: 14px;
  margin-bottom: 14px;
}

.reads {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  width: 232px;
}

.memory,
.op {
  height: 64px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 8px;
  font-family: var(--mono);
  font-size: 24px;
}

.memory {
  width: 72px;
  border: 3px dashed #8a90a099;
  color: var(--text);
}

.memory.intermediate {
  border-style: solid;
  border-color: v-bind('laneColour.d2d');
  background: color-mix(in srgb, v-bind('laneColour.d2d') 40%, transparent);
}

.op {
  min-width: 150px;
  padding: 0 20px;
  background: v-bind('laneColour.kernel');
  color: var(--bg);
}

.arrow {
  font-size: 26px;
  color: var(--muted);
}

.ticks {
  display: flex;
  gap: 8px;
  margin-top: 20px;
}

.ticks i {
  width: 36px;
  height: 12px;
  border-radius: 3px;
  background: #8a90a033;
}

.ticks i.done.transfer,
.count i.transfer {
  background: #8a90a0;
}

.ticks i.done.compute,
.count i.compute {
  background: v-bind('laneColour.kernel');
}

.stage {
  position: relative;
  margin-top: 28px;
}

.level {
  position: absolute;
  left: 0;
  right: 0;
  height: v-bind("`${LEVEL_PX}px`");
  padding: 12px 20px;
  border-radius: 12px;
  font-family: var(--mono);
  font-size: 20px;
  color: var(--muted);
}

.registers {
  top: 0;
  border: 3px solid v-bind('laneColour.kernel');
}

.hbm {
  border: 3px dashed #8a90a099;
}

.flight {
  position: absolute;
  top: 52px;
  width: 116px;
  height: 68px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 8px;
  background: v-bind('laneColour.kernel');
  font-family: var(--mono);
  font-size: 26px;
  color: var(--bg);
}

.flight.intermediate {
  background: v-bind('laneColour.d2d');
  color: var(--text);
}

.count {
  margin: 0;
  font-size: 30px;
  white-space: nowrap;
  color: var(--text);
}

.count b {
  display: inline-block;
  min-width: 48px;
  font-size: 72px;
  font-weight: 800;
  line-height: 1;
}

.count span {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-top: 8px;
  font-size: 22px;
  color: var(--muted);
}

.count i {
  width: 18px;
  height: 18px;
  border-radius: 4px;
}

.count i.compute {
  margin-left: 18px;
}
</style>
