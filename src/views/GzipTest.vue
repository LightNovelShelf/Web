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
import diff from 'microdiff'
import { ungzip } from 'pako'

async function clickHandle() {
  try {
    const res = JSON.parse(JSON.stringify(await getBookShelf()))
    const resInGzip = await getBookShelfBinaryGzip()
    const unZipd = ungzip(resInGzip, { to: 'string' })
    const unZipdObj = JSON.parse(unZipd)
    console.log([res, unZipdObj, diff(res, JSON.parse(unZipd))])
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
