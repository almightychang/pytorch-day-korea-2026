<script setup lang="ts">
import type { SiteKey } from '../composables/siteLogos'

defineProps<{ site: SiteKey; title: string; href: string; detail?: string; term?: string }>()
</script>

<template>
  <div class="source-quote">
    <SourceNote inline :site="site" :title="title" :detail="detail" :href="href" />
    <blockquote>
      <code v-if="term">{{ term }}</code>
      <slot />
    </blockquote>
  </div>
</template>

<style scoped>
blockquote {
  margin: 24px 0 0;
  padding-left: 22px;
  border-left: 3px solid #8a90a0;
  font-size: 28px;
  line-height: 1.5;
}

code {
  display: block;
  margin-bottom: 10px;
  font-family: var(--mono);
  font-size: 22px;
}
</style>
