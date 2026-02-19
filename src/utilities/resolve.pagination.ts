export interface PaginationParams {
  page?: string | number
  limit?: string | number
  sort?: 'asc' | 'desc'
}

export const resolvePagination = (params: PaginationParams) => {
  const page = Math.max(1, Number(params.page) || 1)
  const limit = Math.min(100, Math.max(1, Number(params.limit) || 20))
  const sort: 'asc' | 'desc' = params.sort === 'desc' ? 'desc' : 'asc'

  return {
    page,
    limit,
    sort,
  }
}
