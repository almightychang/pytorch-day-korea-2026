<script setup lang="ts">
import { laneColour } from '../composables/laneColours'
import { type Interval, mostSkewedMicrostep } from '../composables/rankSkew'
import { armByTag } from '../composables/timeline'

const TICK_MS = 250

const windows = mostSkewedMicrostep(armByTag('base'))
const fromMs = Math.min(...windows.map((window) => window.fromMs))
const toMs = Math.max(...windows.map((window) => window.toMs))
const slowest = windows.reduce((slow, window) => (window.forwardEndMs > slow.forwardEndMs ? window : slow))

const percent = (ms: number) => `${((ms - fromMs) / (toMs - fromMs)) * 100}%`
const span = ({ fromMs: from, toMs: to }: Interval) => ({ left: percent(from), width: `calc(${percent(to)} - ${percent(from)})` })
const ticks = Array.from(
  { length: Math.floor(toMs / TICK_MS) - Math.ceil(fromMs / TICK_MS) + 1 },
  (_, index) => (Math.ceil(fromMs / TICK_MS) + index) * TICK_MS,
)
</script>

<template>
  <div class="rank-skew">
    <span />
    <span class="heading">baseline · one micro-step · 8 ranks</span>
    <span class="heading wait">NCCL</span>

    <template v-for="window in windows" :key="window.rank">
      <span class="rank" :class="{ slowest: window === slowest }">rank {{ window.rank }}</span>
      <div class="track">
        <i class="work" :style="span(window)" />
        <i v-for="wait in window.waits" :key="wait.fromMs" class="nccl" :style="span(wait)" />
        <i class="forward-end" :style="{ left: percent(window.forwardEndMs) }" />
      </div>
      <span class="wait" :class="{ slowest: window === slowest }">{{ Math.round(window.waitMs) }} ms</span>
    </template>

    <span />
    <div class="ruler">
      <span v-for="tick in ticks" :key="tick" :style="{ left: percent(tick) }">{{ tick }}</span>
    </div>
  </div>

  <p class="legend">
    <span><i class="work" />forward + backward</span>
    <span><i class="nccl" />NCCL</span>
    <span><i class="forward-end" />forward ends</span>
  </p>
</template>

<style scoped>
.rank-skew {
  display: grid;
  grid-template-columns: 120px 1fr 130px;
  align-items: center;
  gap: 8px 0;
  margin-top: 28px;
  font-family: var(--mono);
  font-size: 22px;
  color: var(--muted);
}

.heading {
  margin-bottom: 6px;
  font-size: 20px;
}

.wait {
  text-align: right;
}

.slowest {
  color: var(--text);
}

.track {
  position: relative;
  height: 42px;
  background: #1a2028;
}

.track i {
  position: absolute;
  top: 0;
  bottom: 0;
}

.work {
  background: v-bind('laneColour.kernel');
  opacity: 0.55;
}

.nccl {
  background: v-bind('laneColour.nccl');
}

.forward-end {
  width: 3px;
  background: var(--text);
}

.legend {
  display: flex;
  gap: 36px;
  margin: 20px 0 0;
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

.legend i.forward-end {
  width: 3px;
  border-radius: 0;
}

.ruler {
  position: relative;
  height: 28px;
  font-size: 18px;
}

.ruler span {
  position: absolute;
  transform: translateX(-50%);
}
</style>
