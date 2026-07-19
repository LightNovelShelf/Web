import { getPlaceholder } from 'src/utils/url'

import type { Manga, MangaImageAsset, MangaListItem } from './types'
import type { ComicInfoResponse, ComicListItem } from 'src/services/manga/types'


const mangaTheme = {
  primary: '#137fc4',
  secondary: '#ec5a8e',
  accent: '#ffd4e4',
  ink: '#ffffff',
}

export function toMangaImage(url: string, width = 2, height = 3, placeholder?: string): MangaImageAsset {
  return {
    url,
    placeholder: placeholder ?? getPlaceholder(url) ?? '',
    width,
    height,
  }
}

export function toMangaListItem(item: ComicListItem): MangaListItem {
  return {
    id: String(item.Id),
    title: item.Title,
    views: item.Views,
    createdAt: item.CreatedAt,
    updatedAt: item.LastUpdatedAt,
    chapterCount: item.ChapterCount,
    cover: toMangaImage(item.Cover),
  }
}

export function toManga(info: ComicInfoResponse): Manga {
  const { Book: book } = info
  const classification = book.Extra?.classification
  return {
    id: String(book.Id),
    title: book.Title,
    subtitle: classification?.series_name ?? '',
    author: book.Author || classification?.author || '暂无',
    tags: classification?.tags ?? [],
    description: book.Introduction,
    followers: String(book.Favorite),
    views: String(book.Views),
    latestUpdate: book.LastUpdatedChapter,
    createdAt: book.CreatedAt,
    updatedAt: book.LastUpdatedAt,
    cover: toMangaImage(book.Cover),
    theme: mangaTheme,
    user: {
      id: book.User.Id,
      avatar: book.User.Avatar,
      name: book.User.UserName,
    },
    chapters: book.Chapters.map((chapter) => ({
      id: String(chapter.Id),
      number: chapter.SortNum,
      title: chapter.Title,
      publishedAt: chapter.UpdatedAt ?? chapter.CreatedAt,
      pages: chapter.PageCount,
      images: [],
    })),
  }
}
