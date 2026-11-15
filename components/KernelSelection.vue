<script setup lang="ts">
import { laneColour } from '../composables/laneColours'

const ALIGNMENT = 8
const ALIGNED_TIME_RATIO = 0.34
const SLOW_BAR_PX = 620
const SHOWN_BLOCKS = 3

const shape = (channels: number, kernel: string, timeRatio: number) => ({
  channels,
  blocks: Math.floor(channels / ALIGNMENT),
  remainder: channels % ALIGNMENT,
  kernel,
  barPx: SLOW_BAR_PX * timeRatio,
})
const SHAPES = [shape(10922, 'SM80 CUTLASS align2', 1), shape(10928, 'SM90 nvjet', ALIGNED_TIME_RATIO)]
const lastBlockCells = (remainder: number) => remainder || ALIGNMENT
const formula = ({ blocks, remainder }: (typeof SHAPES)[number]) =>
  `${blocks.toLocaleString('en-US')} × ${ALIGNMENT}${remainder ? ` + ${remainder}` : ''}`
</script>

<template>
  <p class="origin"><code>hidden = int(2 / 3 × 4096 × 4)</code> = 10,922 channels · bf16, 2 bytes each</p>

  <div v-for="item in SHAPES" :key="item.channels" class="shape">
    <p class="size">
      <b>{{ item.channels.toLocaleString('en-US') }}</b>
      <span>= {{ formula(item) }}</span>
    </p>
    <div class="blocks">
      <span v-for="block in SHOWN_BLOCKS" :key="block" class="block"><i v-for="cell in ALIGNMENT" :key="cell" class="filled" /></span>
      <span class="ellipsis">…</span>
      <span class="block" :class="{ ragged: item.remainder }">
        <i v-for="cell in ALIGNMENT" :key="cell" :class="{ filled: cell <= lastBlockCells(item.remainder) }" />
      </span>
    </div>
    <div class="kernel">
      <span class="bar" :style="{ width: `${item.barPx}px` }" :class="{ slow: item.remainder }" />
      <span class="name">{{ item.kernel }}</span>
    </div>
  </div>

  <p class="foot">
    Blocks of {{ ALIGNMENT }} channels = 16 bytes. Bar length: measured GEMM time, isolated on H200 (aligned takes 0.30–0.38×).
  </p>
  <p class="quote">
    “each FP16 element is represented by 2 bytes, so matrix dimensions would need to be multiples of 8 elements”
  </p>
  <SourceNote
    site="nvidia"
    title="Matrix Multiplication Background User’s Guide"
    href="https://docs.nvidia.com/deeplearning/performance/dl-performance-matrix-multiplication/index.html"
  />
</template>

<style scoped>
.origin {
  margin: 48px 0 44px;
  font-size: 26px;
  color: var(--muted);
}

.origin code {
  font-family: var(--mono);
  color: var(--text);
}

.shape {
  display: grid;
  grid-template-columns: 330px 520px 1fr;
  align-items: center;
  gap: 24px;
  margin-bottom: 36px;
}

.size {
  margin: 0;
  font-family: var(--mono);
}

.size b {
  display: block;
  font-size: 44px;
}

.size span {
  font-size: 22px;
  color: var(--muted);
}

.blocks {
  display: flex;
  align-items: center;
  gap: 10px;
}

.block {
  display: flex;
  gap: 3px;
  padding: 6px;
  border: 2px solid #8a90a066;
  border-radius: 6px;
}

.block.ragged {
  border-color: v-bind('laneColour.align2');
}

.block i {
  width: 9px;
  height: 36px;
  border-radius: 2px;
  background: #8a90a033;
}

.block i.filled {
  background: var(--muted);
}

.ellipsis {
  font-size: 28px;
  color: var(--muted);
}

.kernel {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.bar {
  height: 40px;
  border-radius: 4px;
  background: v-bind('laneColour.kernel');
}

.bar.slow {
  background: v-bind('laneColour.align2');
}

.name {
  font-family: var(--mono);
  font-size: 22px;
  color: var(--text);
}

.foot {
  margin: 20px 0 0;
  font-size: 24px;
  color: var(--text);
}

.quote {
  margin: 40px 0 0;
  padding-left: 20px;
  border-left: 4px solid #8a90a066;
  font-size: 24px;
  color: var(--muted);
}
</style>
