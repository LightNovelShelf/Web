import type { EditBookRequest, EditableBook, GetBookEditInfoResponse } from '@/services/book/types'

export interface BookCategoryOption {
  label: string
  value: number
}

export function buildBookCategoryOptions(data: GetBookEditInfoResponse): BookCategoryOption[] {
  return data.Categories.map((category) => ({ label: category.Name, value: category.Id }))
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
