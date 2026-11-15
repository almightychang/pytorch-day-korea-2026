<script setup lang="ts">
import { laneColour } from '../composables/laneColours'

const SAMPLES = [
  { images: 3, instructionPx: 230, tokens: 14 },
  { images: 1, instructionPx: 120, tokens: 5 },
]
const RANKS = [
  { name: 'rank 0', work: 1 },
  { name: 'rank 6', work: 0.5 },
]
const FULL_WORK_PX = 250
</script>

<template>
  <div class="skew-cause">
    <section>
      <h3>Dataset variation</h3>
      <div class="figure">
        <div v-for="(sample, index) in SAMPLES" :key="index" class="sample">
          <span class="images"><i v-for="image in sample.images" :key="image" /></span>
          <span class="instruction" :style="{ width: `${sample.instructionPx}px` }" />
        </div>
      </div>
      <p>number of images, instruction length</p>
    </section>

    <span class="arrow">→</span>

    <section>
      <h3>Token counts</h3>
      <div class="figure">
        <div v-for="(sample, index) in SAMPLES" :key="index" class="tokens">
          <i v-for="token in sample.tokens" :key="token" />
        </div>
      </div>
      <p>per sample</p>
    </section>

    <span class="arrow">→</span>

    <section>
      <h3>Rank skew</h3>
      <div class="figure">
        <div v-for="rank in RANKS" :key="rank.name" class="rank">
          <span>{{ rank.name }}</span>
          <i :style="{ width: `${FULL_WORK_PX * rank.work}px` }" />
        </div>
      </div>
      <p>in the same micro-step</p>
    </section>
  </div>

  <IllustrativeBadge class="badge" />
</template>

<style scoped>
.skew-cause {
  display: grid;
  grid-template-columns: 1fr 72px 1fr 72px 1fr;
  align-items: center;
  margin-top: 104px;
}

section {
  height: 400px;
  padding: 40px;
  border-radius: 16px;
  background: var(--panel);
}

h3 {
  margin: 0;
  font-size: 32px;
  font-weight: 600;
}

.figure {
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 28px;
  height: 208px;
}

section p {
  margin: 0;
  font-size: 24px;
  color: var(--muted);
}

.arrow {
  text-align: center;
  font-size: 36px;
  color: var(--muted);
}

.sample,
.images,
.tokens,
.rank {
  display: flex;
  align-items: center;
}

.sample {
  gap: 20px;
}

.images {
  gap: 6px;
  width: 132px;
}

.images i {
  width: 40px;
  height: 40px;
  border: 3px solid #8a90a0;
  border-radius: 6px;
}

.instruction {
  height: 14px;
  border-radius: 7px;
  background: #8a90a066;
}

.tokens {
  gap: 5px;
}

.tokens i {
  width: 22px;
  height: 40px;
  border-radius: 4px;
  background: #8a90a0;
}

.rank {
  gap: 20px;
  font-family: var(--mono);
  font-size: 22px;
  color: var(--muted);
}

.rank i {
  height: 40px;
  border-radius: 4px;
  background: v-bind('laneColour.kernel');
}

.badge {
  margin-top: 32px;
  float: right;
}
</style>
