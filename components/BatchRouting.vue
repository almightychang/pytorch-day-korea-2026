<script setup lang="ts">
import { computed } from 'vue'
import { laneColour } from '../composables/laneColours'

const props = defineProps<{ step: number }>()

const COSTS = [
  [9, 2, 3, 8],
  [1, 2, 2, 1],
  [7, 6, 9, 5],
  [3, 1, 2, 4],
]
const PX_PER_COST = 44
const ROW_PX = 64
const ROW_GAP_PX = 14
const COLUMN_GAP_PX = 8

type Slot = { rank: number; micro: number }
const ranks = COSTS.length
const micros = COSTS[0].length
const collated = COSTS.flatMap((row, rank) => row.map((cost, micro) => ({ cost, collated: { rank, micro } })))
const batches = [...collated]
  .sort((a, b) => b.cost - a.cost)
  .map((batch, order) => ({ ...batch, routed: { rank: order % ranks, micro: Math.floor(order / ranks) } }))

const plan = computed(() => (props.step >= 1 ? 'routed' : 'collated'))
const slowest = computed(() =>
  Array.from({ length: micros }, (_, micro) =>
    Math.max(...batches.filter((batch) => batch[plan.value].micro === micro).map((batch) => batch.cost)),
  ),
)
const columnLeft = (micro: number) =>
  slowest.value.slice(0, micro).reduce((left, cost) => left + cost * PX_PER_COST + COLUMN_GAP_PX, 0)
const stepTime = computed(() => slowest.value.reduce((sum, cost) => sum + cost, 0))
const stepWidth = computed(() => columnLeft(micros) - COLUMN_GAP_PX)
const place = ({ rank, micro }: Slot, cost: number) => ({
  left: `${columnLeft(micro)}px`,
  top: `${rank * (ROW_PX + ROW_GAP_PX)}px`,
  width: `${cost * PX_PER_COST}px`,
  height: `${ROW_PX}px`,
})
const slots: Slot[] = Array.from({ length: ranks * micros }, (_, index) => ({
  rank: Math.floor(index / micros),
  micro: index % micros,
}))
</script>

<template>
  <div class="span" :style="{ width: `${stepWidth}px` }"><b>{{ stepTime }}</b></div>
  <div class="batch-routing" :style="{ height: `${ranks * (ROW_PX + ROW_GAP_PX)}px` }">
    <span v-for="rank in ranks" :key="rank" class="name" :style="{ top: `${(rank - 1) * (ROW_PX + ROW_GAP_PX)}px`, height: `${ROW_PX}px` }">
      rank {{ rank - 1 }}
    </span>
    <div class="plot">
      <span v-for="slot in slots" :key="`${slot.rank}-${slot.micro}`" class="wait" :style="place(slot, slowest[slot.micro])" />
      <i v-for="(batch, index) in batches" :key="index" class="batch" :style="place(batch[plan], batch.cost)">{{ batch.cost }}</i>
    </div>
  </div>

  <p class="legend">
    <span><i class="work" />batch cost</span>
    <span><i class="waiting" />waiting for the slowest rank</span>
    <IllustrativeBadge class="badge" />
  </p>
</template>

<style scoped>
.batch-routing {
  position: relative;
  margin-top: 28px;
}

.span {
  position: relative;
  display: flex;
  justify-content: center;
  margin: 80px 0 0 110px;
  border-top: 3px solid var(--muted);
  transition: width 0.9s ease;
}

.span::before,
.span::after {
  content: '';
  position: absolute;
  top: -10px;
  border: 8px solid transparent;
}

.span::before {
  left: -2px;
  border-right: 14px solid var(--muted);
  border-left: 0;
}

.span::after {
  right: -2px;
  border-left: 14px solid var(--muted);
  border-right: 0;
}

.span b {
  margin-top: -24px;
  padding: 0 16px;
  background: var(--bg);
  font-family: var(--mono);
  font-size: 32px;
  font-weight: 600;
}

.name {
  position: absolute;
  left: 0;
  display: flex;
  align-items: center;
  font-family: var(--mono);
  font-size: 22px;
  color: var(--muted);
}

.plot {
  position: absolute;
  left: 110px;
  top: 0;
}

.wait,
.batch {
  position: absolute;
  border-radius: 4px;
  transition:
    left 0.9s ease,
    top 0.9s ease,
    width 0.9s ease;
}

.wait {
  background: color-mix(in srgb, v-bind('laneColour.nccl') 30%, transparent);
}

.batch {
  display: flex;
  align-items: center;
  justify-content: center;
  background: v-bind('laneColour.kernel');
  font-family: var(--mono);
  font-size: 20px;
  font-style: normal;
  color: var(--bg);
}

.legend {
  display: flex;
  align-items: center;
  gap: 36px;
  margin: 48px 0 0;
  font-size: 22px;
  color: var(--muted);
}

.legend span {
  display: flex;
  align-items: center;
  gap: 10px;
}

.legend i {
  width: 18px;
  height: 18px;
  border-radius: 4px;
}

.work {
  background: v-bind('laneColour.kernel');
}

.waiting {
  background: color-mix(in srgb, v-bind('laneColour.nccl') 30%, transparent);
}

.badge {
  margin-left: auto;
}
</style>
