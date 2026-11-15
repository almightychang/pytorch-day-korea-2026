<script setup lang="ts">
import QRCode from 'qrcode'

const props = defineProps<{ href: string }>()

const { modules } = QRCode.create(props.href, { errorCorrectionLevel: 'M' })
const cells = Array.from(modules.data, (dark, index) =>
  dark ? `M${index % modules.size} ${Math.floor(index / modules.size)}h1v1h-1z` : '',
).join('')
</script>

<template>
  <a class="qr-code" :href="href" target="_blank">
    <svg :viewBox="`0 0 ${modules.size} ${modules.size}`" shape-rendering="crispEdges"><path :d="cells" /></svg>
  </a>
</template>

<style scoped>
.qr-code {
  display: block;
  padding: 24px;
  border-radius: 16px;
  background: #fff;
}

svg {
  display: block;
  width: 100%;
  fill: #0c0e13;
}
</style>
