interface PaginationParams {
  page?: number
  limit?: number
  sort?: 'asc' | 'desc'
}

export const resolvePagination = (params: PaginationParams) => {
  return {
    page: params.page ? Number(params.page) : 1,
    limit: params.limit ? Number(params.limit) : 20,
    sort: params.sort || 'asc',
  }
}
