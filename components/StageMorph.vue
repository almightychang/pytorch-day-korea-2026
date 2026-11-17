<script setup lang="ts">
import { computed } from 'vue'
import { BASELINE, STAGES } from '../composables/stages'
import { MORPH_MS } from './TimelineMorph.vue'

const props = defineProps<{ step: number }>()

const TAGS = [BASELINE.tag, ...STAGES.map((stage) => stage.tag)]

const applied = computed(() => STAGES.slice(0, props.step))
</script>

<template>
  <div class="stage-morph" :style="{ '--morph': `${MORPH_MS}ms` }">
    <TimelineMorph :step="step" :tags="TAGS" />
    <TransitionGroup tag="div" name="stage" class="applied">
      <section v-for="stage in applied" :key="stage.name">
        <h3>{{ stage.name }}</h3>
        <p v-for="technique in stage.techniques" :key="technique">{{ technique }}</p>
        <small>{{ stage.effect }}</small>
      </section>
    </TransitionGroup>
  </div>
</template>

<style scoped>
.stage-morph {
  position: relative;
}

.applied {
  position: absolute;
  top: -14px;
  left: 1120px;
  display: flex;
  flex-direction: column;
  gap: 48px;
}

h3 {
  margin: 0 0 14px;
  font-family: var(--mono);
  font-size: 40px;
  font-weight: 600;
}

p {
  margin: 0;
  font-size: 32px;
  line-height: 1.4;
}

small {
  display: block;
  margin-top: 12px;
  font-family: var(--mono);
  font-size: 26px;
  color: var(--muted);
}

.stage-enter-active {
  transition: opacity 0.6s ease calc(var(--morph) / 2);
}

.stage-enter-active:first-child {
  transition-delay: var(--morph);
}

.stage-enter-from {
  opacity: 0;
}
</style>
