<script setup lang="ts">
import { laneColour } from '../composables/laneColours'

const UNIT_PX = 34
const TENSORS = [
  { pieces: [4, 3], colour: laneColour.d2d },
  { pieces: [4], colour: laneColour.python },
  { pieces: [3, 3, 3], colour: laneColour.d2d },
  { pieces: [2], colour: '#8a90a0' },
  { pieces: [2, 4], colour: laneColour.python },
]
const length = (pieces: number[]) => pieces.reduce((sum, piece) => sum + piece, 0)
const longest = Math.max(...TENSORS.map((tensor) => length(tensor.pieces)))
const bucket = 2 ** Math.ceil(Math.log2(longest))
const px = (units: number) => `${units * UNIT_PX}px`
</script>

<template>
  <div class="input-contract">
    <section>
      <h3>host</h3>
      <div v-for="(tensor, index) in TENSORS" :key="index" class="tensor loose">
        <i v-for="(piece, part) in tensor.pieces" :key="part" :style="{ width: px(piece), background: tensor.colour }" />
      </div>
      <p>ragged length · mixed dtype · strided</p>
    </section>

    <div class="boundary"><span>H2D</span></div>

    <section>
      <h3>device</h3>
      <div v-for="(tensor, index) in TENSORS" :key="index" class="tensor" :style="{ width: px(bucket) }">
        <i :style="{ width: px(length(tensor.pieces)) }" />
      </div>
      <p>bucketed length · one dtype · contiguous</p>
    </section>
  </div>

  <IllustrativeBadge class="badge" />
</template>

<style scoped>
.input-contract {
  display: grid;
  grid-template-columns: 1fr 160px auto;
  align-items: center;
  margin-top: 64px;
}

h3 {
  margin: 0 0 28px;
  font-family: var(--mono);
  font-size: 24px;
  font-weight: 400;
  color: var(--muted);
}

.tensor {
  display: flex;
  height: 44px;
  margin-bottom: 18px;
  border-radius: 6px;
  background: color-mix(in srgb, v-bind('laneColour.kernel') 18%, transparent);
}

.tensor.loose {
  gap: 14px;
  background: none;
}

.tensor i {
  height: 100%;
  border-radius: 6px;
  background: v-bind('laneColour.kernel');
}

section p {
  margin: 28px 0 0;
  font-size: 24px;
  color: var(--muted);
}

.boundary {
  align-self: stretch;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 78px;
  border-left: 2px dashed #8a90a055;
}

.boundary span {
  padding: 2px 10px;
  border-radius: 4px;
  background: v-bind('laneColour.h2d');
  font-family: var(--mono);
  font-size: 18px;
  color: var(--bg);
}

.badge {
  margin-top: 40px;
  float: right;
}
</style>
