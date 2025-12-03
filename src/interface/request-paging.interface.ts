export interface RequestPagingDto {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  search?: string;
  status?: string;
  gender?: string;
  phone?: string;
}
