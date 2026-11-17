<script setup lang="ts">
import { useIsSlideActive } from '@slidev/client'
import { computed, onMounted, onUnmounted, ref, watch } from 'vue'
import { sceneLegend, sceneRows } from '../composables/sceneLanes'
import { scenes, type SceneName } from '../scenes'

const props = defineProps<{ scene: SceneName }>()
const { source, code, host, kernels, copies, totalUnits, measuredOn } = scenes[props.scene]

const MS_PER_UNIT = 260
const rows = sceneRows({ host, kernels, copies })
const legend = sceneLegend({ host, kernels, copies })

const now = ref(totalUnits)
const isActive = useIsSlideActive()
let frame = 0

const currentLine = computed(() => host.find((span) => now.value >= span.start && now.value < span.end)?.line)
const finished = computed(() => now.value >= totalUnits)

const play = () => {
  cancelAnimationFrame(frame)
  const startedAt = performance.now()
  const tick = (at: number) => {
    now.value = Math.min((at - startedAt) / MS_PER_UNIT, totalUnits)
    if (now.value < totalUnits) frame = requestAnimationFrame(tick)
  }
  frame = requestAnimationFrame(tick)
}

onMounted(play)
watch(isActive, (active) => active && play())
onUnmounted(() => cancelAnimationFrame(frame))
</script>

<template>
  <CodeSnippet :source="source" :code="code" :current-line="currentLine" :finished="finished" />
  <LaneChart :rows="rows" :total-units="totalUnits" :shown-units="now" />
  <LaneLegend :items="legend" :measured-on="measuredOn" />
</template>
