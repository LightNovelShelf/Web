<template>
  <article class="comic-page" :class="`layout-${layout}`" :style="pageStyle" :aria-label="`漫画第 ${pageNumber} 页`">
    <div class="page-folio">{{ String(pageNumber).padStart(2, '0') }}</div>

    <section class="panel panel-a">
      <div class="halftone" />
      <div class="moon" />
      <div class="horizon" />
      <div class="character character-a"><i /><b /></div>
      <div v-if="pageNumber % 2" class="speech speech-a">{{ lines[0] }}</div>
    </section>

    <section class="panel panel-b">
      <div class="speed-lines" />
      <div class="character character-b"><i /><b /></div>
      <div class="sfx">{{ soundEffect }}</div>
      <div v-if="pageNumber % 3 !== 0" class="speech speech-b">{{ lines[1] }}</div>
    </section>

    <section class="panel panel-c">
      <div class="window-grid" />
      <div class="character character-c"><i /><b /></div>
      <div class="speech speech-c">{{ lines[2] }}</div>
      <div class="caption">CHAPTER {{ String(chapterNumber).padStart(2, '0') }}</div>
    </section>

    <section v-if="layout !== 2" class="panel panel-d">
      <div class="impact" />
      <div class="close-eye" />
      <div class="narration">{{ narration }}</div>
    </section>
  </article>
</template>

<script lang="ts" setup>
import { computed } from 'vue'

import type { MangaTheme } from '../mock'

const props = defineProps<{
  pageNumber: number
  chapterNumber: number
  theme: MangaTheme
}>()

const dialogSets = [
  ['你听见了吗？', '列车正在呼吸。', '这一次，我们不会错过。'],
  ['星星落下来了。', '不，那是信号。', '有人在终点等我们。'],
  ['别回头。', '可我忘了重要的事。', '记忆会找到回家的路。'],
  ['风暴还没有结束。', '那就穿过它。', '天亮以前，一切都来得及。'],
]
const narrations = [
  '夜色把城市折成一封无人签收的信。',
  '汽笛声越过群山，也越过漫长的沉默。',
  '我们以为那是终点，后来才知道，那只是出发。',
]
const effects = ['轰——', '咔哒', '沙沙', '呼——']

const layout = computed(() => (props.pageNumber % 3) + 1)
const lines = computed(() => dialogSets[(props.pageNumber - 1) % dialogSets.length])
const narration = computed(() => narrations[(props.pageNumber - 1) % narrations.length])
const soundEffect = computed(() => effects[(props.pageNumber - 1) % effects.length])
const pageStyle = computed(() => ({
  '--page-primary': props.theme.primary,
  '--page-secondary': props.theme.secondary,
  '--page-accent': props.theme.accent,
}))
</script>

<style lang="scss" scoped>
.comic-page {
  --page-primary: #1b2344;
  --page-secondary: #634d91;
  --page-accent: #f1c979;
  position: relative;
  display: grid;
  grid-template-columns: 1.08fr 0.92fr;
  grid-template-rows: 0.92fr 1.08fr;
  gap: 7px;
  width: min(790px, 100%);
  aspect-ratio: 0.72;
  padding: 14px;
  overflow: hidden;
  color: #111;
  background: #f9f6ec;
  box-shadow: 0 18px 55px rgba(0, 0, 0, 0.34);
  font-family: 'Noto Serif SC', 'Songti SC', serif;
}

