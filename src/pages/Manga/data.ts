import { getSystemImageMetadata } from '@/utils/url'

import type { Manga, MangaChapter, MangaImageAsset, MangaListItem } from './types'
import type { ChapterInfo, GetBookInfoRes } from '@/services/book/types'
import type { ComicListItem } from '@/services/manga/types'

const mangaTheme = {
  primary: '#137fc4',
  secondary: '#ec5a8e',
  accent: '#ffd4e4',
}
export function toMangaImage(url: string): MangaImageAsset {
  const metadata = getSystemImageMetadata(url)
  return {
    url,
    placeholder: metadata?.placeholder ?? '',
    width: metadata?.width ?? 2,
    height: metadata?.height ?? 3,
  }
}

export function toMangaListItem(item: ComicListItem): MangaListItem {
  return {
    bookId: item.Id,
    id: item.Title,
    title: item.Title,
    updatedAt: item.LastUpdatedAt,
    chapterCount: item.Count,
    cover: toMangaImage(item.Cover),
  }
}

function toMangaChapter(chapter: ChapterInfo): MangaChapter {
  return {
    id: String(chapter.Id),
    number: chapter.SortNum,
    title: chapter.Title,
    publishedAt: String(chapter.UpdatedAt ?? chapter.CreatedAt),
    pages: chapter.PageCount,
    images: [],
  }
}

export function toManga(info: GetBookInfoRes): Manga {
  const { Book: book } = info
  return {
    id: String(book.Id),
    title: book.Title,
    theme: mangaTheme,
    chapters: book.Chapters.map(toMangaChapter),
  }
}
