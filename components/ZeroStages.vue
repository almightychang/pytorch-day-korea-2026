<script setup lang="ts">
import { laneColour } from '../composables/laneColours'

type Holding = 'full' | 'own'
type Stage = { name: string; note: string; tensor: 'gradient' | 'parameters'; holding: Holding }

const RANKS = [0, 1, 2, 3]
const STAGES: Stage[] = [
  { name: 'micro-step', note: 'full gradient', tensor: 'gradient', holding: 'full' },
  { name: 'reduce', note: '1/N gradient', tensor: 'gradient', holding: 'own' },
  { name: 'update', note: '1/N parameters', tensor: 'parameters', holding: 'own' },
  { name: 'all-gather', note: 'full parameters', tensor: 'parameters', holding: 'full' },
]
const COLOURS = { gradient: laneColour.kernel, parameters: laneColour.dispatch }

const holds = (stage: Stage, rank: number, slice: number) => stage.holding === 'full' || slice === rank
</script>

<template>
  <div class="zero-stages">
    <div class="repeat"><span>× K micro-steps</span></div>
    <template v-for="(stage, index) in STAGES" :key="stage.name">
      <span v-if="index > 0" class="arrow">→</span>
      <section>
        <h3>{{ stage.name }}</h3>
        <p>{{ stage.note }}</p>
        <div v-for="rank in RANKS" :key="rank" class="rank">
          <span>r{{ rank }}</span>
          <i
            v-for="slice in RANKS"
            :key="slice"
            :style="{ background: holds(stage, rank, slice) ? COLOURS[stage.tensor] : undefined }"
          />
        </div>
      </section>
    </template>
  </div>
  <p class="legend">
    <span><i :style="{ background: COLOURS.gradient }" />gradient</span>
    <span><i :style="{ background: COLOURS.parameters }" />parameters</span>
  </p>
</template>

<style scoped>
.zero-stages {
  display: grid;
  grid-template-columns: repeat(7, auto);
  justify-content: space-between;
  align-items: center;
  gap: 0 32px;
  margin-top: 40px;
}

.repeat {
  position: relative;
  grid-column: 1 / 4;
  height: 20px;
  margin: 44px 0 28px;
  border: 3px solid var(--muted);
  border-bottom: none;
}

.repeat span {
  position: absolute;
  bottom: 100%;
  left: 50%;
  padding-bottom: 12px;
  transform: translateX(-50%);
  white-space: nowrap;
  font-family: var(--mono);
  font-size: 24px;
  color: var(--muted);
}

section,
.arrow {
  grid-row: 2;
}

.arrow {
  font-size: 48px;
  color: var(--muted);
}

h3 {
  margin: 0;
  font-family: var(--mono);
  font-size: 34px;
  font-weight: 600;
}

section > p {
  margin: 8px 0 28px;
  font-size: 24px;
  color: var(--muted);
}

.rank {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-top: 10px;
}

.rank span {
  width: 44px;
  font-family: var(--mono);
  font-size: 22px;
  color: var(--muted);
}

.rank i {
  width: 52px;
  height: 40px;
  background: #1a2028;
}

.legend {
  display: flex;
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
</style>
