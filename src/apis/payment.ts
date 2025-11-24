import { ApiResponse } from "@/interface/base-response.interface";
import axiosInstance from "../config/axiosConfig";
import { PaymentStatus, Transaction } from "../interface/payment.interface";

export interface GetTransactionsQuery {
    limit?: number;
    cursor?: string;
    status?: PaymentStatus;
    studentId?: string;
    startDate?: string;
    endDate?: string;
}

export interface TransactionListResponse {
    data: Transaction[];
    total: number;
    nextCursor?: string;
}

export const getAllTransactions = async (params: GetTransactionsQuery): Promise<TransactionListResponse> => {
    const response = await axiosInstance.get<ApiResponse<TransactionListResponse>>("/private/v1/payment/admin/transactions", { params });
    return response.data.data;
};
