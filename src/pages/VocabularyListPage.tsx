import {
  createVocabularyList,
  deleteVocabularyList,
  getVocabularyLists,
  updateVocabularyList,
} from '@/apis/vocabulary'
import { useBaseRequestQuery } from '@/hooks/useBaseRequestQuery'
import { ESoftOrder } from '@/interface/base-request.interface'
import { DifficultyLevel, LanguageCode } from '@/interface/enums'
import {
  CreateVocabularyListInput,
  UpdateVocabularyListInput,
  VocabularyList,
} from '@/interface/vocabulary.interface'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import {
  ArrowUpDown,
  Edit,
  ListChecks,
  Plus,
  Search,
  Trash2,
} from 'lucide-react'
import React, { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'

const defaultListForm: CreateVocabularyListInput = {
  title: '',
  description: '',
  difficulty: DifficultyLevel.BEGINNER,
  category: '',
  level: '',
  thumbnailUrl: '',
  bannerUrl: '',
  isPublic: true,
  language: LanguageCode.EN,
}

type ListFormState = CreateVocabularyListInput

const difficultyOptions = Object.values(DifficultyLevel).map((value) => ({
  value,
  label: value
    .split('_')
    .map((chunk) => chunk.charAt(0).toUpperCase() + chunk.slice(1))
    .join(' '),
}))

const languageOptions = Object.values(LanguageCode).map((value) => ({
  value,
  label: value.toUpperCase(),
}))

const Modal: React.FC<{
  open: boolean
  title: string
  onClose: () => void
  children: React.ReactNode
}> = ({ open, title, onClose, children }) => {
  if (!open) return null
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 px-4 py-6">
      <div className="w-full max-w-2xl overflow-hidden rounded-2xl bg-white shadow-xl">
        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
          <h3 className="text-lg font-semibold text-slate-900">{title}</h3>
          <button
            onClick={onClose}
            className="rounded-full bg-slate-100 px-3 py-1 text-sm font-medium text-slate-600 hover:bg-slate-200"
          >
            Đóng
          </button>
        </div>
        <div className="max-h-[75vh] overflow-y-auto px-6 py-5">{children}</div>
      </div>
    </div>
  )
}

const ConfirmDialog: React.FC<{
  open: boolean
  description: string
  onConfirm: () => void
  onCancel: () => void
}> = ({ open, description, onConfirm, onCancel }) => {
  if (!open) return null
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 px-4">
      <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl">
        <p className="text-sm text-slate-600">{description}</p>
        <div className="mt-6 flex justify-end gap-3">
          <button
            onClick={onCancel}
            className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-50"
          >
            Hủy
          </button>
          <button
            onClick={onConfirm}
            className="rounded-lg bg-rose-600 px-4 py-2 text-sm font-semibold text-white hover:bg-rose-700"
          >
            Xóa
          </button>
        </div>
      </div>
    </div>
  )
}

