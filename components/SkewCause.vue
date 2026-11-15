<script setup lang="ts">
const SAMPLES = [
  { images: 3, instructionPx: 230, tokens: 14, colour: '#7fa3d1' },
  { images: 2, instructionPx: 170, tokens: 9, colour: '#8fbf9a' },
  { images: 1, instructionPx: 120, tokens: 5, colour: '#c9b384' },
]
const [LONG, MEDIUM, SHORT] = SAMPLES
const RANK_BATCHES = [LONG, SHORT, MEDIUM, SHORT]
const BATCH_PX_PER_TOKEN = 20
</script>

<template>
  <div class="skew-cause">
    <section>
      <h3>Dataset variation</h3>
      <div class="figure">
        <div v-for="(sample, index) in SAMPLES" :key="index" class="sample">
          <span class="images"><i v-for="image in sample.images" :key="image" :style="{ borderColor: sample.colour }" /></span>
          <span class="instruction" :style="{ width: `${sample.instructionPx}px`, background: sample.colour }" />
        </div>
      </div>
      <p>number of images, instruction length</p>
    </section>

    <span class="arrow">→</span>

    <section>
      <h3>Token counts</h3>
      <div class="figure">
        <div v-for="(sample, index) in SAMPLES" :key="index" class="tokens">
          <i v-for="token in sample.tokens" :key="token" :style="{ background: sample.colour }" />
        </div>
      </div>
      <p>per sample</p>
    </section>

    <span class="arrow">→</span>

    <section>
      <h3>Rank skew</h3>
      <div class="figure ranks">
        <div v-for="(sample, rank) in RANK_BATCHES" :key="rank" class="rank">
          <span>rank {{ rank }}</span>
          <i :style="{ width: `${sample.tokens * BATCH_PX_PER_TOKEN}px`, background: sample.colour }" />
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
  border: 3px solid;
  border-radius: 6px;
}

.instruction {
  height: 14px;
  border-radius: 7px;
}

.tokens {
  gap: 5px;
}

.tokens i {
  width: 22px;
  height: 40px;
  border-radius: 4px;
}

.rank {
  gap: 4px;
  font-family: var(--mono);
  font-size: 22px;
  color: var(--muted);
}

.rank i {
  height: 40px;
  border-radius: 4px;
}

.ranks {
  gap: 14px;
}

.rank span {
  width: 108px;
}

.rank i {
  height: 34px;
  border-radius: 4px;
}

.badge {
  margin-top: 32px;
  float: right;
}
</style>
