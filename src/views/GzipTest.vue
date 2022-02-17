<template>
  <!-- 4.7k -->
  <div class="i"><q-btn outline @click="getBookShelf" label="getBookShelf" /></div>
  <div class="i"><q-btn outline @click="getBookShelfBinaryBrotli" label="getBookShelfBinaryBrotli" /></div>
  <div class="i"><q-btn outline @click="getBookShelfBinaryDeflate" label="getBookShelfBinaryDeflate" /></div>
  <div class="i"><q-btn outline @click="getBookShelfBinaryGzip" label="getBookShelfBinaryGzip" /></div>

  <div class="i"><hr /></div>
  <div class="i"><q-btn outline @click="clickHandle" label="check decompressed" /></div>
</template>

<script setup lang="ts">
import {
  getBookShelf,
  getBookShelfBinaryBrotli,
  getBookShelfBinaryDeflate,
  getBookShelfBinaryGzip
} from '@/services/user'
import { gzip, inflate, inflateRaw } from 'pako'

async function clickHandle() {
  try {
    const resInstr = await getBookShelf()
    const resInGzip = await getBookShelfBinaryGzip()
    const unZipd = inflateRaw(resInGzip)
    console.log([resInstr, resInGzip, unZipd])
  } catch (e) {
    console.log(e)
  }
}
</script>

<style scoped>
.i {
  margin-bottom: 10px;
}
</style>
