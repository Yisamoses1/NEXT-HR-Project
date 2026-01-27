export interface PaginationOptions {
  page: number
  limit: number
  sort?: 'asc' | 'desc'
  filter?: string
  search?: string
}
export interface PaginatedResponse<T> {
  meta: {
    total: number
    page: number
    limit: number
  }
  items: T[]
}