const VocabularyListPage: React.FC = () => {
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  const {
    data,
    isLoading,
    setPage,
    setLimit,
    setSearch,
    setSort,
    request,
    refetch,
  } = useBaseRequestQuery<VocabularyList>({
    queryKey: ['admin-vocabulary-lists'],
    queryFn: getVocabularyLists,
    initial: { sortBy: 'createdAt', sortOrder: ESoftOrder.DESC },
  })

  const lists = data?.data.data ?? []
  const pagination = data?.data

  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [isEditOpen, setIsEditOpen] = useState(false)
  const [selectedList, setSelectedList] = useState<VocabularyList | null>(null)
  const [formState, setFormState] = useState<ListFormState>(defaultListForm)
  const [isDeleteOpen, setIsDeleteOpen] = useState(false)

  const resetForm = () => {
    setFormState({ ...defaultListForm })
  }

  const createMutation = useMutation({
    mutationFn: (payload: CreateVocabularyListInput) => createVocabularyList(payload),
    onSuccess: () => {
      toast.success('Tạo danh sách từ vựng thành công')
      queryClient.invalidateQueries({ queryKey: ['admin-vocabulary-lists'] })
      setIsCreateOpen(false)
      resetForm()
    },
    onError: () => toast.error('Không thể tạo danh sách'),
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateVocabularyListInput }) =>
      updateVocabularyList(id, payload),
    onSuccess: () => {
      toast.success('Cập nhật danh sách thành công')
      queryClient.invalidateQueries({ queryKey: ['admin-vocabulary-lists'] })
      setIsEditOpen(false)
      setSelectedList(null)
    },
    onError: () => toast.error('Không thể cập nhật danh sách'),
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteVocabularyList(id),
    onSuccess: () => {
      toast.success('Đã xóa danh sách')
      queryClient.invalidateQueries({ queryKey: ['admin-vocabulary-lists'] })
      setIsDeleteOpen(false)
      setSelectedList(null)
    },
    onError: () => toast.error('Không thể xóa danh sách'),
  })

  const handleOpenCreate = () => {
    resetForm()
    setIsCreateOpen(true)
  }

  const handleOpenEdit = (list: VocabularyList) => {
    setSelectedList(list)
    setFormState({
      title: list.title,
      description: list.description,
      difficulty: list.difficulty,
      category: list.category,
      level: list.level,
      thumbnailUrl: list.thumbnailUrl,
      bannerUrl: list.bannerUrl,
      isPublic: list.isPublic,
      language: list.language,
    })
    setIsEditOpen(true)
  }

  const handleSubmitCreate = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    createMutation.mutate(formState)
  }

  const handleSubmitEdit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!selectedList) return
    const payload: UpdateVocabularyListInput = {
      ...formState,
    }
    updateMutation.mutate({ id: selectedList.id, payload })
  }

  const handleDelete = (list: VocabularyList) => {
    setSelectedList(list)
    setIsDeleteOpen(true)
  }

  const handleConfirmDelete = () => {
    if (!selectedList) return
    deleteMutation.mutate(selectedList.id)
  }

  const handleSortToggle = () => {
    const nextOrder = request.sortOrder === ESoftOrder.DESC ? ESoftOrder.ASC : ESoftOrder.DESC
    setSort('createdAt', nextOrder)
    refetch()
  }

  const renderDifficultyBadge = (difficulty: DifficultyLevel) => {
    const base = 'px-2.5 py-1 rounded-full text-xs font-semibold'
    switch (difficulty) {
      case DifficultyLevel.BEGINNER:
        return <span className={`${base} bg-emerald-100 text-emerald-700`}>Beginner</span>
      case DifficultyLevel.INTERMEDIATE:
        return <span className={`${base} bg-sky-100 text-sky-700`}>Intermediate</span>
      case DifficultyLevel.ADVANCED:
        return <span className={`${base} bg-purple-100 text-purple-700`}>Advanced</span>
      default:
        return <span className={`${base} bg-slate-100 text-slate-700`}>{difficulty}</span>
    }
  }

  const renderedRows = useMemo(
    () =>
      lists.map((list) => (
        <tr
          key={list.id}
          className="rounded-xl border border-slate-100 bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
        >
          <td className="px-4 py-3 align-top">
            <div className="font-semibold text-slate-900">{list.title}</div>
            <div className="text-xs text-slate-500">{list.description || 'Không có mô tả'}</div>
          </td>
          <td className="px-4 py-3 align-top">
            <div className="flex flex-wrap gap-2">
              {renderDifficultyBadge(list.difficulty)}
              <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600">
                {list.language.toUpperCase()}
              </span>
              <span className="rounded-full bg-indigo-50 px-2.5 py-1 text-xs font-medium text-indigo-600">
                {list.totalUnits} units
              </span>
              <span className="rounded-full bg-amber-50 px-2.5 py-1 text-xs font-medium text-amber-600">
                {list.totalTerms} terms
              </span>
            </div>
          </td>
          <td className="px-4 py-3 align-top text-sm text-slate-500">
            <div>{new Date(list.createdAt).toLocaleDateString()}</div>
            <div className="text-xs">Cập nhật {new Date(list.updatedAt).toLocaleDateString()}</div>
          </td>
          <td className="px-4 py-3 align-top text-right text-sm">
            <div className="flex justify-end gap-2">
              <button
                onClick={() => navigate(`/vocabulary/${list.id}`)}
                className="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-50"
              >
                <ListChecks className="h-3.5 w-3.5" />
                Quản lý
              </button>
              <button
                onClick={() => handleOpenEdit(list)}
                className="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-50"
              >
                <Edit className="h-3.5 w-3.5" />
                Sửa
              </button>
              <button
                onClick={() => handleDelete(list)}
                className="inline-flex items-center gap-1 rounded-lg border border-rose-200 px-3 py-1.5 text-xs font-semibold text-rose-600 hover:bg-rose-50"
              >
                <Trash2 className="h-3.5 w-3.5" />
                Xóa
              </button>
            </div>
          </td>
        </tr>
      )),
    [lists, navigate],
  )

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50 p-4 sm:p-6">
      <div className="mx-auto max-w-7xl space-y-6">
        <div className="flex flex-col gap-4 rounded-3xl bg-white p-6 shadow-sm sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 sm:text-3xl">Vocabulary Management</h1>
            <p className="mt-1 text-sm text-slate-500">
              Quản lý danh sách từ vựng, unit và các từ cho học viên.
            </p>
          </div>
          <button
            onClick={handleOpenCreate}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg transition hover:from-indigo-700 hover:to-purple-700 hover:-translate-y-0.5"
          >
            <Plus className="h-4 w-4" />
            Tạo danh sách mới
          </button>
        </div>

        <div className="rounded-2xl bg-white p-4 shadow-sm sm:p-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex flex-1 gap-3">
              <div className="relative flex-1">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  value={request.search || ''}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Tìm kiếm theo tiêu đề, mô tả..."
                  className="w-full rounded-xl border border-slate-200 bg-white px-9 py-2.5 text-sm text-slate-700 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-100"
                />
              </div>
              <button
                onClick={handleSortToggle}
                className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-50"
              >
                <ArrowUpDown className="h-4 w-4" />
                Sắp xếp
              </button>
            </div>
            <div className="flex items-center gap-2">
              <label className="text-xs font-medium text-slate-500">Hiển thị:</label>
              <select
                value={request.limit}
                onChange={(event) => setLimit(Number(event.target.value))}
                className="rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-600 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-100"
              >
                {[10, 20, 50].map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="mt-6 overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-100 text-left">
              <thead>
                <tr className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  <th className="px-4 py-3">Danh sách</th>
                  <th className="px-4 py-3">Thông tin</th>
                  <th className="px-4 py-3">Thời gian</th>
                  <th className="px-4 py-3 text-right">Hành động</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {isLoading ? (
                  <tr>
                    <td colSpan={4} className="px-4 py-8 text-center text-sm text-slate-500">
                      Đang tải dữ liệu...
                    </td>
                  </tr>
                ) : lists.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-4 py-8 text-center text-sm text-slate-500">
                      Chưa có danh sách nào.
                    </td>
                  </tr>
                ) : (
                  renderedRows
                )}
              </tbody>
            </table>
          </div>

          {pagination && (
            <div className="mt-6 flex flex-col items-center justify-between gap-4 border-t border-slate-100 pt-4 text-sm text-slate-600 sm:flex-row">
              <div>
                Hiển thị trang {pagination.page} / {pagination.totalPages} · Tổng {pagination.totalItems}
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setPage(Math.max(1, (pagination.page ?? 1) - 1))}
                  className="rounded-full border border-slate-200 px-3 py-1 text-xs font-medium text-slate-600 hover:bg-slate-50"
                  disabled={(pagination.page ?? 1) === 1}
                >
                  ← Trước
                </button>
                <button
                  onClick={() =>
                    setPage(
                      Math.min(pagination.totalPages || 1, (pagination.page ?? 1) + 1),
                    )
                  }
                  className="rounded-full border border-slate-200 px-3 py-1 text-xs font-medium text-slate-600 hover:bg-slate-50"
                  disabled={(pagination.page ?? 1) >= (pagination.totalPages || 1)}
                >
                  Sau →
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      <Modal open={isCreateOpen} title="Tạo danh sách từ vựng" onClose={() => setIsCreateOpen(false)}>
        <form className="space-y-4" onSubmit={handleSubmitCreate}>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Tiêu đề *</label>
              <input
                value={formState.title}
                onChange={(event) =>
                  setFormState((prev) => ({ ...prev, title: event.target.value }))
                }
                className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-100"
                required
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Difficulty *</label>
              <select
                value={formState.difficulty}
                onChange={(event) =>
                  setFormState((prev) => ({
                    ...prev,
                    difficulty: event.target.value as DifficultyLevel,
                  }))
                }
                className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-100"
              >
                {difficultyOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Category</label>
              <input
                value={formState.category || ''}
                onChange={(event) =>
                  setFormState((prev) => ({ ...prev, category: event.target.value }))
                }
                className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-100"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">CEFR Level</label>
              <input
                value={formState.level || ''}
                onChange={(event) =>
                  setFormState((prev) => ({ ...prev, level: event.target.value }))
                }
                className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-100"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700">Mô tả</label>
            <textarea
              value={formState.description || ''}
              onChange={(event) =>
                setFormState((prev) => ({ ...prev, description: event.target.value }))
              }
              className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-100"
              rows={3}
            />
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Language</label>
              <select
                value={formState.language}
                onChange={(event) =>
                  setFormState((prev) => ({
                    ...prev,
                    language: event.target.value as LanguageCode,
                  }))
                }
                className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-100"
              >
                {languageOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Public list?</label>
              <div className="flex items-center gap-3 rounded-xl border border-slate-200 px-4 py-2">
                <label className="flex items-center gap-2 text-sm text-slate-600">
                  <input
                    type="checkbox"
                    checked={formState.isPublic ?? true}
                    onChange={(event) =>
                      setFormState((prev) => ({ ...prev, isPublic: event.target.checked }))
                    }
                    className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                  />
                  Public
                </label>
              </div>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Thumbnail URL</label>
              <input
                value={formState.thumbnailUrl || ''}
                onChange={(event) =>
                  setFormState((prev) => ({ ...prev, thumbnailUrl: event.target.value }))
                }
                className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-100"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Banner URL</label>
              <input
                value={formState.bannerUrl || ''}
                onChange={(event) =>
                  setFormState((prev) => ({ ...prev, bannerUrl: event.target.value }))
                }
                className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-100"
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-3">
            <button
              type="button"
              onClick={() => setIsCreateOpen(false)}
              className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-50"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={createMutation.isPending}
              className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow hover:bg-indigo-700 disabled:opacity-60"
            >
              {createMutation.isPending ? 'Đang tạo...' : 'Tạo danh sách'}
            </button>
          </div>
        </form>
      </Modal>

      <Modal open={isEditOpen} title="Cập nhật danh sách" onClose={() => setIsEditOpen(false)}>
        <form className="space-y-4" onSubmit={handleSubmitEdit}>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Tiêu đề *</label>
              <input
                value={formState.title}
                onChange={(event) =>
                  setFormState((prev) => ({ ...prev, title: event.target.value }))
                }
                className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-100"
                required
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Difficulty *</label>
              <select
                value={formState.difficulty}
                onChange={(event) =>
                  setFormState((prev) => ({
                    ...prev,
                    difficulty: event.target.value as DifficultyLevel,
                  }))
                }
                className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-100"
              >
                {difficultyOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700">Mô tả</label>
            <textarea
              value={formState.description || ''}
              onChange={(event) =>
                setFormState((prev) => ({ ...prev, description: event.target.value }))
              }
              className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-100"
              rows={3}
            />
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Category</label>
              <input
                value={formState.category || ''}
                onChange={(event) =>
                  setFormState((prev) => ({ ...prev, category: event.target.value }))
                }
                className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-100"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">CEFR Level</label>
              <input
                value={formState.level || ''}
                onChange={(event) =>
                  setFormState((prev) => ({ ...prev, level: event.target.value }))
                }
                className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-100"
              />
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Language</label>
              <select
                value={formState.language}
                onChange={(event) =>
                  setFormState((prev) => ({
                    ...prev,
                    language: event.target.value as LanguageCode,
                  }))
                }
                className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-100"
              >
                {languageOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Public list?</label>
              <div className="flex items-center gap-3 rounded-xl border border-slate-200 px-4 py-2">
                <label className="flex items-center gap-2 text-sm text-slate-600">
                  <input
                    type="checkbox"
                    checked={formState.isPublic ?? true}
                    onChange={(event) =>
                      setFormState((prev) => ({ ...prev, isPublic: event.target.checked }))
                    }
                    className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                  />
                  Public
                </label>
              </div>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Thumbnail URL</label>
              <input
                value={formState.thumbnailUrl || ''}
                onChange={(event) =>
                  setFormState((prev) => ({ ...prev, thumbnailUrl: event.target.value }))
                }
                className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-100"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Banner URL</label>
              <input
                value={formState.bannerUrl || ''}
                onChange={(event) =>
                  setFormState((prev) => ({ ...prev, bannerUrl: event.target.value }))
                }
                className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-100"
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-3">
            <button
              type="button"
              onClick={() => setIsEditOpen(false)}
              className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-50"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={updateMutation.isPending}
              className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow hover:bg-indigo-700 disabled:opacity-60"
            >
              {updateMutation.isPending ? 'Đang lưu...' : 'Lưu thay đổi'}
            </button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        open={isDeleteOpen}
        description={`Bạn có chắc muốn xóa danh sách "${selectedList?.title ?? ''}"?`}
        onCancel={() => {
          setIsDeleteOpen(false)
          setSelectedList(null)
        }}
        onConfirm={handleConfirmDelete}
      />
    </div>
  )
}

export default VocabularyListPage
