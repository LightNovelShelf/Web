import { getPlaceholder } from 'src/utils/url'

import type { Manga, MangaChapter, MangaImageAsset, MangaListItem, MangaSeries } from './types'
import type {
  ComicChapterSummary,
  ComicInfoResponse,
  ComicListItem,
  ComicSeriesInfoResponse,
} from 'src/services/manga/types'

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
    id: item.Title,
    title: item.Title,
    subtitle: item.OriginalTitle ?? '',
    updatedAt: item.LastUpdatedAt,
    chapterCount: item.Count,
    cover: toMangaImage(item.Cover),
  }
}

function toMangaChapter(chapter: ComicChapterSummary): MangaChapter {
  return {
    id: String(chapter.Id),
    number: chapter.SortNum,
    title: chapter.Title,
    publishedAt: chapter.UpdatedAt ?? chapter.CreatedAt,
    pages: chapter.PageCount,
    images: [],
  }
}

export function toMangaSeries(info: ComicSeriesInfoResponse): MangaSeries {
  const { Series: series } = info
  const classification = series.Extra?.classification
  return {
    id: String(series.Id),
    title: series.Title,
    subtitle: series.OriginalTitle ?? classification?.series_name ?? '',
    author: series.Author || classification?.author || '暂无',
    tags: classification?.tags ?? [],
    description: series.Introduction,
    followers: String(series.Favorite),
    views: String(series.Views),
    latestUpdate: series.LastUpdatedChapter,
    createdAt: series.CreatedAt,
    updatedAt: series.LastUpdatedAt,
    cover: toMangaImage(series.Cover),
    books: info.Books.map((book) => ({
      id: String(book.Id),
      title: book.Title,
      uploader: book.Uploader,
      cover: toMangaImage(book.Cover),
      createdAt: book.CreatedAt,
      updatedAt: book.LastUpdatedAt,
      latestUpdate: book.LastUpdatedChapter,
      readPosition: book.ReadPosition
        ? {
            chapterId: String(book.ReadPosition.ChapterId),
            page: Number(book.ReadPosition.Position) || 1,
            readAt: book.ReadPosition.ReadAt,
          }
        : undefined,
      chapters: book.Chapters.map(toMangaChapter),
    })),
  }
}

export function toManga(info: ComicInfoResponse): Manga {
  const { Book: book } = info
  const classification = book.Extra?.classification
  return {
    id: String(book.Id),
    seriesTitle: classification?.series_name_cn || classification?.series_name || book.Title,
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
    chapters: book.Chapters.map(toMangaChapter),
  }
}
