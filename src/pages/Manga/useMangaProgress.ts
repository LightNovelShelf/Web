import { ref } from 'vue'

interface ReadingProgress {
  chapterId: string
  page: number
  updatedAt: number
}

const progressKey = 'light-novel-shelf:manga-progress'

function readProgress(): Record<string, ReadingProgress> {
  try {
    return JSON.parse(window.localStorage.getItem(progressKey) ?? '') as Record<string, ReadingProgress>
  } catch {
    return {}
  }
}

const progress = ref<Record<string, ReadingProgress>>(readProgress())

export function useMangaProgress() {
  const saveProgress = (mangaId: string, chapterId: string, page: number) => {
    progress.value = {
      ...progress.value,
      [mangaId]: { chapterId, page, updatedAt: Date.now() },
    }
    window.localStorage.setItem(progressKey, JSON.stringify(progress.value))
  }

  return { progress, saveProgress }
}
