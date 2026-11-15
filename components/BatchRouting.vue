<script setup lang="ts">
import { laneColour } from '../composables/laneColours'

const BEFORE = [
  [9, 2, 3, 8],
  [1, 2, 2, 1],
  [7, 6, 9, 5],
  [3, 1, 2, 4],
]
const PX_PER_COST = 21

const ranks = BEFORE.length
const microsteps = BEFORE[0].length
const heaviestFirst = BEFORE.flat().sort((a, b) => b - a)
const AFTER = Array.from({ length: ranks }, (_, rank) =>
  Array.from({ length: microsteps }, (_, step) => heaviestFirst[step * ranks + rank]),
)

const slowest = (plan: number[][], step: number) => Math.max(...plan.map((rank) => rank[step]))
const stepTime = (plan: number[][]) =>
  Array.from({ length: microsteps }, (_, step) => slowest(plan, step)).reduce((sum, cost) => sum + cost, 0)
const PLANS = [
  { title: 'before', costs: BEFORE },
  { title: 'after', costs: AFTER },
]
</script>

<template>
  <div class="batch-routing">
    <section v-for="plan in PLANS" :key="plan.title">
      <h3>{{ plan.title }} <b>{{ stepTime(plan.costs) }}</b></h3>
      <div v-for="(rank, index) in plan.costs" :key="index" class="rank">
        <span class="name">rank {{ index }}</span>
        <span
          v-for="(cost, step) in rank"
          :key="step"
          class="slot"
          :style="{ width: `${slowest(plan.costs, step) * PX_PER_COST}px` }"
        >
          <i :style="{ width: `${cost * PX_PER_COST}px` }">{{ cost }}</i>
        </span>
      </div>
    </section>
  </div>

  <p class="legend">
    <span><i class="work" />batch cost</span>
    <span><i class="wait" />waiting for the slowest rank</span>
    <span>step time = sum of the slowest batch in each micro-step</span>
    <IllustrativeBadge class="badge" />
  </p>
</template>

<style scoped>
.batch-routing {
  display: flex;
  justify-content: space-between;
  margin-top: 56px;
}

h3 {
  margin: 0 0 24px 110px;
  font-family: var(--mono);
  font-size: 26px;
  font-weight: 400;
  color: var(--muted);
}

h3 b {
  margin-left: 12px;
  font-size: 44px;
  font-weight: 600;
  color: var(--text);
}

.rank {
  display: flex;
  align-items: center;
  margin-bottom: 14px;
}

.name {
  width: 110px;
  font-family: var(--mono);
  font-size: 22px;
  color: var(--muted);
}

.slot {
  height: 56px;
  margin-right: 6px;
  border-radius: 4px;
  background: color-mix(in srgb, v-bind('laneColour.nccl') 30%, transparent);
}

.slot i {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  border-radius: 4px;
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
  margin: 40px 0 0;
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

.wait {
  background: color-mix(in srgb, v-bind('laneColour.nccl') 30%, transparent);
}

.badge {
  margin-left: auto;
}
</style>
