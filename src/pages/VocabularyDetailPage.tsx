import {
  createVocabularyTerm,
  createVocabularyUnit,
  deleteVocabularyTerm,
  deleteVocabularyUnit,
  getVocabularyListById,
  getVocabularyUnitById,
  getVocabularyUnits,
  suggestVocabularyUnit,
  suggestVocabularyTerms,
  autoCompleteVocabularyTerm,
  updateVocabularyTerm,
  updateVocabularyUnit,
} from '@/apis/vocabulary'
import { DifficultyLevel } from '@/interface/enums'
import {
  CreateVocabularyTermInput,
  CreateVocabularyUnitInput,
  UpdateVocabularyTermInput,
  UpdateVocabularyUnitInput,
  VocabularyList,
  VocabularyTerm,
  VocabularyUnit,
  VocabularyUnitWithTerms,
} from '@/interface/vocabulary.interface'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  ArrowLeft,
  BookOpen,
  ChevronDown,
  ChevronRight,
  Edit,
  Layers,
  Plus,
  Sparkles,
  Trash2,
} from 'lucide-react'
import React, { useMemo, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import toast from 'react-hot-toast'
import TermModalWithAI from '@/components/vocabulary/TermModalWithAI'

const difficultyOptions = Object.values(DifficultyLevel).map((value) => ({
  value,
  label: value
    .split('_')
    .map((chunk) => chunk.charAt(0).toUpperCase() + chunk.slice(1))
    .join(' '),
}))

type UnitFormState = {
  title: string
  description?: string
  orderIndex?: number
}

type TermFormState = {
  word: string
  definition: string
  translationVi?: string
  pronunciation?: string
  partOfSpeech?: string
  audioUrl?: string
  imageUrl?: string
  synonyms?: string
  antonyms?: string
  examples?: string
  difficulty: DifficultyLevel
  orderIndex?: number
}

const defaultUnitForm: UnitFormState = {
  title: '',
  description: '',
}

const defaultTermForm: TermFormState = {
  word: '',
  definition: '',
  translationVi: '',
  pronunciation: '',
  partOfSpeech: '',
  audioUrl: '',
  imageUrl: '',
  synonyms: '',
  antonyms: '',
  examples: '',
  difficulty: DifficultyLevel.BEGINNER,
}

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

const VocabularyDetailPage: React.FC = () => {
  const { listId } = useParams<{ listId: string }>()
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  const {
    data: list,
    isLoading: listLoading,
  } = useQuery<VocabularyList>({
    queryKey: ['vocabulary-list', listId],
    queryFn: () => getVocabularyListById(listId!),
    enabled: Boolean(listId),
  })

  const {
    data: units,
    isLoading: unitsLoading,
  } = useQuery<VocabularyUnit[]>({
    queryKey: ['vocabulary-units', listId],
    queryFn: () => getVocabularyUnits(listId!),
    enabled: Boolean(listId),
  })

  const [expandedUnitId, setExpandedUnitId] = useState<string | null>(null)
  const {
    data: expandedUnit,
    isLoading: unitDetailLoading,
  } = useQuery<VocabularyUnitWithTerms>({
    queryKey: ['vocabulary-unit', expandedUnitId],
    queryFn: () => getVocabularyUnitById(listId!, expandedUnitId!),
    enabled: Boolean(listId && expandedUnitId),
  })

  const [unitModalMode, setUnitModalMode] = useState<'create' | 'edit'>('create')
  const [isUnitModalOpen, setIsUnitModalOpen] = useState(false)
  const [unitForm, setUnitForm] = useState<UnitFormState>(defaultUnitForm)
  const [selectedUnit, setSelectedUnit] = useState<VocabularyUnit | null>(null)
  const [isUnitDeleteOpen, setIsUnitDeleteOpen] = useState(false)

  // AI suggestions state
  const [showAiSuggestions, setShowAiSuggestions] = useState(false)
  const [aiSuggestions, setAiSuggestions] = useState<
    Array<{ title: string; description: string }>
  >([])
  const [selectedSuggestionIndex, setSelectedSuggestionIndex] = useState<number | null>(null)
  const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(false)

  const [termModalMode, setTermModalMode] = useState<'create' | 'edit'>('create')
  const [isTermModalOpen, setIsTermModalOpen] = useState(false)
  const [termForm, setTermForm] = useState<TermFormState>(defaultTermForm)
  const [selectedTerm, setSelectedTerm] = useState<VocabularyTerm | null>(null)
  const [isTermDeleteOpen, setIsTermDeleteOpen] = useState(false)

  // AI term suggestions state
  const [termTabMode, setTermTabMode] = useState<'ai-generate' | 'manual-input'>(
    'ai-generate',
  )
  const [showTermSuggestions, setShowTermSuggestions] = useState(false)
  const [termSuggestions, setTermSuggestions] = useState<Array<{ word: string; hint: string }>>(
    [],
  )
  const [selectedTermSuggestionIndex, setSelectedTermSuggestionIndex] = useState<number | null>(
    null,
  )
  const [isLoadingTermSuggestions, setIsLoadingTermSuggestions] = useState(false)
  const [isAutoCompleting, setIsAutoCompleting] = useState(false)
  const [manualWord, setManualWord] = useState('')

  const unitCreateMutation = useMutation({
    mutationFn: (payload: CreateVocabularyUnitInput) => createVocabularyUnit(listId!, payload),
    onSuccess: () => {
      toast.success('Đã tạo unit mới')
      queryClient.invalidateQueries({ queryKey: ['vocabulary-units', listId] })
      setIsUnitModalOpen(false)
      setUnitForm(defaultUnitForm)
    },
    onError: () => toast.error('Không thể tạo unit'),
  })

  const unitUpdateMutation = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateVocabularyUnitInput }) =>
      updateVocabularyUnit(id, payload),
    onSuccess: (_, variables) => {
      toast.success('Đã cập nhật unit')
      queryClient.invalidateQueries({ queryKey: ['vocabulary-units', listId] })
      queryClient.invalidateQueries({ queryKey: ['vocabulary-unit', variables.id] })
      setIsUnitModalOpen(false)
      setSelectedUnit(null)
    },
    onError: () => toast.error('Không thể cập nhật unit'),
  })

  const unitDeleteMutation = useMutation({
    mutationFn: (unitId: string) => deleteVocabularyUnit(unitId),
    onSuccess: (_, unitId) => {
      toast.success('Đã xóa unit')
      queryClient.invalidateQueries({ queryKey: ['vocabulary-units', listId] })
      queryClient.invalidateQueries({ queryKey: ['vocabulary-unit', unitId] })
      setIsUnitDeleteOpen(false)
      if (expandedUnitId === unitId) {
        setExpandedUnitId(null)
      }
    },
    onError: () => toast.error('Không thể xóa unit'),
  })

  const termCreateMutation = useMutation({
    mutationFn: (payload: { unitId: string; data: CreateVocabularyTermInput }) =>
      createVocabularyTerm(payload.unitId, payload.data),
    onSuccess: (_, variables) => {
      toast.success('Đã thêm từ vựng')
      queryClient.invalidateQueries({ queryKey: ['vocabulary-unit', variables.unitId] })
      queryClient.invalidateQueries({ queryKey: ['vocabulary-units', listId] })
      setIsTermModalOpen(false)
      setTermForm(defaultTermForm)
    },
    onError: () => toast.error('Không thể thêm từ vựng'),
  })

  const termUpdateMutation = useMutation({
    mutationFn: ({ termId, data }: { termId: string; data: UpdateVocabularyTermInput }) =>
      updateVocabularyTerm(termId, data),
    onSuccess: (_, variables) => {
      toast.success('Đã cập nhật từ vựng')
      if (expandedUnitId) {
        queryClient.invalidateQueries({ queryKey: ['vocabulary-unit', expandedUnitId] })
      }
      queryClient.invalidateQueries({ queryKey: ['vocabulary-units', listId] })
      setIsTermModalOpen(false)
      setSelectedTerm(null)
    },
    onError: () => toast.error('Không thể cập nhật từ vựng'),
  })

  const termDeleteMutation = useMutation({
    mutationFn: (termId: string) => deleteVocabularyTerm(termId),
    onSuccess: () => {
      toast.success('Đã xóa từ vựng')
      if (expandedUnitId) {
        queryClient.invalidateQueries({ queryKey: ['vocabulary-unit', expandedUnitId] })
      }
      queryClient.invalidateQueries({ queryKey: ['vocabulary-units', listId] })
      setIsTermDeleteOpen(false)
      setSelectedTerm(null)
    },
    onError: () => toast.error('Không thể xóa từ vựng'),
  })

  const handleOpenCreateUnit = () => {
    setUnitModalMode('create')
    setUnitForm(defaultUnitForm)
    setShowAiSuggestions(false)
    setAiSuggestions([])
    setSelectedSuggestionIndex(null)
    setIsUnitModalOpen(true)
  }

  const handleGetAiSuggestions = async () => {
    if (!listId) return

    setIsLoadingSuggestions(true)
    setShowAiSuggestions(false)

    try {
      const result = await suggestVocabularyUnit(listId)
      setAiSuggestions(result.suggestions || [])
      setShowAiSuggestions(true)
      setSelectedSuggestionIndex(null)
      toast.success('Đã tạo gợi ý từ AI')
    } catch (error) {
      toast.error('Không thể lấy gợi ý từ AI')
      console.error('AI suggestion error:', error)
    } finally {
      setIsLoadingSuggestions(false)
    }
  }

  const handleSelectSuggestion = (index: number) => {
    setSelectedSuggestionIndex(index)
    const suggestion = aiSuggestions[index]
    setUnitForm({
      title: suggestion.title,
      description: suggestion.description,
      orderIndex: unitForm.orderIndex,
    })
  }

  const handleOpenEditUnit = (unit: VocabularyUnit) => {
    setSelectedUnit(unit)
    setUnitModalMode('edit')
    setUnitForm({
      title: unit.title,
      description: unit.description,
      orderIndex: unit.orderIndex,
    })
    setIsUnitModalOpen(true)
  }

  const handleSubmitUnit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (unitModalMode === 'create') {
      unitCreateMutation.mutate({
        title: unitForm.title,
        description: unitForm.description,
        orderIndex: unitForm.orderIndex,
      })
    } else if (selectedUnit) {
      const payload: UpdateVocabularyUnitInput = {
        title: unitForm.title,
        description: unitForm.description,
        orderIndex: unitForm.orderIndex,
      }
      unitUpdateMutation.mutate({ id: selectedUnit.id, payload })
    }
  }

  const handleDeleteUnit = (unit: VocabularyUnit) => {
    setSelectedUnit(unit)
    setIsUnitDeleteOpen(true)
  }

  const handleConfirmDeleteUnit = () => {
    if (!selectedUnit) return
    unitDeleteMutation.mutate(selectedUnit.id)
  }

  const handleExpandUnit = (unitId: string) => {
    setExpandedUnitId((prev) => (prev === unitId ? null : unitId))
  }

  const handleOpenCreateTerm = (unitId: string) => {
    setTermModalMode('create')
    setSelectedTerm(null)
    setTermForm({ ...defaultTermForm })
    setExpandedUnitId(unitId)
    setTermTabMode('ai-generate')
    setShowTermSuggestions(false)
    setTermSuggestions([])
    setSelectedTermSuggestionIndex(null)
    setManualWord('')
    setIsTermModalOpen(true)
  }

  const handleGetTermSuggestions = async () => {
    if (!expandedUnitId) return

    setIsLoadingTermSuggestions(true)
    setShowTermSuggestions(false)

    try {
      const result = await suggestVocabularyTerms(expandedUnitId)
      setTermSuggestions(result.suggestions || [])
      setShowTermSuggestions(true)
      setSelectedTermSuggestionIndex(null)
      toast.success('Đã tạo gợi ý từ vựng từ AI')
    } catch (error) {
      toast.error('Không thể lấy gợi ý từ AI')
      console.error('AI term suggestion error:', error)
    } finally {
      setIsLoadingTermSuggestions(false)
    }
  }

  const handleSelectTermSuggestion = async (index: number) => {
    setSelectedTermSuggestionIndex(index)
    const suggestion = termSuggestions[index]

    // Auto-complete full data for selected word
    setIsAutoCompleting(true)
    try {
      const data = await autoCompleteVocabularyTerm(suggestion.word)
      setTermForm({
        word: data.word,
        definition: data.definition,
        translationVi: data.translationVi,
        pronunciation: data.pronunciation,
        partOfSpeech: data.partOfSpeech,
        audioUrl: data.audioUrl || '',
        imageUrl: '',
        synonyms: data.synonyms.join(', '),
        antonyms: data.antonyms.join(', '),
        examples: data.examples
          .map((ex) => `${ex.sentence} | ${ex.translation}`)
          .join('\n'),
        difficulty: data.difficulty as any,
        orderIndex: termForm.orderIndex,
      })
      toast.success('Đã điền dữ liệu từ AI')
    } catch (error) {
      toast.error('Không thể lấy dữ liệu từ AI')
      console.error('Auto-complete error:', error)
    } finally {
      setIsAutoCompleting(false)
    }
  }

  const handleManualAutoComplete = async () => {
    if (!manualWord.trim()) {
      toast.error('Vui lòng nhập từ vựng')
      return
    }

    setIsAutoCompleting(true)
    try {
      const data = await autoCompleteVocabularyTerm(manualWord.trim())
      setTermForm({
        word: data.word,
        definition: data.definition,
        translationVi: data.translationVi,
        pronunciation: data.pronunciation,
        partOfSpeech: data.partOfSpeech,
        audioUrl: data.audioUrl || '',
        imageUrl: '',
        synonyms: data.synonyms.join(', '),
        antonyms: data.antonyms.join(', '),
        examples: data.examples
          .map((ex) => `${ex.sentence} | ${ex.translation}`)
          .join('\n'),
        difficulty: data.difficulty as any,
        orderIndex: termForm.orderIndex,
      })
      toast.success('Đã điền dữ liệu từ AI')
    } catch (error) {
      toast.error('Không thể lấy dữ liệu từ AI')
      console.error('Auto-complete error:', error)
    } finally {
      setIsAutoCompleting(false)
    }
  }

  const parseArrayField = (value?: string) => {
    if (!value) return undefined
    const items = value
      .split(',')
      .map((item) => item.trim())
      .filter(Boolean)
    return items.length > 0 ? items : undefined
  }

  const parseExamples = (value?: string) => {
    if (!value) return undefined
    const lines = value
      .split('\n')
      .map((line) => line.trim())
      .filter(Boolean)
    if (lines.length === 0) return undefined
    return lines.map((line) => {
      const [sentence, translation] = line.split('|')
      return {
        sentence: sentence.trim(),
        translation: translation?.trim() || undefined,
      }
    })
  }

  const handleSubmitTerm = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!expandedUnitId) {
      toast.error('Hãy chọn unit trước')
      return
    }

    const payload: CreateVocabularyTermInput = {
      word: termForm.word.trim(),
      definition: termForm.definition.trim(),
      translationVi: termForm.translationVi?.trim() || undefined,
      pronunciation: termForm.pronunciation?.trim() || undefined,
      partOfSpeech: termForm.partOfSpeech?.trim() || undefined,
      audioUrl: termForm.audioUrl?.trim() || undefined,
      imageUrl: termForm.imageUrl?.trim() || undefined,
      synonyms: parseArrayField(termForm.synonyms),
      antonyms: parseArrayField(termForm.antonyms),
      examples: parseExamples(termForm.examples),
      difficulty: termForm.difficulty,
      orderIndex: termForm.orderIndex,
    }

    if (termModalMode === 'create') {
      termCreateMutation.mutate({ unitId: expandedUnitId, data: payload })
    } else if (selectedTerm) {
      const updatePayload: UpdateVocabularyTermInput = payload
      termUpdateMutation.mutate({ termId: selectedTerm.id, data: updatePayload })
    }
  }

  const handleOpenEditTerm = (term: VocabularyTerm) => {
    setSelectedTerm(term)
    setTermModalMode('edit')
    setIsTermModalOpen(true)
    setTermForm({
      word: term.word,
      definition: term.definition,
      translationVi: term.translationVi,
      pronunciation: term.pronunciation,
      partOfSpeech: term.partOfSpeech,
      audioUrl: term.audioUrl,
      imageUrl: term.imageUrl,
      synonyms: term.synonyms?.join(', '),
      antonyms: term.antonyms?.join(', '),
      examples: term.examples
        ?.map((example) =>
          example.translation
            ? `${example.sentence} | ${example.translation}`
            : example.sentence,
        )
        .join('\n'),
      difficulty: term.difficulty,
      orderIndex: term.orderIndex,
    })
  }

  const handleDeleteTerm = (term: VocabularyTerm) => {
    setSelectedTerm(term)
    setIsTermDeleteOpen(true)
  }

  const handleConfirmDeleteTerm = () => {
    if (!selectedTerm) return
    termDeleteMutation.mutate(selectedTerm.id)
  }

  const renderTermRows = useMemo(() => {
    if (!expandedUnit || !expandedUnit.terms) return null
    if (expandedUnit.terms.length === 0) {
      return (
        <div className="rounded-xl border border-dashed border-slate-200 p-6 text-sm text-slate-500">
          Chưa có từ vựng nào trong unit này.
        </div>
      )
    }

    return (
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-slate-100 text-left">
          <thead>
            <tr className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              <th className="px-4 py-3">Từ vựng</th>
              <th className="px-4 py-3">Định nghĩa</th>
              <th className="px-4 py-3">Dịch nghĩa</th>
              <th className="px-4 py-3">Độ khó</th>
              <th className="px-4 py-3 text-right">Hành động</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {expandedUnit.terms.map((term) => (
              <tr key={term.id} className="bg-white">
                <td className="px-4 py-3 align-top text-sm font-semibold text-slate-800">
                  <div>{term.word}</div>
                  <div className="text-xs text-slate-500">{term.partOfSpeech}</div>
                </td>
                <td className="px-4 py-3 align-top text-sm text-slate-600">
                  <div className="line-clamp-3 leading-relaxed">{term.definition}</div>
                </td>
                <td className="px-4 py-3 align-top text-sm text-slate-600">
                  {term.translationVi || <span className="text-xs text-slate-400">—</span>}
                </td>
                <td className="px-4 py-3 align-top">
                  <span className="rounded-full bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-600">
                    {term.difficulty}
                  </span>
                </td>
                <td className="px-4 py-3 align-top text-right">
                  <div className="flex justify-end gap-2">
                    <button
                      onClick={() => handleOpenEditTerm(term)}
                      className="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-50"
                    >
                      <Edit className="h-3.5 w-3.5" />
                      Sửa
                    </button>
                    <button
                      onClick={() => handleDeleteTerm(term)}
                      className="inline-flex items-center gap-1 rounded-lg border border-rose-200 px-3 py-1.5 text-xs font-semibold text-rose-600 hover:bg-rose-50"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                      Xóa
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    )
  }, [expandedUnit])

  if (listLoading || !listId || !list) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center text-sm text-slate-500">
        Đang tải dữ liệu...
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-purple-50 p-4 sm:p-6">
      <div className="mx-auto max-w-6xl space-y-6">
        <div className="flex items-center justify-between gap-4 rounded-3xl bg-white p-6 shadow-sm">
          <div className="flex items-start gap-4">
            <button
              onClick={() => navigate(-1)}
              className="inline-flex items-center justify-center rounded-full bg-slate-100 p-2 text-slate-600 hover:bg-slate-200"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
            <div>
              <div className="flex items-center gap-3 text-xs font-semibold uppercase tracking-wide text-indigo-500">
                <BookOpen className="h-4 w-4" />
                Vocabulary List
              </div>
              <h1 className="mt-1 text-2xl font-bold text-slate-900 sm:text-3xl">{list.title}</h1>
              <p className="mt-2 text-sm text-slate-500">{list.description || 'Không có mô tả'}</p>
              <div className="mt-3 flex flex-wrap gap-2">
                <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-600">
                  {list.totalUnits} units
                </span>
                <span className="rounded-full bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-600">
                  {list.totalTerms} terms
                </span>
                <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
                  Language: {list.language.toUpperCase()}
                </span>
              </div>
            </div>
          </div>
          <Link
            to="/vocabulary"
            className="hidden items-center gap-2 rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-50 sm:inline-flex"
          >
            ← Quay lại danh sách
          </Link>
        </div>

        <div className="rounded-3xl bg-white p-6 shadow-sm">
          <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-xl font-semibold text-slate-900">Unit</h2>
              <p className="text-sm text-slate-500">Quản lý các unit trong danh sách này.</p>
            </div>
            <button
              onClick={handleOpenCreateUnit}
              className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-500 px-4 py-2 text-sm font-semibold text-white shadow hover:from-indigo-600 hover:to-purple-600"
            >
              <Plus className="h-4 w-4" /> Thêm unit
            </button>
          </div>

          {unitsLoading ? (
            <div className="rounded-xl border border-dashed border-slate-200 p-6 text-sm text-slate-500">
              Đang tải unit...
            </div>
          ) : !units || units.length === 0 ? (
            <div className="rounded-xl border border-dashed border-slate-200 p-6 text-sm text-slate-500">
              Chưa có unit nào. Bấm "Thêm unit" để bắt đầu.
            </div>
          ) : (
            <div className="space-y-4">
              {units.map((unit) => {
                const isExpanded = expandedUnitId === unit.id
                return (
                  <div
                    key={unit.id}
                    className="rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
                  >
                    <button
                      onClick={() => handleExpandUnit(unit.id)}
                      className="flex w-full items-start justify-between gap-4 px-5 py-4 text-left"
                    >
                      <div className="flex items-start gap-4">
                        <div className="rounded-xl bg-indigo-50 p-3 text-indigo-600">
                          <Layers className="h-5 w-5" />
                        </div>
                        <div>
                          <div className="flex items-center gap-3">
                            <h3 className="text-lg font-semibold text-slate-900">{unit.title}</h3>
                            <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
                              {unit.termCount} terms
                            </span>
                          </div>
                          <p className="mt-1 text-sm text-slate-500">
                            {unit.description || 'Không có mô tả'}
                          </p>
                          <div className="mt-2 text-xs text-slate-400">
                            Cập nhật {new Date(unit.updatedAt).toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={(event) => {
                            event.stopPropagation()
                            handleOpenCreateTerm(unit.id)
                          }}
                          className="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-50"
                        >
                          <Plus className="h-3.5 w-3.5" /> Từ mới
                        </button>
                        <button
                          type="button"
                          onClick={(event) => {
                            event.stopPropagation()
                            handleOpenEditUnit(unit)
                          }}
                          className="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-50"
                        >
                          <Edit className="h-3.5 w-3.5" /> Sửa
                        </button>
                        <button
                          type="button"
                          onClick={(event) => {
                            event.stopPropagation()
                            handleDeleteUnit(unit)
                          }}
                          className="inline-flex items-center gap-1 rounded-lg border border-rose-200 px-3 py-1.5 text-xs font-semibold text-rose-600 hover:bg-rose-50"
                        >
                          <Trash2 className="h-3.5 w-3.5" /> Xóa
                        </button>
                        {isExpanded ? (
                          <ChevronDown className="h-5 w-5 text-slate-400" />
                        ) : (
                          <ChevronRight className="h-5 w-5 text-slate-400" />
                        )}
                      </div>
                    </button>

                    {isExpanded && (
                      <div className="border-t border-slate-100 px-5 py-4">
                        {unitDetailLoading ? (
                          <div className="rounded-xl border border-dashed border-slate-200 p-6 text-sm text-slate-500">
                            Đang tải từ vựng...
                          </div>
                        ) : (
                          renderTermRows
                        )}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>

      <Modal
        open={isUnitModalOpen}
        title={unitModalMode === 'create' ? 'Thêm unit mới' : 'Cập nhật unit'}
        onClose={() => setIsUnitModalOpen(false)}
      >
        <form className="space-y-4" onSubmit={handleSubmitUnit}>
          {unitModalMode === 'create' && (
            <div className="mb-4">
              <button
                type="button"
                onClick={handleGetAiSuggestions}
                disabled={isLoadingSuggestions}
                className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 px-4 py-2.5 text-sm font-semibold text-white shadow hover:from-purple-600 hover:to-pink-600 disabled:opacity-60"
              >
                <Sparkles className="h-4 w-4" />
                {isLoadingSuggestions ? 'Đang tạo gợi ý...' : 'Gợi ý từ AI ✨'}
              </button>
            </div>
          )}

          {showAiSuggestions && aiSuggestions.length > 0 && (
            <div className="space-y-3 rounded-xl border border-purple-200 bg-purple-50 p-4">
              <p className="text-sm font-semibold text-purple-900">
                Chọn một trong 3 gợi ý từ AI:
              </p>
              <div className="space-y-2">
                {aiSuggestions.map((suggestion, index) => (
                  <button
                    key={index}
                    type="button"
                    onClick={() => handleSelectSuggestion(index)}
                    className={`w-full rounded-lg border-2 p-3 text-left transition ${
                      selectedSuggestionIndex === index
                        ? 'border-purple-500 bg-purple-100'
                        : 'border-purple-200 bg-white hover:border-purple-300'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div
                        className={`mt-0.5 flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full ${
                          selectedSuggestionIndex === index
                            ? 'bg-purple-500 text-white'
                            : 'bg-purple-200 text-purple-600'
                        }`}
                      >
                        {index + 1}
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-semibold text-slate-900">
                          {suggestion.title}
                        </p>
                        <p className="mt-1 text-xs leading-relaxed text-slate-600">
                          {suggestion.description}
                        </p>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700">Tiêu đề *</label>
            <input
              value={unitForm.title}
              onChange={(event) => setUnitForm((prev) => ({ ...prev, title: event.target.value }))}
              className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-100"
              required
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700">Mô tả</label>
            <textarea
              value={unitForm.description || ''}
              onChange={(event) =>
                setUnitForm((prev) => ({ ...prev, description: event.target.value }))
              }
              className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-100"
              rows={3}
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700">Thứ tự hiển thị</label>
            <input
              type="number"
              value={unitForm.orderIndex ?? ''}
              onChange={(event) =>
                setUnitForm((prev) => ({
                  ...prev,
                  orderIndex: event.target.value ? Number(event.target.value) : undefined,
                }))
              }
              className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-100"
              min={0}
            />
          </div>
          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={() => setIsUnitModalOpen(false)}
              className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-50"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={unitCreateMutation.isPending || unitUpdateMutation.isPending}
              className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow hover:bg-indigo-700 disabled:opacity-60"
            >
              {unitModalMode === 'create'
                ? unitCreateMutation.isPending
                  ? 'Đang tạo...'
                  : 'Tạo unit'
                : unitUpdateMutation.isPending
                ? 'Đang lưu...'
                : 'Lưu thay đổi'}
            </button>
          </div>
        </form>
      </Modal>

      <TermModalWithAI
        open={isTermModalOpen}
        mode={termModalMode}
        termForm={termForm}
        setTermForm={setTermForm}
        onClose={() => setIsTermModalOpen(false)}
        onSubmit={handleSubmitTerm}
        isPending={termCreateMutation.isPending || termUpdateMutation.isPending}
        difficultyOptions={difficultyOptions}
        termTabMode={termTabMode}
        setTermTabMode={setTermTabMode}
        showTermSuggestions={showTermSuggestions}
        termSuggestions={termSuggestions}
        selectedTermSuggestionIndex={selectedTermSuggestionIndex}
        isLoadingTermSuggestions={isLoadingTermSuggestions}
        isAutoCompleting={isAutoCompleting}
        manualWord={manualWord}
        setManualWord={setManualWord}
        onGetTermSuggestions={handleGetTermSuggestions}
        onSelectTermSuggestion={handleSelectTermSuggestion}
        onManualAutoComplete={handleManualAutoComplete}
      />

      <ConfirmDialog
        open={isUnitDeleteOpen}
        description={`Bạn có chắc muốn xóa unit "${selectedUnit?.title ?? ''}"?`}
        onCancel={() => {
          setIsUnitDeleteOpen(false)
          setSelectedUnit(null)
        }}
        onConfirm={handleConfirmDeleteUnit}
      />

      <ConfirmDialog
        open={isTermDeleteOpen}
        description={`Bạn có chắc muốn xóa từ "${selectedTerm?.word ?? ''}"?`}
        onCancel={() => {
          setIsTermDeleteOpen(false)
          setSelectedTerm(null)
        }}
        onConfirm={handleConfirmDeleteTerm}
      />
    </div>
  )
}

export default VocabularyDetailPage
