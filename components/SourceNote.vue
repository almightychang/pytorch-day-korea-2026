<script setup lang="ts">
import { SITES, type SiteKey } from '../composables/siteLogos'

const props = defineProps<{ site: SiteKey; title: string; href: string; detail?: string; inline?: boolean }>()
const site = SITES[props.site]
</script>

<template>
  <a class="source-note" :class="{ footnote: !inline }" :href="href" target="_blank">
    <span class="site">
      <svg :viewBox="site.viewBox" :style="{ fill: site.colour }"><path :d="site.glyph" /></svg>
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
  gap: 0.8em;
  font-size: var(--source-size, 20px);
  line-height: 1.5;
  text-decoration: none;
  color: var(--muted);
}

.site {
  display: flex;
  align-items: center;
  gap: 0.4em;
  padding: 0.2em 0.7em;
  border: 2px solid #8a90a066;
  border-radius: 999px;
  font-weight: 600;
  white-space: nowrap;
  color: var(--text);
}

svg {
  width: 1em;
  height: 1em;
}

.title {
  color: var(--text);
}

.detail {
  color: var(--muted);
}

.detail::before {
  content: '·';
  margin-right: 0.8em;
}
</style>