.layout-2 {
  grid-template-columns: 0.78fr 1.22fr;
  grid-template-rows: 0.62fr 1.38fr;
}
.layout-3 {
  grid-template-columns: 1.22fr 0.78fr;
  grid-template-rows: 1.18fr 0.82fr;
}
.panel {
  position: relative;
  min-width: 0;
  min-height: 0;
  overflow: hidden;
  border: 3px solid #131317;
  background: #e7e3d8;
}
.panel-a {
  background: linear-gradient(160deg, #f2efe6 15%, color-mix(in srgb, var(--page-secondary) 24%, #b7b5b3));
}
.panel-b {
  color: #fff;
  background: linear-gradient(130deg, var(--page-primary), #12141d);
}
.panel-c {
  background: linear-gradient(180deg, #f4f1e8, #bcb8ae);
}
.panel-d {
  color: #fff;
  background: var(--page-primary);
}
.layout-1 .panel-a {
  grid-row: 1 / 3;
}
.layout-2 .panel-b {
  grid-row: 1 / 3;
  grid-column: 2;
}
.layout-3 .panel-c {
  grid-row: 1 / 3;
  grid-column: 1;
}

.page-folio {
  position: absolute;
  z-index: 20;
  right: 21px;
  bottom: 18px;
  padding: 2px 6px;
  color: #fff;
  background: #111;
  font:
    700 10px/1.4 Georgia,
    serif;
}
.halftone {
  position: absolute;
  inset: 0;
  opacity: 0.27;
  background-image: radial-gradient(#14151a 0.8px, transparent 0.8px);
  background-size: 7px 7px;
}
.moon {
  position: absolute;
  top: 8%;
  right: 8%;
  width: 28%;
  aspect-ratio: 1;
  border: 2px solid #111;
  border-radius: 50%;
  background: color-mix(in srgb, var(--page-accent) 70%, #fff);
  box-shadow: -7px 8px 0 rgba(15, 15, 17, 0.14);
}
.horizon {
  position: absolute;
  right: -10%;
  bottom: 0;
  left: -10%;
  height: 44%;
  background:
    repeating-linear-gradient(93deg, #1b1c20 0 2px, transparent 2px 28px),
    linear-gradient(10deg, #2e3037 0 35%, transparent 36%);
  clip-path: polygon(0 52%, 12% 38%, 22% 49%, 36% 19%, 48% 45%, 64% 27%, 77% 48%, 91% 21%, 100% 42%, 100% 100%, 0 100%);
}
.speed-lines {
  position: absolute;
  inset: -20%;
  opacity: 0.34;
  background: repeating-conic-gradient(from 83deg at 15% 55%, transparent 0deg 4deg, #fff 4.3deg 4.7deg);
}
.window-grid {
  position: absolute;
  inset: 9% 8% 16%;
  border: 3px solid #15161a;
  background:
    repeating-linear-gradient(90deg, transparent 0 22%, #16171a 22.5% 23.5%),
    linear-gradient(180deg, transparent 0 65%, rgba(20, 20, 22, 0.16) 66%);
}
.window-grid::after {
  position: absolute;
  inset: 47% 0 auto;
  height: 3px;
  content: '';
  background: #15161a;
}

.character {
  position: absolute;
  width: 43%;
  height: 64%;
  bottom: -2%;
  filter: drop-shadow(5px 7px 0 rgba(10, 10, 12, 0.16));
}
.character i {
  position: absolute;
  top: 0;
  left: 28%;
  width: 42%;
  aspect-ratio: 0.85;
  border: 3px solid #111;
  border-radius: 47% 51% 42% 44%;
  background: #f3dfbd;
}
.character i::before {
  position: absolute;
  inset: -12% -16% 48% -18%;
  content: '';
  border: 3px solid #111;
  border-radius: 64% 48% 20% 50%;
  background: var(--page-primary);
  transform: rotate(-9deg);
}
.character b {
  position: absolute;
  width: 100%;
  height: 66%;
  bottom: 0;
  border: 3px solid #111;
  border-radius: 48% 46% 8% 8%;
  background: var(--page-secondary);
}
.character-a {
  left: 27%;
}
.character-b {
  right: 7%;
  width: 56%;
  transform: rotate(9deg) scale(1.12);
}
.character-c {
  left: 9%;
  width: 36%;
  height: 57%;
}
.character-c b {
  background: color-mix(in srgb, var(--page-accent) 65%, #ddd);
}

.speech {
  position: absolute;
  z-index: 5;
  max-width: 44%;
  padding: 10px 12px;
  border: 2px solid #111;
  border-radius: 50%;
  background: #fff;
  font-size: clamp(8px, 1.25vw, 15px);
  font-weight: 700;
  line-height: 1.4;
  text-align: center;
}
.speech::after {
  position: absolute;
  width: 14px;
  height: 18px;
  content: '';
  border-right: 2px solid #111;
  background: #fff;
  transform: skew(-25deg);
}
.speech-a {
  top: 12%;
  left: 8%;
}
.speech-a::after {
  right: 0;
  bottom: -10px;
}
.speech-b {
  top: 8%;
  left: 7%;
  color: #111;
}
.speech-b::after {
  left: 8px;
  bottom: -11px;
}
.speech-c {
  top: 8%;
  right: 6%;
}
.speech-c::after {
  left: 8px;
  bottom: -11px;
}
.sfx {
  position: absolute;
  z-index: 4;
  top: 38%;
  left: 4%;
  color: var(--page-accent);
  font-size: clamp(26px, 5.3vw, 67px);
  font-weight: 900;
  letter-spacing: -0.12em;
  text-shadow: 3px 3px 0 #111;
  transform: rotate(-12deg);
}
.caption {
  position: absolute;
  right: 4%;
  bottom: 3%;
  padding: 4px 7px;
  color: #fff;
  background: #111;
  font:
    700 8px Georgia,
    serif;
  letter-spacing: 0.12em;
}
.impact {
  position: absolute;
  inset: -30%;
  background: repeating-conic-gradient(from 0deg at 48% 55%, #fff 0deg 2deg, transparent 2.4deg 8deg);
}
.close-eye {
  position: absolute;
  width: 50%;
  height: 30%;
  top: 16%;
  left: 25%;
  border-bottom: 9px solid #111;
  border-radius: 50%;
  background: #eee;
  transform: rotate(-4deg);
}
.close-eye::after {
  position: absolute;
  width: 17%;
  aspect-ratio: 1;
  left: 43%;
  bottom: -12px;
  content: '';
  border-radius: 50%;
  background: var(--page-accent);
  box-shadow: 0 0 0 5px #111;
}
.narration {
  position: absolute;
  right: 6%;
  bottom: 7%;
  left: 6%;
  padding: 8px 11px;
  color: #111;
  background: #f5f1e7;
  border: 2px solid #111;
  font-size: clamp(7px, 1vw, 12px);
  font-weight: 700;
  line-height: 1.6;
}

@media (max-width: 600px) {
  .comic-page {
    gap: 4px;
    padding: 8px;
  }
  .panel {
    border-width: 2px;
  }
  .speech {
    padding: 6px 7px;
    border-width: 1px;
  }
}
</style>
