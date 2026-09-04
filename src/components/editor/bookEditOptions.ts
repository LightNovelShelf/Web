import type { EditBookRequest, EditableBook, GetBookEditInfoResponse } from '@/services/book/types'

export interface BookCategoryOption {
  label: string
  value: number
}

const COMIC_CATEGORY_NAMES: Record<string, true> = { 原创: true, 连载: true, 完结: true }
const COMIC_ONLY_CATEGORY_NAMES: Record<string, true> = { 连载: true, 完结: true }

export function buildBookCategoryOptions(data: GetBookEditInfoResponse): BookCategoryOption[] {
  const isComic = data.Book.Type === 'Comic'
  return data.Categories.filter((category) =>
    isComic ? COMIC_CATEGORY_NAMES[category.Name] : !COMIC_ONLY_CATEGORY_NAMES[category.Name],
  ).map((category) => ({ label: category.Name, value: category.Id }))
}

export function toBookInfoUpdate(book: EditableBook): EditBookRequest {
  return {
    Cover: book.Cover,
    Title: book.Title,
    Author: book.Author,
    Introduction: book.Introduction,
    CategoryId: book.CategoryId,
  }
}
