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
  seriesTitle: string
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

export interface MangaBook {
  id: string
  title: string
  uploader: {
    UserName: string
    Avatar: string
  }
  cover: MangaImageAsset
  createdAt: string
  updatedAt: string
  latestUpdate: string
  readPosition?: {
    chapterId: string
    page: number
    readAt?: string
  }
  chapters: MangaChapter[]
}

export interface MangaSeries {
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
  books: MangaBook[]
}

export interface MangaListItem {
  id: string
  title: string
  subtitle: string
  updatedAt: string
  chapterCount: number
  cover: MangaImageAsset
}
