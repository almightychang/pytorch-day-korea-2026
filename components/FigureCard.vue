<script setup lang="ts">
import { publicAsset } from '../composables/publicAsset'

defineProps<{ src: string; caption?: string; padded?: boolean }>()
</script>

<template>
  <figure>
    <figcaption v-if="caption">{{ caption }}</figcaption>
    <img :src="publicAsset(src)" :class="{ padded }" />
  </figure>
</template>

<style scoped>
figure {
  margin: 0;
}

figcaption {
  margin-bottom: 10px;
  font-family: var(--mono);
  font-size: 22px;
  color: var(--muted);
}

img {
  display: block;
  box-sizing: border-box;
  width: 100%;
  border-radius: 12px;
  background: #fff;
}

.padded {
  padding: 28px 36px;
}
</style>
