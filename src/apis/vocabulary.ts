import axiosInstance from '@/config/axiosConfig'
import { BaseRequest } from '@/interface/base-request.interface'
import { PageResponseDto } from '@/interface/pagination.inerface'
import {
  CreateVocabularyListInput,
  CreateVocabularyTermInput,
  CreateVocabularyUnitInput,
  UpdateVocabularyListInput,
  UpdateVocabularyTermInput,
  UpdateVocabularyUnitInput,
  VocabularyList,
  VocabularyTerm,
  VocabularyUnit,
  VocabularyUnitWithTerms,
} from '@/interface/vocabulary.interface'

export const getVocabularyLists = async (
  params: BaseRequest,
): Promise<PageResponseDto<VocabularyList>> => {
  const response = await axiosInstance.get('/private/v1/vocabulary/lists', {
    params: {
      page: params.page,
      limit: params.limit,
      search: params.search,
      sortBy: params.sortBy,
      sortOrder: params.sortOrder,
    },
  })

  const payload = response.data?.data ?? {}
  const items: VocabularyList[] = payload.data ?? []
  const page = payload.page ?? params.page ?? 1
  const limit = payload.limit ?? params.limit ?? items.length ?? 10
  const totalItems = payload.total ?? payload.totalItems ?? items.length ?? 0
  const totalPages = payload.totalPages ?? (limit ? Math.max(1, Math.ceil(totalItems / limit)) : 1)

  return {
    statusCode: response.data?.statusCode ?? 200,
    message: response.data?.message ?? 'Vocabulary lists retrieved successfully',
    data: {
      data: items,
      page,
      limit,
      totalItems,
      totalPages,
      hasNextPage: page < totalPages,
      hasPrevPage: page > 1,
    },
  }
}

export const getVocabularyListById = async (id: string): Promise<VocabularyList> => {
  const response = await axiosInstance.get(`/private/v1/vocabulary/lists/${id}`)
  return response.data.data
}

export const createVocabularyList = async (
  payload: CreateVocabularyListInput,
): Promise<VocabularyList> => {
  const response = await axiosInstance.post('/private/v1/admin/vocabulary/lists', payload)
  return response.data.data
}

export const updateVocabularyList = async (
  id: string,
  payload: UpdateVocabularyListInput,
): Promise<VocabularyList> => {
  const response = await axiosInstance.put(`/private/v1/admin/vocabulary/lists/${id}`, payload)
  return response.data.data
}

export const deleteVocabularyList = async (id: string): Promise<void> => {
  await axiosInstance.delete(`/private/v1/admin/vocabulary/lists/${id}`)
}

export const getVocabularyUnits = async (listId: string): Promise<VocabularyUnit[]> => {
  const response = await axiosInstance.get(`/private/v1/vocabulary/lists/${listId}/units`)
  return response.data.data
}

export const getVocabularyUnitById = async (
  listId: string,
  unitId: string,
): Promise<VocabularyUnitWithTerms> => {
  const response = await axiosInstance.get(
    `/private/v1/vocabulary/lists/${listId}/units/${unitId}`,
  )
  return response.data.data
}

export const createVocabularyUnit = async (
  listId: string,
  payload: CreateVocabularyUnitInput,
): Promise<VocabularyUnit> => {
  const response = await axiosInstance.post(
    `/private/v1/admin/vocabulary/lists/${listId}/units`,
    payload,
  )
  return response.data.data
}

export const updateVocabularyUnit = async (
  unitId: string,
  payload: UpdateVocabularyUnitInput,
): Promise<VocabularyUnit> => {
  const response = await axiosInstance.put(`/private/v1/admin/vocabulary/units/${unitId}`, payload)
  return response.data.data
}

export const deleteVocabularyUnit = async (unitId: string): Promise<void> => {
  await axiosInstance.delete(`/private/v1/admin/vocabulary/units/${unitId}`)
}

export const createVocabularyTerm = async (
  unitId: string,
  payload: CreateVocabularyTermInput,
): Promise<VocabularyTerm> => {
  const response = await axiosInstance.post(
    `/private/v1/admin/vocabulary/units/${unitId}/terms`,
    payload,
  )
  return response.data.data
}

export const updateVocabularyTerm = async (
  termId: string,
  payload: UpdateVocabularyTermInput,
): Promise<VocabularyTerm> => {
  const response = await axiosInstance.put(`/private/v1/admin/vocabulary/terms/${termId}`, payload)
  return response.data.data
}

export const deleteVocabularyTerm = async (termId: string): Promise<void> => {
  await axiosInstance.delete(`/private/v1/admin/vocabulary/terms/${termId}`)
}
