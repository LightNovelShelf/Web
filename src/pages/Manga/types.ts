export interface MangaImageAsset {
  url: string
  placeholder: string
  width: number
  height: number
}

export interface MangaChapter {
  id: string
  number: number
  title: string
  publishedAt: string
  pages: number
  images: MangaImageAsset[]
}

export interface MangaTheme {
  primary: string
  secondary: string
  accent: string
}

export interface Manga {
  id: string
  title: string
  theme: MangaTheme
  chapters: MangaChapter[]
}

export interface MangaListItem {
  id: string
  bookId: number
  title: string
  updatedAt: string
  chapterCount: number
  cover: MangaImageAsset
}
