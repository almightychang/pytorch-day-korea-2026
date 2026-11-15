<script setup lang="ts">
import { SITES, type SiteKey } from '../composables/siteLogos'

const props = defineProps<{ site: SiteKey; title: string; href: string; detail?: string }>()
const site = SITES[props.site]
</script>

<template>
  <a class="footnote source-note" :href="href" target="_blank">
    <span class="site">
      <svg viewBox="0 0 24 24" :style="{ fill: site.colour }"><path :d="site.glyph" /></svg>
      {{ site.name }}
    </span>
    <span class="title">{{ title }}</span>
    <span v-if="detail" class="detail">{{ detail }}</span>
  </a>
</template>

<style scoped>
.source-note {
  display: flex;
  align-items: center;
  gap: 16px;
  text-decoration: none;
}

.site {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 4px 14px;
  border: 2px solid #8a90a066;
  border-radius: 999px;
  font-weight: 600;
  white-space: nowrap;
  color: var(--text);
}

svg {
  width: 20px;
  height: 20px;
}

.title {
  color: var(--text);
}

.detail {
  color: var(--muted);
}

.detail::before {
  content: '·';
  margin-right: 16px;
}
</style>
