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
    status?: string;
    gender?: string;
    phone?: string;
    constructor(params: {
        page?: number;
        limit?: number;
        search?: string;
        sortBy?: string;
        sortOrder?: ESoftOrder;
        status?: string;
        gender?: string;
        phone?: string;
    }) {
        const { page = 1, limit = 10, search, sortBy, sortOrder = ESoftOrder.DESC, status, gender, phone } = params;
        this.page = page;
        this.limit = limit;
        this.search = search;
        this.sortBy = sortBy;
        this.sortOrder = sortOrder;
        this.status = status;
        this.gender = gender;
        this.phone = phone;
    }
}
