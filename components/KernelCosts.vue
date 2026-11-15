<script setup lang="ts">
import { laneColour } from '../composables/laneColours'

const BASELINE_KERNELS_PER_STEP = 30047

const STAGES = ['launch', 'load', 'compute', 'store']

const BOTTLENECKS = [
  {
    name: 'CPU-bound',
    where: 'on the host',
    stages: ['launch'],
    fill: laneColour.python,
  },
  {
    name: 'Memory-bound',
    where: 'on the device',
    stages: ['load', 'store'],
    fill: laneColour.kernel,
  },
]
</script>

<template>
  <div class="kernel-costs">
    <section v-for="bottleneck in BOTTLENECKS" :key="bottleneck.name">
      <h3>{{ bottleneck.name }}</h3>
      <p class="where">{{ bottleneck.where }}</p>
      <div class="stages">
        <template v-for="(stage, i) in STAGES" :key="stage">
          <span v-if="i" class="arrow">→</span>
          <span
            class="stage"
            :class="{ slow: bottleneck.stages.includes(stage) }"
            :style="{ '--fill': bottleneck.fill }"
          >
            {{ stage }}
          </span>
        </template>
      </div>
    </section>
  </div>
  <p class="count">
    <b>{{ BASELINE_KERNELS_PER_STEP.toLocaleString('en-US') }}</b> kernels per step
    <span>Measured baseline · per rank, NCCL excluded · 1 step = 2 micro-steps</span>
  </p>
</template>

<style scoped>
.count {
  margin: 72px 0 0;
  font-size: 30px;
  color: var(--text);
}

.count b {
  font-size: 72px;
  font-weight: 800;
}

.count span {
  display: block;
  margin-top: 4px;
  font-size: 22px;
  color: var(--muted);
}

.kernel-costs {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 48px;
  margin-top: 64px;
}

section {
  padding: 56px 56px 64px;
  border-radius: 16px;
  background: var(--panel);
}

h3 {
  margin: 0;
  font-size: 44px;
  font-weight: 800;
}

.where {
  margin: 10px 0 52px;
  font-family: var(--mono);
  font-size: 22px;
  color: var(--muted);
}

.stages {
  display: flex;
  align-items: center;
  gap: 12px;
}

.stage {
  height: 60px;
  padding: 0 22px;
  display: flex;
  align-items: center;
  border: 2px solid #8a90a044;
  border-radius: 8px;
  font-family: var(--mono);
  font-size: 22px;
  color: var(--muted);
}

.stage.slow {
  border-color: var(--fill);
  background: var(--fill);
  color: var(--bg);
}

.arrow {
  font-size: 24px;
  color: var(--muted);
}
</style>
