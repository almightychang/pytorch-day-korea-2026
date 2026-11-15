<script setup lang="ts">
defineProps<{ src: string; caption: string }>()
</script>

<template>
  <figure>
    <figcaption>{{ caption }}</figcaption>
    <img :src="src" />
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
  width: 100%;
  border-radius: 12px;
}
</style>
