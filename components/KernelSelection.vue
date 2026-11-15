<script setup lang="ts">
import type { Piece, Source } from '../composables/codeLanes'
import { laneColour } from '../composables/laneColours'

const ALIGNMENT = 8
const CHANNELS = 10922
const BAR_PX_PER_MS = 280
const SHOWN_BLOCKS = 3

const SOURCE: Source = {
  repo: 'facebookresearch/dinov2@81b2b64',
  path: 'dinov2/layers/swiglu_ffn.py#L27-L28',
  symbol: 'SwiGLUFFN.__init__',
  users: 'used by LightningDiT, RLDX-1',
}
const CODE: Piece[][] = [
  [['self.w12 = nn.Linear(in_features, 2 * ', 'plain'], ['hidden_features', 'shape'], [', bias=bias)', 'plain']],
  [['self.w3 = nn.Linear(', 'plain'], ['hidden_features', 'shape'], [', out_features, bias=bias)', 'plain']],
]

const blocks = Math.floor(CHANNELS / ALIGNMENT)
const remainder = CHANNELS % ALIGNMENT
const channels = CHANNELS.toLocaleString('en-US')
const KERNELS = [
  { name: 'SM80 CUTLASS align2', ms: 3.219, selected: true },
  { name: 'SM90 nvjet', ms: 0.971, selected: false },
]
</script>

<template>
  <CodeSnippet :source="SOURCE" :code="CODE" />

  <div class="shape">
    <p class="size">
      <span>hidden_features =</span> <b>{{ channels }}</b>
      <span>= {{ blocks.toLocaleString('en-US') }} × {{ ALIGNMENT }} + {{ remainder }}</span>
    </p>
    <div class="blocks">
      <span v-for="block in SHOWN_BLOCKS" :key="block" class="block"><i v-for="cell in ALIGNMENT" :key="cell" class="filled" /></span>
      <span class="ellipsis">…</span>
      <span class="block ragged"><i v-for="cell in ALIGNMENT" :key="cell" :class="{ filled: cell <= remainder }" /></span>
    </div>
  </div>

  <div v-for="kernel in KERNELS" :key="kernel.name" class="kernel" :class="{ selected: kernel.selected }">
    <span class="name">{{ kernel.name }}</span>
    <span class="bar" :style="{ width: `${BAR_PX_PER_MS * kernel.ms}px` }" />
    <span class="time">{{ kernel.ms.toFixed(2) }} ms</span>
  </div>

  <p class="foot">Measured GEMM time of <code>w3</code> forward · 8,384 tokens · bf16 · isolated on H200.</p>
  <SourceNote
    site="nvidia"
    title="Matrix Multiplication Background User’s Guide"
    detail="“matrix dimensions would need to be multiples of 8 elements” (FP16)"
    href="https://docs.nvidia.com/deeplearning/performance/dl-performance-matrix-multiplication/index.html"
  />
</template>

<style scoped>
.shape {
  display: flex;
  align-items: center;
  gap: 56px;
  margin-bottom: 76px;
}

.size {
  margin: 0;
  font-family: var(--mono);
  font-size: 24px;
  color: var(--muted);
}

.size b {
  margin: 0 12px;
  font-size: 40px;
  color: var(--text);
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
  height: 32px;
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
  display: grid;
  grid-template-columns: 300px auto 1fr;
  align-items: center;
  gap: 20px;
  margin-bottom: 16px;
  font-family: var(--mono);
  font-size: 22px;
  color: var(--muted);
}

.bar {
  height: 40px;
  border-radius: 4px;
  background: v-bind('laneColour.kernel');
  opacity: 0.55;
}

.kernel .name,
.kernel .time {
  color: var(--text);
}

.kernel.selected .bar {
  background: v-bind('laneColour.align2');
  opacity: 1;
}

.foot {
  margin: 28px 0 0;
  font-size: 22px;
  color: var(--muted);
}

.foot code {
  font-family: var(--mono);
}
</style>
