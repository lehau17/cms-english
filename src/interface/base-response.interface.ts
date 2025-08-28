export interface ApiResponse<T> {
  statusCode: number
  message: string
  data: T
}

// Phân trang
export interface Pagination<T> {
  statusCode: number
  message: string
  data: {
    data: T[];
    page: number;
    limit: number;
    totalItems: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  }

}




// Lỗi chuẩn hoá
export interface ApiErrorPayload<T = any> {
  statusCode?: number
  message: string
  data?: T
}


