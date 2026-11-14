<script setup lang="ts">
import { armByTag, timeline, worstMicrostep } from '../composables/timeline'

const props = withDefaults(defineProps<{ arm?: string }>(), { arm: 'base' })

const worst = worstMicrostep(armByTag(props.arm))
const idlePercent = Math.round((1 - worst.computeShare) * 100)
const deviceColour = timeline.sources.gemm.color
</script>

<template>
  <p class="headline"><span :style="{ color: deviceColour }">DEVICE</span> {{ idlePercent }}% IDLE</p>
  <StepTimeline
    :arm="arm"
    :ranks="[worst.rank]"
    :from-ms="worst.fromMs"
    :to-ms="worst.toMs"
    :lane-height="48"
    :sublanes="['host', 'copy']"
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
