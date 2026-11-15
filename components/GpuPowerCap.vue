<script setup lang="ts">
import telemetry from '../data/gpuClock.json'

const PLOT = { width: 800, height: 400 }
const REFERENCE = {
  title: 'NVML API Reference',
  href: 'https://docs.nvidia.com/deploy/archive/R550/nvml-api/group__nvmlClocksEventReasons.html',
  symbol: 'nvmlClocksEventReasonSwPowerCap',
  value: '0x4',
  text: 'The clocks have been optimized to ensure not to exceed currently set power limits',
}
const POWER = { from: 450, to: 725, ticks: [500, 550, 600, 650, 700] }
const CLOCK = { from: 1300, to: 2000, ticks: [1400, 1600, 1800, 2000] }

const SAMPLE = [
  { field: 'utilization.gpu', value: '100 %' },
  { field: 'power.draw', value: '681.80 W' },
  { field: 'clocks.current.sm', value: '1575 MHz' },
  { field: 'clocks_event_reasons.active', value: '0x0000000000000004', flagged: true },
]

const along = (watts: number) => ((watts - POWER.from) / (POWER.to - POWER.from)) * PLOT.width
const up = (mhz: number) => PLOT.height - ((mhz - CLOCK.from) / (CLOCK.to - CLOCK.from)) * PLOT.height
type Bin = (typeof telemetry.bins)[number]
type Quantile = 'p25' | 'p50' | 'p75'
const trace = (quantile: Quantile, bins: Bin[] = telemetry.bins) =>
  bins.map((bin) => `${along(bin.power_w)},${up(bin[quantile])}`).join(' ')
const band = (low: Quantile, high: Quantile) => `${trace(high)} ${trace(low, [...telemetry.bins].reverse())}`
</script>

<template>
  <div class="gpu-power-cap">
    <figure>
      <svg :width="PLOT.width" :height="PLOT.height">
        <line v-for="tick in CLOCK.ticks" :key="tick" class="grid" x1="0" :x2="PLOT.width" :y1="up(tick)" :y2="up(tick)" />
        <line class="limit" :x1="along(telemetry.tdp_w)" :x2="along(telemetry.tdp_w)" y1="0" :y2="PLOT.height" />
        <polygon class="range" :points="band('p25', 'p75')" />
        <polyline :points="trace('p50')" />
        <circle v-for="bin in telemetry.bins" :key="bin.power_w" class="bin" :cx="along(bin.power_w)" :cy="up(bin.p50)" r="7" />
        <text v-for="tick in CLOCK.ticks" :key="tick" x="-14" :y="up(tick) + 7" text-anchor="end">{{ tick.toLocaleString('en-US') }}</text>
        <text v-for="tick in POWER.ticks" :key="tick" :x="along(tick)" :y="PLOT.height + 34" text-anchor="middle">{{ tick }} W</text>
        <text :x="along(telemetry.tdp_w)" y="-14" text-anchor="middle">power limit</text>
      </svg>
      <figcaption>
        <span><i class="bin" />median</span>
        <span><i class="range" />q25 – q75</span>
        <span>GPU clock (MHz) while training</span>
      </figcaption>
    </figure>
    <aside>
      <div class="terminal">
        <p>$ nvidia-smi --query-gpu=… --format=csv</p>
        <p v-for="row in SAMPLE" :key="row.field" :class="{ flagged: row.flagged }">
          <span>{{ row.field }}</span>{{ row.value }}
        </p>
      </div>
      <SourceQuote class="reference" site="nvidia" :title="REFERENCE.title" :href="REFERENCE.href" :term="`${REFERENCE.symbol} = ${REFERENCE.value}`">
        {{ REFERENCE.text }}
      </SourceQuote>
    </aside>
  </div>
</template>

<style scoped>
.gpu-power-cap {
  display: grid;
  grid-template-columns: auto 1fr;
  align-items: start;
  gap: 72px;
  margin-top: 150px;
}

figure {
  margin: 0 0 0 76px;
}

svg {
  display: block;
  overflow: visible;
}

.grid {
  stroke: #8a90a033;
  stroke-width: 2;
}

.limit {
  stroke: #8a90a0;
  stroke-width: 2;
  stroke-dasharray: 6 8;
}

.range {
  fill: #8a90a0;
  fill-opacity: 0.22;
}

polyline {
  fill: none;
  stroke: var(--text);
  stroke-width: 3;
}

.bin {
  fill: var(--text);
}

text {
  fill: var(--muted);
  font-family: var(--mono);
  font-size: 20px;
}

figcaption {
  display: flex;
  align-items: center;
  gap: 36px;
  margin-top: 60px;
  font-size: 22px;
  color: var(--muted);
}

figcaption span {
  display: flex;
  align-items: center;
  gap: 10px;
}

figcaption i {
  width: 28px;
  height: 18px;
  border-radius: 4px;
  background: #8a90a0;
}

figcaption i.range {
  opacity: 0.3;
}

figcaption i.bin {
  width: 16px;
  height: 16px;
  border-radius: 50%;
  background: var(--text);
}
.terminal {
  margin-bottom: 20px;
  padding: 22px 28px;
  border-radius: 12px;
  background: #05060a;
  font-family: var(--mono);
  font-size: 20px;
  line-height: 1.6;
  color: var(--muted);
}

.terminal p {
  margin: 0;
  white-space: nowrap;
}

.terminal span {
  display: inline-block;
  width: 330px;
}

.terminal .flagged {
  color: var(--text);
}
.reference {
  margin-top: 36px;
}
</style>
