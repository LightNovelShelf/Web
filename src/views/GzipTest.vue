<template>
  <!-- 4.7k -->
  <div class="i"><q-btn outline @click="getBookShelf" label="getBookShelf" /></div>
  <div class="i"><q-btn outline @click="getBookShelfBinaryBrotli" label="getBookShelfBinaryBrotli" /></div>
  <div class="i"><q-btn outline @click="getBookShelfBinaryDeflate" label="getBookShelfBinaryDeflate" /></div>
  <div class="i"><q-btn outline @click="getBookShelfBinaryGzip" label="getBookShelfBinaryGzip" /></div>
</template>

<script setup lang="ts">
import {
  getBookShelf,
  getBookShelfBinaryBrotli,
  getBookShelfBinaryDeflate,
  getBookShelfBinaryGzip
} from '@/services/user'
import { nanoid } from 'nanoid'
import { gzip, ungzip } from 'pako'
const origin = nanoid(65).repeat(1000)
const compresed = gzip(origin, { level: 9 })
const uncompresed = ungzip(compresed)
const uncompresedStr = ungzip(compresed, { to: 'string' })
console.log([origin, compresed, uncompresed])
console.log('valid', origin === uncompresedStr, (compresed.length / uncompresed.length) * 100)

async function clickHandle() {
  await getBookShelf()
  await getBookShelfBinaryBrotli()
  await getBookShelfBinaryDeflate()
  await getBookShelfBinaryGzip()
}
</script>

<style scoped>
.i {
  margin-bottom: 10px;
}
</style>
