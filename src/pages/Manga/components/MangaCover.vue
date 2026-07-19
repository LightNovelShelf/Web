<template>
  <div class="manga-cover" :style="coverStyle" :class="{ compact }" role="img" :aria-label="`${manga.title}封面`">
    <div class="cover-orbit orbit-a" />
    <div class="cover-orbit orbit-b" />
    <div class="cover-spark spark-a" />
    <div class="cover-spark spark-b" />
    <div class="cover-figure">
      <div class="figure-head" />
      <div class="figure-body" />
      <div class="figure-scarf" />
    </div>
    <div class="cover-copy">
      <div class="cover-kicker">LIGHT NOVEL SHELF · COMICS</div>
      <div class="cover-title">{{ manga.title }}</div>
      <div class="cover-subtitle">{{ manga.subtitle }}</div>
    </div>
    <div class="cover-number">{{ String(manga.weeklyRank).padStart(2, '0') }}</div>
  </div>
</template>

<script lang="ts" setup>
import { computed } from 'vue'

import type { Manga } from '../mock'

const props = withDefaults(defineProps<{ manga: Manga; compact?: boolean }>(), { compact: false })

const coverStyle = computed(() => ({
  '--cover-primary': props.manga.theme.primary,
  '--cover-secondary': props.manga.theme.secondary,
  '--cover-accent': props.manga.theme.accent,
  '--cover-ink': props.manga.theme.ink,
}))
</script>

<style lang="scss" scoped>
.manga-cover {
  --cover-primary: #172342;
  --cover-secondary: #70569d;
  --cover-accent: #f5cf7c;
  --cover-ink: #fff;
  position: relative;
  width: 100%;
  aspect-ratio: 3 / 4.2;
  overflow: hidden;
  isolation: isolate;
  color: var(--cover-ink);
  background:
    radial-gradient(circle at 74% 18%, color-mix(in srgb, var(--cover-accent) 70%, transparent) 0 2%, transparent 3%),
    linear-gradient(145deg, var(--cover-primary), var(--cover-secondary));
}

.manga-cover::before {
  position: absolute;
  inset: 0;
  content: '';
  opacity: 0.3;
  background-image: repeating-linear-gradient(116deg, transparent 0 18px, rgba(255, 255, 255, 0.12) 19px 20px);
}

.cover-orbit {
  position: absolute;
  border: 1px solid color-mix(in srgb, var(--cover-accent) 65%, transparent);
  border-radius: 50%;
  transform: rotate(-22deg);
}

.orbit-a {
  width: 115%;
  height: 38%;
  top: 14%;
  left: -27%;
}
.orbit-b {
  width: 75%;
  height: 24%;
  top: 27%;
  right: -28%;
}

.cover-spark {
  position: absolute;
  width: 8px;
  height: 8px;
  background: var(--cover-accent);
  transform: rotate(45deg);
  box-shadow: 0 0 22px var(--cover-accent);
}

.spark-a {
  top: 12%;
  right: 17%;
}
.spark-b {
  top: 47%;
  left: 13%;
  width: 4px;
  height: 4px;
}

.cover-figure {
  position: absolute;
  z-index: -1;
  width: 70%;
  height: 72%;
  right: -9%;
  bottom: -5%;
  filter: drop-shadow(-12px 12px 24px rgba(0, 0, 0, 0.28));
}

.figure-head {
  position: absolute;
  width: 32%;
  aspect-ratio: 0.86;
  top: 2%;
  left: 31%;
  border-radius: 48% 52% 44% 42%;
  background: color-mix(in srgb, var(--cover-accent) 72%, #fff);
}

.figure-head::before {
  position: absolute;
  inset: -10% -18% 38% -24%;
  content: '';
  border-radius: 56% 48% 42% 36%;
  background: var(--cover-primary);
  transform: rotate(-8deg);
}

.figure-body {
  position: absolute;
  width: 72%;
  height: 74%;
  left: 10%;
  bottom: -6%;
  border-radius: 45% 48% 7% 10%;
  background: linear-gradient(135deg, var(--cover-accent), color-mix(in srgb, var(--cover-secondary) 75%, #111));
  transform: rotate(-9deg);
}

.figure-scarf {
  position: absolute;
  width: 68%;
  height: 11%;
  top: 28%;
  left: 23%;
  border-radius: 60% 8% 70% 20%;
  background: color-mix(in srgb, var(--cover-ink) 82%, transparent);
  transform: rotate(13deg);
}

.cover-copy {
  position: absolute;
  z-index: 2;
  right: 10%;
  bottom: 10%;
  left: 9%;
  text-shadow: 0 3px 18px rgba(0, 0, 0, 0.45);
}

.cover-kicker {
  margin-bottom: 8px;
  color: var(--cover-accent);
  font-size: clamp(7px, 0.7vw, 10px);
  font-weight: 700;
  letter-spacing: 0.16em;
}

.cover-title {
  font-family: 'Noto Serif SC', 'Songti SC', serif;
  font-size: clamp(22px, 2.5vw, 38px);
  font-weight: 900;
  line-height: 1.08;
  letter-spacing: 0.04em;
}

.cover-subtitle {
  margin-top: 8px;
  font-size: clamp(7px, 0.7vw, 10px);
  font-weight: 500;
  letter-spacing: 0.12em;
  opacity: 0.72;
}

.cover-number {
  position: absolute;
  top: 5%;
  left: 7%;
  font-family: Georgia, serif;
  font-size: clamp(32px, 5vw, 62px);
  font-style: italic;
  line-height: 1;
  opacity: 0.14;
}

.manga-cover.compact .cover-kicker,
.manga-cover.compact .cover-subtitle {
  display: none;
}

.manga-cover.compact .cover-title {
  font-size: clamp(18px, 2vw, 28px);
}
</style>
