import { BaseRequest, ESoftOrder } from "@/interface/base-request.interface"
import { ApiResponse, Pagination } from "@/interface/base-response.interface"
import { UseQueryOptions, useQuery } from "@tanstack/react-query"
import { useState } from "react"

type HookProps<T> = {
  queryKey: (string | number | object)[]
  queryFn: (params: BaseRequest) => Promise<ApiResponse<Pagination<T>>>
  initial?: Partial<BaseRequest>
  options?: Omit<
    UseQueryOptions<ApiResponse<Pagination<T>>, Error>,
    "queryKey" | "queryFn"
  >
}

export function useBaseRequestQuery<T>({
  queryKey,
  queryFn,
  initial,
  options,
}: HookProps<T>) {
  const [request, setRequest] = useState<BaseRequest>(
    new BaseRequest(initial || {})
  )

  const query = useQuery<ApiResponse<Pagination<T>>, Error>({
    queryKey: [...queryKey, request],
    queryFn: () => queryFn(request),
    ...options,
  })

  // Helpers để update request
  const setPage = (page: number) =>
    setRequest((prev) => new BaseRequest({ ...prev, page }))
  const setLimit = (limit: number) =>
    setRequest((prev) => new BaseRequest({ ...prev, limit }))
  const setSearch = (search: string) =>
    setRequest((prev) => new BaseRequest({ ...prev, search }))
  const setSort = (sortBy: string, sortOrder: ESoftOrder) =>
    setRequest((prev) => new BaseRequest({ ...prev, sortBy, sortOrder }))

  return {
    ...query,
    request,
    setRequest, // nếu muốn set trực tiếp
    setPage,
    setLimit,
    setSearch,
    setSort,
  }
}
