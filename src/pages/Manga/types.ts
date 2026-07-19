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
  ink: string
}

export interface Manga {
  id: string
  title: string
  subtitle: string
  author: string
  tags: string[]
  description: string
  followers: string
  views: string
  latestUpdate: string
  createdAt: string
  updatedAt: string
  cover: MangaImageAsset
  theme: MangaTheme
  user: {
    id: number
    avatar: string
    name: string
  }
  chapters: MangaChapter[]
}

export interface MangaListItem {
  id: string
  title: string
  views: number
  createdAt: string
  updatedAt: string
  chapterCount: number
  cover: MangaImageAsset
}
