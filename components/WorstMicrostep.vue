<script setup lang="ts">
import { armByTag, timeline, worstMicrostep } from '../composables/timeline'

const props = withDefaults(
  defineProps<{ arm?: string; highlight?: string[]; sublanes?: string[]; laneHeight?: number }>(),
  { arm: 'before', sublanes: () => ['host', 'copy'], laneHeight: 48 },
)

const worst = worstMicrostep(armByTag(props.arm))
const idlePercent = Math.round((1 - worst.computeShare) * 100)
const deviceColour = timeline.sources.gemm.color
</script>

<template>
  <p v-if="!highlight" class="headline"><span :style="{ color: deviceColour }">DEVICE</span> {{ idlePercent }}% IDLE</p>
  <StepTimeline
    :arm="arm"
    :ranks="[worst.rank]"
    :from-ms="worst.fromMs"
    :to-ms="worst.toMs"
    :lane-height="laneHeight"
    :sublanes="sublanes"
    :highlight="highlight"
    :device-first="!highlight"
  />
</template>

<style scoped>
.headline {
  margin: 28px 0 40px;
  font-family: var(--mono);
  font-size: 88px;
  font-weight: 600;
  line-height: 1;
}
</style>
