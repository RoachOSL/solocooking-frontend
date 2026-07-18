// Mirror of backend common.dto.PageResponse<T>.
export interface PageMetadata {
  number: number
  size: number
  totalElements: number
  totalPages: number
}

export interface PageResponse<T> {
  content: T[]
  page: PageMetadata
}
