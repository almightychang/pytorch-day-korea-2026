<script setup lang="ts">
import { SITES, type SiteKey } from '../composables/siteLogos'

const props = defineProps<{ site: SiteKey; title: string; href: string }>()
const site = SITES[props.site]
</script>

<template>
  <a class="doc-card" :href="href" target="_blank">
    <header>
      <svg viewBox="0 0 24 24" :style="{ fill: site.colour }"><path :d="site.glyph" /></svg>
      {{ title }}
    </header>
    <slot />
  </a>
</template>

<style scoped>
.doc-card {
  display: block;
  padding: 26px 28px;
  border: 2px solid #ffffff14;
  border-radius: 16px;
  background: var(--panel);
  text-decoration: none;
  color: var(--text);
}

header {
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 22px;
  color: var(--muted);
}

svg {
  width: 26px;
  height: 26px;
}
</style>
