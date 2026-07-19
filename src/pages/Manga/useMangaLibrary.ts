import { computed, ref } from 'vue'

interface ReadingProgress {
  chapterId: string
  page: number
  updatedAt: number
}

const followKey = 'light-novel-shelf:manga-following'
const progressKey = 'light-novel-shelf:manga-progress'

function readJson<T>(key: string, fallback: T): T {
  try {
    return JSON.parse(window.localStorage.getItem(key) ?? '') as T
  } catch {
    return fallback
  }
}

const following = ref<string[]>(readJson<string[]>(followKey, ['night-train', 'fox-letter']))
const progress = ref<Record<string, ReadingProgress>>(
  readJson<Record<string, ReadingProgress>>(progressKey, {
    'night-train': { chapterId: 'night-train-3', page: 4, updatedAt: Date.now() },
  }),
)

function persist() {
  window.localStorage.setItem(followKey, JSON.stringify(following.value))
  window.localStorage.setItem(progressKey, JSON.stringify(progress.value))
}

export function useMangaLibrary() {
  const isFollowing = (mangaId: string) => computed(() => following.value.includes(mangaId))

  const toggleFollow = (mangaId: string) => {
    following.value = following.value.includes(mangaId)
      ? following.value.filter((id) => id !== mangaId)
      : [...following.value, mangaId]
    persist()
  }

  const saveProgress = (mangaId: string, chapterId: string, page: number) => {
    progress.value = {
      ...progress.value,
      [mangaId]: { chapterId, page, updatedAt: Date.now() },
    }
    persist()
  }

  return { following, progress, isFollowing, toggleFollow, saveProgress }
}
