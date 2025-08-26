export enum ESoftOrder {
  ASC = "asc",
  DESC = "desc",
}
export class BaseRequest {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: ESoftOrder;
  constructor(params: { page?: number, limit?: number, search?: string, sortBy?: string, sortOrder?: ESoftOrder }) {
    const { page =1, limit =10, search, sortBy, sortOrder = ESoftOrder.DESC } = params;
    this.page = page;
    this.limit = limit;
    this.search = search;
    this.sortBy = sortBy;
    this.sortOrder = sortOrder;
  }
}
