export interface ApiResponse<T> {
  statusCode: number
  message: string
  data: T
}

// Phân trang
export interface Pagination<T> {
  page: number
  limit: number
  totalItems: number
  totalPages: number
  hasNextPage: boolean
  hasPrevPage: boolean
  data: T[]

}




// Lỗi chuẩn hoá
export interface ApiErrorPayload<T = any> {
  statusCode?: number
  message: string
  data?: T
}


