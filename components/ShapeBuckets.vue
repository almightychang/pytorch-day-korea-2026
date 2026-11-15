<script setup lang="ts">
import { laneColour } from '../composables/laneColours'

const BUCKET = 256
const LENGTHS = [196, 256, 225, 144]
const PX_PER_ELEMENT = 2.2

const distinct = new Set(LENGTHS).size
const px = (elements: number) => `${elements * PX_PER_ELEMENT}px`
</script>

<template>
  <div class="shape-buckets">
    <section>
      <h3>per micro-batch <b>{{ distinct }} shapes</b></h3>
      <div v-for="(length, index) in LENGTHS" :key="index" class="tensor">
        <i :style="{ width: px(length) }" />
        <span>{{ length }}</span>
      </div>
      <p class="compiles"><i v-for="shape in distinct" :key="shape">compile</i></p>
    </section>

    <span class="arrow">→</span>

    <section>
      <h3>bucketed <b>1 shape</b></h3>
      <div v-for="(length, index) in LENGTHS" :key="index" class="tensor">
        <span class="bucket" :style="{ width: px(BUCKET) }"><i :style="{ width: px(length) }" /></span>
        <span>{{ BUCKET }}</span>
      </div>
      <p class="compiles"><i>compile</i></p>
    </section>
  </div>

  <p class="legend">
    <span><i class="valid" />valid</span>
    <span><i class="padding" />padding</span>
    <span><i class="compile" />one compile per shape</span>
    <IllustrativeBadge class="badge" />
  </p>
</template>

<style scoped>
.shape-buckets {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 64px;
}

h3 {
  margin: 0 0 28px;
  font-family: var(--mono);
  font-size: 24px;
  font-weight: 400;
  color: var(--muted);
}

h3 b {
  margin-left: 16px;
  font-size: 36px;
  font-weight: 600;
  color: var(--text);
}

.tensor {
  display: flex;
  align-items: center;
  gap: 20px;
  margin-bottom: 18px;
  font-family: var(--mono);
  font-size: 24px;
  color: var(--text);
}

.tensor i,
.bucket {
  display: block;
  height: 48px;
  border-radius: 6px;
}

.tensor i {
  background: v-bind('laneColour.kernel');
}

.bucket {
  background: color-mix(in srgb, v-bind('laneColour.kernel') 22%, transparent);
}

.compiles {
  display: flex;
  gap: 10px;
  margin: 28px 0 0;
}

.compiles i {
  padding: 8px 18px;
  border-radius: 6px;
  background: v-bind('laneColour.python');
  font-family: var(--mono);
  font-size: 20px;
  font-style: normal;
  color: var(--bg);
}

.arrow {
  font-size: 44px;
  color: var(--muted);
}

.legend {
  display: flex;
  align-items: center;
  gap: 36px;
  margin: 44px 0 0;
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

.valid {
  background: v-bind('laneColour.kernel');
}

.padding {
  background: color-mix(in srgb, v-bind('laneColour.kernel') 22%, transparent);
}

.compile {
  background: v-bind('laneColour.python');
}

.badge {
  margin-left: auto;
}
</style>
