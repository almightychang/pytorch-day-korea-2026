<script setup lang="ts">
import { SITES, type SiteKey } from '../composables/siteLogos'

const props = defineProps<{ site: SiteKey; title: string; href: string }>()
const site = SITES[props.site]
</script>

<template>
  <a class="guide-book" :href="href" target="_blank" :style="{ '--spine': site.colour }">
    <svg :viewBox="site.viewBox"><path :d="site.glyph" /></svg>
    <h3>{{ title }}</h3>
    <small>{{ site.name }}</small>
  </a>
</template>

<style scoped>
.guide-book {
  display: flex;
  flex-direction: column;
  box-sizing: border-box;
  width: 440px;
  height: 580px;
  margin: 0 auto;
  padding: 48px 44px 40px 72px;
  border-radius: 6px 18px 18px 6px;
  background: linear-gradient(90deg, var(--spine) 0 28px, #0000 28px), var(--panel);
  box-shadow: 10px 10px 0 #eceef31f;
  text-decoration: none;
  color: var(--text);
}

svg {
  width: 64px;
  height: 64px;
  fill: var(--spine);
}

h3 {
  margin: auto 0 0;
  font-size: 50px;
  font-weight: 800;
  line-height: 1.15;
}

small {
  margin-top: 28px;
  font-family: var(--mono);
  font-size: 22px;
  color: var(--muted);
}
</style>
