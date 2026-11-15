<script setup lang="ts">
import model from '../data/costModel.json'
import { THEMES } from '../composables/themes'

const PLOT = { width: 800, height: 440 }
const TOKENS = { from: 0, to: 14000, ticks: [4000, 8000, 12000] }
const TIME = { from: 200, to: 800, ticks: [400, 600, 800] }

const points = model.points as [number, number][]
const mean = (values: number[]) => values.reduce((sum, value) => sum + value, 0) / values.length
const tokens = points.map(([count]) => count)
const times = points.map(([, ms]) => ms)
const centred = (values: number[]) => values.map((value) => value - mean(values))
const dot = (a: number[], b: number[]) => a.reduce((sum, value, index) => sum + value * b[index], 0)
const [tokenSpread, timeSpread] = [centred(tokens), centred(times)]
const slope = dot(tokenSpread, timeSpread) / dot(tokenSpread, tokenSpread)
const fitted = (count: number) => mean(times) + slope * (count - mean(tokens))

const along = (count: number) => ((count - TOKENS.from) / (TOKENS.to - TOKENS.from)) * PLOT.width
const up = (ms: number) => PLOT.height - ((ms - TIME.from) / (TIME.to - TIME.from)) * PLOT.height
</script>

<template>
  <div class="cost-function">
    <figure>
      <svg :width="PLOT.width" :height="PLOT.height">
        <line class="frame" x1="0" :y1="PLOT.height" :x2="PLOT.width" :y2="PLOT.height" />
        <line class="frame" x1="0" y1="0" x2="0" :y2="PLOT.height" />
        <line class="fit" :x1="along(TOKENS.from)" :y1="up(fitted(TOKENS.from))" :x2="along(TOKENS.to)" :y2="up(fitted(TOKENS.to))" />
        <circle v-for="([count, ms], index) in points" :key="index" :cx="along(count)" :cy="up(ms)" r="5" />
        <text v-for="tick in TOKENS.ticks" :key="tick" :x="along(tick)" :y="PLOT.height + 32" text-anchor="middle">
          {{ tick.toLocaleString('en-US') }}
        </text>
        <text v-for="tick in TIME.ticks" :key="tick" x="-14" :y="up(tick) + 7" text-anchor="end">{{ tick }}</text>
      </svg>
      <figcaption class="tokens">tokens per micro-batch (with padding)</figcaption>
      <figcaption class="time">measured (ms)</figcaption>
    </figure>

    <section>
      <p class="formula">cost ≈ a + b × tokens</p>
      <p class="rest">+ vision patches, image count, …</p>
    </section>
  </div>
</template>

<style scoped>
.cost-function {
  display: grid;
  grid-template-columns: 1fr 610px;
  align-items: center;
  margin-top: 48px;
}

figure {
  position: relative;
  margin: 0 0 0 110px;
  width: v-bind('`${PLOT.width}px`');
}

svg {
  overflow: visible;
}

.frame {
  stroke: #8a90a0;
  stroke-width: 2;
}

.fit {
  stroke: #8a90a0;
  stroke-width: 2;
  stroke-dasharray: 6 8;
}

circle {
  fill: v-bind('THEMES.rank.colour');
  fill-opacity: 0.5;
}

text {
  fill: var(--muted);
  font-family: var(--mono);
  font-size: 20px;
}

figcaption {
  position: absolute;
  font-size: 22px;
  white-space: nowrap;
  color: var(--muted);
}

.tokens {
  left: 50%;
  bottom: -76px;
  transform: translateX(-50%);
}

.time {
  left: -92px;
  top: 50%;
  transform: translate(-50%, -50%) rotate(-90deg);
}

section {
  padding-left: 72px;
  white-space: nowrap;
}

.formula {
  margin: 0;
  font-family: var(--mono);
  font-size: 40px;
}

.rest {
  margin: 16px 0 0;
  font-family: var(--mono);
  font-size: 24px;
  color: var(--muted);
}
</style>
