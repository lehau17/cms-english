import { DifficultyLevel } from '@/interface/enums'
import { Sparkles, Upload } from 'lucide-react'
import React, { useState } from 'react'
import toast from 'react-hot-toast'

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

interface TermModalWithAIProps {
  open: boolean
  mode: 'create' | 'edit'
  termForm: TermFormState
  setTermForm: React.Dispatch<React.SetStateAction<TermFormState>>
  onClose: () => void
  onSubmit: (event: React.FormEvent<HTMLFormElement>) => void
  isPending: boolean
  difficultyOptions: Array<{ value: string; label: string }>

  // AI props
  termTabMode: 'ai-generate' | 'manual-input'
  setTermTabMode: (mode: 'ai-generate' | 'manual-input') => void
  showTermSuggestions: boolean
  termSuggestions: Array<{ word: string; hint: string }>
  selectedTermSuggestionIndex: number | null
  isLoadingTermSuggestions: boolean
  isAutoCompleting: boolean
  manualWord: string
  setManualWord: (word: string) => void
  onGetTermSuggestions: () => void
  onSelectTermSuggestion: (index: number) => void
  onManualAutoComplete: () => void
  onBulkGenerate: (count: number) => void
  onImageUpload: (file: File) => Promise<void>
}

const TermModalWithAI: React.FC<TermModalWithAIProps> = ({
  open,
  mode,
  termForm,
  setTermForm,
  onClose,
  onSubmit,
  isPending,
  difficultyOptions,
  termTabMode,
  setTermTabMode,
  showTermSuggestions,
  termSuggestions,
  selectedTermSuggestionIndex,
  isLoadingTermSuggestions,
  isAutoCompleting,
  manualWord,
  setManualWord,
  onGetTermSuggestions,
  onSelectTermSuggestion,
  onManualAutoComplete,
  onBulkGenerate,
  onImageUpload,
}) => {
  const [bulkCount, setBulkCount] = useState(3)
  const [isUploadingImage, setIsUploadingImage] = useState(false)
  const imageInputRef = React.useRef<HTMLInputElement>(null)

  if (!open) return null

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Vui lòng chọn file ảnh')
      return
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Kích thước ảnh không được vượt quá 5MB')
      return
    }

    setIsUploadingImage(true)
    try {
      await onImageUpload(file)
      toast.success('Upload ảnh thành công!')
    } catch (error) {
      console.error('Image upload error:', error)
      toast.error('Upload ảnh thất bại')
    } finally {
      setIsUploadingImage(false)
      if (imageInputRef.current) {
        imageInputRef.current.value = ''
      }
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 px-4 py-6">
      <div className="w-full max-w-4xl overflow-hidden rounded-2xl bg-white shadow-xl">
        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
          <h3 className="text-lg font-semibold text-slate-900">
            {mode === 'create' ? 'Thêm từ vựng' : 'Cập nhật từ vựng'}
          </h3>
          <button
            onClick={onClose}
            className="rounded-full bg-slate-100 px-3 py-1 text-sm font-medium text-slate-600 hover:bg-slate-200"
          >
            Đóng
          </button>
        </div>

        <div className="max-h-[80vh] overflow-y-auto">
          {mode === 'create' && (
            <div className="border-b border-slate-200 px-6 pt-4">
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setTermTabMode('ai-generate')}
                  className={`flex-1 rounded-t-lg px-4 py-2 text-sm font-semibold transition ${termTabMode === 'ai-generate'
                      ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                >
                  <Sparkles className="mr-2 inline h-4 w-4" />
                  AI Tạo Từ Mới
                </button>
                <button
                  type="button"
                  onClick={() => setTermTabMode('manual-input')}
                  className={`flex-1 rounded-t-lg px-4 py-2 text-sm font-semibold transition ${termTabMode === 'manual-input'
                      ? 'bg-gradient-to-r from-indigo-500 to-blue-500 text-white'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                >
                  Tự Nhập Từ
                </button>
              </div>
            </div>
          )}

          <form className="space-y-4 px-6 py-5" onSubmit={onSubmit}>
            {mode === 'create' && termTabMode === 'ai-generate' && (
              <div className="space-y-4">
                {/* Bulk Generation UI */}
                <div className="rounded-xl border-2 border-green-200 bg-green-50 p-4">
                  <p className="mb-3 text-sm font-semibold text-green-900">
                    🚀 Tạo nhiều từ vựng cùng lúc (AI tự động gen tất cả):
                  </p>
                  <div className="flex items-center gap-3">
                    <label className="text-sm font-medium text-green-800">Số lượng:</label>
                    <input
                      type="number"
                      min="1"
                      max="10"
                      value={bulkCount}
                      onChange={(e) => setBulkCount(Math.min(10, Math.max(1, Number(e.target.value))))}
                      className="w-20 rounded-lg border border-green-300 px-3 py-1.5 text-center text-sm font-semibold focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-100"
                    />
                    <button
                      type="button"
                      onClick={() => onBulkGenerate(bulkCount)}
                      disabled={isLoadingTermSuggestions}
                      className="flex-1 inline-flex items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-green-500 to-emerald-500 px-4 py-2 text-sm font-semibold text-white shadow hover:from-green-600 hover:to-emerald-600 disabled:opacity-60"
                    >
                      <Sparkles className="h-4 w-4" />
                      {isLoadingTermSuggestions ? 'Đang tạo...' : `AI Tạo ${bulkCount} Từ Cùng Lúc`}
                    </button>
                  </div>
                  <p className="mt-2 text-xs text-green-700">
                    💡 AI sẽ tạo {bulkCount} từ vựng hoàn chỉnh (định nghĩa, dịch, phát âm, audio...). Có thể mất 30s-2 phút tuỳ số lượng.
                  </p>
                </div>

                {/* OR Divider */}
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-slate-300"></div>
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="bg-white px-4 text-slate-500 font-medium">hoặc tạo từng từ một</span>
                  </div>
                </div>

                {/* Single Term Suggestions */}
                <button
                  type="button"
                  onClick={onGetTermSuggestions}
                  disabled={isLoadingTermSuggestions}
                  className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 px-4 py-2.5 text-sm font-semibold text-white shadow hover:from-purple-600 hover:to-pink-600 disabled:opacity-60"
                >
                  <Sparkles className="h-4 w-4" />
                  {isLoadingTermSuggestions ? 'Đang tạo gợi ý...' : 'AI Gợi Ý Từ Vựng Mới'}
                </button>

                {showTermSuggestions && termSuggestions.length > 0 && (
                  <div className="space-y-3 rounded-xl border border-purple-200 bg-purple-50 p-4">
                    <p className="text-sm font-semibold text-purple-900">
                      Chọn từ để AI tự động điền đầy đủ thông tin:
                    </p>
                    <div className="space-y-2">
                      {termSuggestions.map((suggestion, index) => (
                        <button
                          key={index}
                          type="button"
                          onClick={() => onSelectTermSuggestion(index)}
                          disabled={isAutoCompleting}
                          className={`w-full rounded-lg border-2 p-3 text-left transition disabled:opacity-50 ${selectedTermSuggestionIndex === index
                              ? 'border-purple-500 bg-purple-100'
                              : 'border-purple-200 bg-white hover:border-purple-300'
                            }`}
                        >
                          <div className="flex items-start gap-3">
                            <div
                              className={`mt-0.5 flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full text-xs font-bold ${selectedTermSuggestionIndex === index
                                  ? 'bg-purple-500 text-white'
                                  : 'bg-purple-200 text-purple-600'
                                }`}
                            >
                              {index + 1}
                            </div>
                            <div className="flex-1">
                              <p className="text-sm font-bold text-slate-900">
                                {suggestion.word}
                              </p>
                              <p className="mt-0.5 text-xs text-slate-600">{suggestion.hint}</p>
                            </div>
                          </div>
                        </button>
                      ))}
                    </div>
                    {isAutoCompleting && (
                      <p className="text-center text-sm text-purple-600">
                        Đang lấy dữ liệu từ AI...
                      </p>
                    )}
                  </div>
                )}
              </div>
            )}

            {mode === 'create' && termTabMode === 'manual-input' && (
              <div className="space-y-4 rounded-xl border border-indigo-200 bg-indigo-50 p-4">
                <p className="text-sm font-semibold text-indigo-900">
                  Nhập từ vựng, AI sẽ tự động điền các thông tin còn lại:
                </p>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={manualWord}
                    onChange={(e) => setManualWord(e.target.value)}
                    placeholder="Ví dụ: vocabulary"
                    className="flex-1 rounded-lg border border-indigo-200 px-4 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-100"
                  />
                  <button
                    type="button"
                    onClick={onManualAutoComplete}
                    disabled={isAutoCompleting || !manualWord.trim()}
                    className="inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-indigo-500 to-blue-500 px-4 py-2 text-sm font-semibold text-white hover:from-indigo-600 hover:to-blue-600 disabled:opacity-60"
                  >
                    <Sparkles className="h-4 w-4" />
                    {isAutoCompleting ? 'Đang xử lý...' : 'AI Điền'}
                  </button>
                </div>
              </div>
            )}

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">Từ vựng *</label>
                <input
                  value={termForm.word}
                  onChange={(e) => setTermForm((prev) => ({ ...prev, word: e.target.value }))}
                  className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-100"
                  required
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">Từ loại</label>
                <input
                  value={termForm.partOfSpeech || ''}
                  onChange={(e) =>
                    setTermForm((prev) => ({ ...prev, partOfSpeech: e.target.value }))
                  }
                  className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-100"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Định nghĩa *</label>
              <textarea
                value={termForm.definition}
                onChange={(e) => setTermForm((prev) => ({ ...prev, definition: e.target.value }))}
                className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-100"
                rows={3}
                required
              />
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">Dịch nghĩa</label>
                <input
                  value={termForm.translationVi || ''}
                  onChange={(e) =>
                    setTermForm((prev) => ({ ...prev, translationVi: e.target.value }))
                  }
                  className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-100"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">Phiên âm</label>
                <input
                  value={termForm.pronunciation || ''}
                  onChange={(e) =>
                    setTermForm((prev) => ({ ...prev, pronunciation: e.target.value }))
                  }
                  className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-100"
                />
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">
                  Audio URL <span className="text-xs text-slate-500">(AI tự gen & upload)</span>
                </label>
                <input
                  value={termForm.audioUrl || ''}
                  onChange={(e) => setTermForm((prev) => ({ ...prev, audioUrl: e.target.value }))}
                  placeholder="https://..."
                  className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-100"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">
                  Image URL <span className="text-xs text-slate-500">(hoặc upload từ máy)</span>
                </label>
                <div className="flex gap-2">
                  <input
                    value={termForm.imageUrl || ''}
                    onChange={(e) => setTermForm((prev) => ({ ...prev, imageUrl: e.target.value }))}
                    placeholder="https://..."
                    className="flex-1 rounded-xl border border-slate-200 px-4 py-2.5 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-100"
                  />
                  <input
                    ref={imageInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                  <button
                    type="button"
                    onClick={() => imageInputRef.current?.click()}
                    disabled={isUploadingImage}
                    className="inline-flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-60"
                  >
                    <Upload className="h-4 w-4" />
                    {isUploadingImage ? 'Đang tải...' : 'Upload'}
                  </button>
                </div>
                {termForm.imageUrl && (
                  <img
                    src={termForm.imageUrl}
                    alt="Preview"
                    className="mt-2 h-20 w-20 rounded-lg border border-slate-200 object-cover"
                  />
                )}
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">
                Ví dụ (mỗi dòng: câu | dịch)
              </label>
              <textarea
                value={termForm.examples || ''}
                onChange={(e) => setTermForm((prev) => ({ ...prev, examples: e.target.value }))}
                placeholder="Example sentence | Câu ví dụ"
                className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-100"
                rows={3}
              />
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">
                  Từ đồng nghĩa (phân tách bằng dấu phẩy)
                </label>
                <input
                  value={termForm.synonyms || ''}
                  onChange={(e) => setTermForm((prev) => ({ ...prev, synonyms: e.target.value }))}
                  placeholder="word1, word2, word3"
                  className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-100"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">
                  Từ trái nghĩa (phân tách bằng dấu phẩy)
                </label>
                <input
                  value={termForm.antonyms || ''}
                  onChange={(e) => setTermForm((prev) => ({ ...prev, antonyms: e.target.value }))}
                  placeholder="opposite1, opposite2"
                  className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-100"
                />
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">Độ khó</label>
                <select
                  value={termForm.difficulty}
                  onChange={(e) =>
                    setTermForm((prev) => ({ ...prev, difficulty: e.target.value as DifficultyLevel }))
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
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">Thứ tự hiển thị</label>
                <input
                  type="number"
                  value={termForm.orderIndex ?? ''}
                  onChange={(e) =>
                    setTermForm((prev) => ({
                      ...prev,
                      orderIndex: e.target.value ? Number(e.target.value) : undefined,
                    }))
                  }
                  className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-100"
                  min={0}
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 border-t border-slate-200 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-50"
              >
                Hủy
              </button>
              <button
                type="submit"
                disabled={isPending}
                className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow hover:bg-indigo-700 disabled:opacity-60"
              >
                {mode === 'create'
                  ? isPending
                    ? 'Đang thêm...'
                    : 'Thêm từ'
                  : isPending
                    ? 'Đang lưu...'
                    : 'Lưu thay đổi'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

export default TermModalWithAI
