<script setup lang="ts">
import { laneColour } from '../composables/laneColours'

const OPS = 13
const BREAKERS = [4, 9]

const isBreaker = (op: number) => BREAKERS.includes(op)
const varyingRegions = [-1, ...BREAKERS, OPS].flatMap((edge, index, edges) =>
  index === 0 ? [] : [[edges[index - 1] + 1, edge]],
)
const ROWS = [
  {
    name: 'small regions',
    note: 'a varying shape anywhere breaks the guard',
    regions: varyingRegions,
    broken: true,
    shape: 'dynamic shape',
  },
  {
    name: 'whole block',
    note: 'every guard holds',
    regions: [[0, OPS]],
    broken: false,
    shape: 'static shape',
  },
]
const centre = (op: number) => `calc(${op} * var(--pitch) + (var(--pitch) - var(--gap)) / 2)`
const midpoint = centre((BREAKERS[0] + BREAKERS.at(-1)!) / 2)
</script>

<template>
  <p class="claim">To widen the compile region, fix what the guards check</p>
  <div class="rows">
    <template v-for="row in ROWS" :key="row.name">
      <div class="ops">
        <span
          v-for="[from, to] in row.regions"
          :key="from"
          class="region"
          :style="{
            left: `calc(${from} * var(--pitch) - var(--inset))`,
            width: `calc(${to - from} * var(--pitch) - var(--gap) + 2 * var(--inset))`,
          }"
        />
        <i
          v-for="op in OPS"
          :key="op"
          :class="{ breaker: row.broken && isBreaker(op - 1) }"
          :style="{ background: row.broken && isBreaker(op - 1) ? undefined : laneColour.kernel }"
        />
        <span v-for="op in BREAKERS" :key="op" class="pointer" :style="{ left: centre(op) }">↑</span>
        <span class="shape" :style="{ left: midpoint }">{{ row.shape }}</span>
      </div>
      <div class="label">
        <h3>{{ row.name }}</h3>
        <p>{{ row.note }}</p>
      </div>
    </template>
  </div>
</template>

<style scoped>
.claim {
  margin: 8px 0 0;
  font-size: 40px;
  font-weight: 600;
}

.rows {
  --pitch: 64px;
  --gap: 14px;
  --inset: 10px;
  display: grid;
  grid-template-columns: auto 1fr;
  align-items: center;
  gap: 120px 64px;
  margin-top: 96px;
}

h3 {
  margin: 0;
  font-family: var(--mono);
  font-size: 30px;
  font-weight: 600;
}

.label p {
  margin: 8px 0 0;
  font-size: 24px;
  color: var(--muted);
}

.ops {
  position: relative;
  display: flex;
  gap: var(--gap);
  padding: 14px 0;
}

.ops i {
  width: calc(var(--pitch) - var(--gap));
  height: 44px;
  border-radius: 4px;
}

.ops i.breaker {
  background: #8a90a040;
}

.region {
  position: absolute;
  top: 0;
  bottom: 0;
  box-sizing: border-box;
  border: 3px solid var(--text);
  border-radius: 10px;
}

.pointer,
.shape {
  position: absolute;
  top: 100%;
  transform: translateX(-50%);
  font-family: var(--mono);
  color: var(--muted);
}

.pointer {
  margin-top: 4px;
  font-size: 22px;
}

.shape {
  margin-top: 36px;
  white-space: nowrap;
  font-size: 24px;
}
</style>
