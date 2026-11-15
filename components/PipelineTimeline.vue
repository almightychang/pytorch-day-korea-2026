<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{ step: number }>()

const UNIT = 90
const H2D_LEN = 1
const COMPUTE_LEN = 3
const BATCHES = [0, 1, 2, 3]
const SEQUENTIAL_SPAN = BATCHES.length * (H2D_LEN + COMPUTE_LEN)

type Slot = { h2d: number; compute: number }

const sequential = (i: number): Slot => ({
  h2d: i * (H2D_LEN + COMPUTE_LEN),
  compute: i * (H2D_LEN + COMPUTE_LEN) + H2D_LEN,
})

const overlapped = (i: number): Slot => ({
  h2d: i === 0 ? 0 : H2D_LEN + (i - 1) * COMPUTE_LEN,
  compute: H2D_LEN + i * COMPUTE_LEN,
})

const showIdle = computed(() => props.step >= 1)
const isOverlapped = computed(() => props.step >= 2)
const slots = computed(() => BATCHES.map(isOverlapped.value ? overlapped : sequential))
const span = computed(() => slots.value.at(-1)!.compute + COMPUTE_LEN)

const idleBefore = (i: number) => {
  const previousEnd = i === 0 ? 0 : slots.value[i - 1].compute + COMPUTE_LEN
  return { start: previousEnd, length: slots.value[i].compute - previousEnd }
}

const px = (units: number) => `${units * UNIT}px`
</script>

<template>
  <div class="timeline">
    <div class="lane-label" style="top: 0">H2D</div>
    <div class="lane-label" style="top: 110px">Compute</div>

    <div class="track">
      <template v-for="i in BATCHES" :key="i">
        <div class="bar h2d" :style="{ left: px(slots[i].h2d), width: px(H2D_LEN) }">B{{ i }}</div>
        <div class="bar compute" :style="{ left: px(slots[i].compute), width: px(COMPUTE_LEN) }">batch {{ i }}</div>
        <div
          class="idle"
          :style="{
            left: px(idleBefore(i).start),
            width: px(idleBefore(i).length),
            opacity: showIdle && idleBefore(i).length > 0 ? 1 : 0,
          }"
        >idle</div>
      </template>

      <div class="span ghost" :style="{ width: px(SEQUENTIAL_SPAN), opacity: isOverlapped ? 1 : 0 }">
        <span>{{ SEQUENTIAL_SPAN }}u</span>
      </div>
      <div class="span" :style="{ width: px(span) }">
        <span>critical path {{ span }}u</span>
      </div>
      <div class="delta" :style="{ opacity: isOverlapped ? 1 : 0 }">
        −{{ Math.round((1 - span / SEQUENTIAL_SPAN) * 100) }}%
      </div>
    </div>

    <p class="note"><IllustrativeBadge class="badge" />H2D 1u, compute 3u, batch 4개 · pinned memory + transfer stream + CUDA event</p>
  </div>
</template>

<style scoped>
.timeline {
  position: relative;
  height: 620px;
}

.lane-label {
  position: absolute;
  left: 0;
  width: 160px;
  height: 80px;
  display: flex;
  align-items: center;
  font-size: 30px;
  color: var(--muted);
}

.badge {
  margin-right: 20px;
}

.track {
  position: absolute;
  left: 160px;
  top: 0;
  width: 1440px;
  height: 400px;
}

.bar,
.idle {
  position: absolute;
  height: 80px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 10px;
  font-family: var(--mono);
  font-size: 26px;
  transition: left 0.9s cubic-bezier(0.4, 0, 0.2, 1), width 0.9s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.4s;
}

.bar {
  box-shadow: inset 0 0 0 4px var(--bg);
  color: var(--bg);
  font-weight: 600;
}

.h2d {
  top: 0;
  background: var(--h2d);
}

.compute {
  top: 110px;
  background: var(--compute);
}

.idle {
  top: 110px;
  color: var(--accent);
  background: repeating-linear-gradient(-45deg, #ee4c2c33 0 10px, transparent 10px 20px);
  outline: 2px dashed var(--accent);
  outline-offset: -6px;
}

.span {
  position: absolute;
  left: 0;
  top: 250px;
  height: 0;
  border-top: 4px solid var(--text);
  transition: width 0.9s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.4s;
}

.span::after {
  content: '';
  position: absolute;
  right: 0;
  top: -16px;
  height: 28px;
  border-right: 4px solid var(--text);
}

.span span {
  position: absolute;
  right: 0;
  top: 20px;
  white-space: nowrap;
  font-size: 30px;
}

.span.ghost {
  top: 330px;
  border-top: 4px dashed var(--muted);
  color: var(--muted);
}

.span.ghost::after {
  border-right-color: var(--muted);
}

.delta {
  position: absolute;
  left: 0;
  top: 390px;
  font-size: 64px;
  font-weight: 800;
  color: var(--accent);
  transition: opacity 0.4s 0.6s;
}

.note {
  position: absolute;
  left: 0;
  bottom: 0;
  margin: 0;
  font-size: 26px;
  color: var(--muted);
}
</style>
