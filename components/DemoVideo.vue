<script setup lang="ts">
import { useIsSlideActive } from '@slidev/client'
import { onMounted, ref, watch } from 'vue'

defineProps<{ src: string; source: string }>()

const video = ref<HTMLVideoElement>()
const isActive = useIsSlideActive()

const sync = () => {
  if (!video.value) return
  if (!isActive.value) return video.value.pause()
  video.value.currentTime = 0
  video.value.play()
}

onMounted(sync)
watch(isActive, sync)
</script>

<template>
  <div class="stage">
    <video ref="video" :src="src" muted loop playsinline />
    <a class="source" :href="source" target="_blank">{{ source.replace(/^https?:\/\//, '') }}</a>
  </div>
</template>

<style scoped>
.stage {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
}

video {
  display: block;
  height: 880px;
  border-radius: 16px;
}

.source {
  margin-top: 14px;
  font-family: var(--mono);
  font-size: 24px;
  color: var(--muted);
  text-decoration: none;
}
</style>
