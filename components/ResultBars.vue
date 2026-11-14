<script setup lang="ts">
import { computed, onUnmounted, ref, watch } from 'vue'

const props = defineProps<{ step: number }>()

type Metric = { label: string; before: number; after: number; unit: string; digits: number }

const METRICS: Metric[] = [
  { label: 'Kernel count (NCCL 제외)', before: 30047, after: 4977, unit: '', digits: 0 },
  { label: 'GPU compute time', before: 1348.9, after: 896.0, unit: 'ms', digits: 1 },
  { label: 'align2 compute time', before: 110.9, after: 0, unit: 'ms', digits: 1 },
]

const FULL_WIDTH = 1100
const DURATION_MS = 1100

const progress = ref(props.step >= 1 ? 1 : 0)
let frame = 0

const easeInOut = (t: number) => (t < 0.5 ? 2 * t * t : 1 - (-2 * t + 2) ** 2 / 2)

const animateTo = (target: number) => {
  cancelAnimationFrame(frame)
  const from = progress.value
  const startedAt = performance.now()
  const tick = (now: number) => {
    const t = Math.min((now - startedAt) / DURATION_MS, 1)
    progress.value = from + (target - from) * easeInOut(t)
    if (t < 1) frame = requestAnimationFrame(tick)
  }
  frame = requestAnimationFrame(tick)
}

watch(() => props.step >= 1, (shrunk) => animateTo(shrunk ? 1 : 0))
onUnmounted(() => cancelAnimationFrame(frame))

const current = (m: Metric) => m.before + (m.after - m.before) * progress.value
const format = (m: Metric, value: number) =>
  `${value.toLocaleString('en-US', { minimumFractionDigits: m.digits, maximumFractionDigits: m.digits })}${m.unit}`
const change = (m: Metric) => Math.round((m.after / m.before - 1) * 100)

const showDelta = computed(() => progress.value > 0.98)
</script>

<template>
  <div class="bars">
    <div v-for="m in METRICS" :key="m.label" class="row">
      <div class="label">{{ m.label }}</div>
      <div class="track">
        <div class="ghost" :style="{ width: `${FULL_WIDTH}px` }" />
        <div class="fill" :style="{ width: `${(FULL_WIDTH * current(m)) / m.before}px` }" />
        <div class="value" :style="{ left: `${(FULL_WIDTH * current(m)) / m.before + 24}px` }">
          {{ format(m, current(m)) }}
          <span class="delta" :style="{ opacity: showDelta ? 1 : 0 }">{{ change(m) }}%</span>
        </div>
      </div>
    </div>
    <p class="note">8 rank × 11 step · 1 step = 2 micro-step · Host-Device Boundary + Kernel Optimization</p>
  </div>
</template>

<style scoped>
.bars {
  display: flex;
  flex-direction: column;
  gap: 56px;
}

.label {
  margin-bottom: 16px;
  font-size: 32px;
  color: var(--muted);
}

.track {
  position: relative;
  height: 72px;
}

.ghost,
.fill {
  position: absolute;
  left: 0;
  top: 0;
  height: 72px;
  border-radius: 10px;
}

.ghost {
  outline: 2px dashed #8a90a066;
  outline-offset: -2px;
}

.fill {
  background: var(--accent);
}

.value {
  position: absolute;
  top: 0;
  height: 72px;
  display: flex;
  align-items: center;
  gap: 20px;
  white-space: nowrap;
  font-family: var(--mono);
  font-size: 36px;
  font-weight: 600;
}

.delta {
  color: var(--compute);
  transition: opacity 0.3s;
}

.note {
  margin: 8px 0 0;
  font-size: 26px;
  color: var(--muted);
}
</style>
