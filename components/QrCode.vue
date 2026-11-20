<script setup lang="ts">
import QRCode from 'qrcode'
import { publicAsset } from '../composables/publicAsset'

const props = defineProps<{ href: string; logo?: string }>()

const { modules } = QRCode.create(props.href, { errorCorrectionLevel: props.logo ? 'H' : 'M' })
const logoUrl = props.logo && publicAsset(props.logo)
const cells = Array.from(modules.data, (dark, index) =>
  dark ? `M${index % modules.size} ${Math.floor(index / modules.size)}h1v1h-1z` : '',
).join('')
</script>

<template>
  <a class="qr-code" :href="href" target="_blank">
    <svg :viewBox="`0 0 ${modules.size} ${modules.size}`" shape-rendering="crispEdges"><path :d="cells" /></svg>
    <span v-if="logo" class="logo">
      <span class="mark" :style="{ '--mark': `url(${logoUrl})` }"><img :src="logoUrl" alt=""></span>
    </span>
  </a>
</template>

<style scoped>
.qr-code {
  position: relative;
  display: block;
  padding: 24px;
  border-radius: 16px;
  background: #fff;
}

svg {
  display: block;
  width: 100%;
  fill: var(--qr-ink, #0c0e13);
}

.logo {
  position: absolute;
  display: block;
  top: 50%;
  left: 50%;
  width: 44%;
  padding: 2.5% 3%;
  background: #fff;
  transform: translate(-50%, -50%);
}

.mark {
  display: block;
  background: var(--qr-ink, #0c0e13);
  mask: var(--mark) center / 100% 100% no-repeat;
}

.mark img {
  display: block;
  width: 100%;
  visibility: hidden;
}
</style>
