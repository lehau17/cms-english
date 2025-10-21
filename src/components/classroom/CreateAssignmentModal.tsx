import { useMutation, useQueryClient } from '@tanstack/react-query'
import {
    Clock,
    Download,
    FileUp,
    Plus,
    Trash2,
    Trophy,
    Upload,
    X,
} from 'lucide-react'
import { useEffect, useState } from 'react'
import { useFieldArray, useForm } from 'react-hook-form'
import toast from 'react-hot-toast'
import {
    assignmentApi,
    type CreateAssignmentDto
} from '../../apis/assignment'
import { AssignmentFormValues } from '../../schemas/assignment.schema'
import { TypeSpecificFields } from '../assignment/TypeSpecificFields'

type Props = {
    open: boolean
    classroomId: string
    onClose: () => void
}

interface ImportPreviewResult {
    assignment: Partial<AssignmentFormValues>
    activities: any[]
    errors: string[]
    warnings: string[]
}

type ExtendedActivityType =
    | 'quiz'
    | 'vocab'
    | 'listening'
    | 'pronunciation'
    | 'speaking'
    | 'mini_game'
    | 'reading'
    | 'writing'
    | 'grammar'
    | 'flashcard'
    | 'conversation'
    | 'fill_blank'
    | 'dictation'
    | 'matching'

const ACTIVITY_TYPES: ExtendedActivityType[] = [
    'quiz',
    'vocab',
    'listening',
    'pronunciation',
    'speaking',
    'mini_game',
    'reading',
    'writing',
    'grammar',
    'flashcard',
    'conversation',
    'fill_blank',
    'dictation',
    'matching',
]

function Section({
    title,
    children,
}: {
    title: string
    children: React.ReactNode
}) {
    return (
        <div className="rounded-xl border border-gray-200 bg-white p-4">
            <h4 className="font-semibold mb-3">{title}</h4>
            <div className="space-y-3">{children}</div>
        </div>
    )
}

function Labeled({
    label,
    children,
}: {
    label: string
    children: React.ReactNode
}) {
    return (
        <label className="block">
            <span className="text-sm font-medium text-gray-700">{label}</span>
            <div className="mt-1">{children}</div>
        </label>
    )
}

function TextInput(props: React.InputHTMLAttributes<HTMLInputElement>) {
    return (
        <input
            {...props}
            className={
                'w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 ' +
                (props.className ?? '')
            }
        />
    )
}

function TextArea(props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
    return (
        <textarea
            {...props}
            className={
                'w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 resize-none ' +
                (props.className ?? '')
            }
        />
    )
}

export default function CreateAssignmentModal({
    open,
    classroomId,
    onClose,
    ...rest
}: Props & {
    mode?: 'create' | 'edit'
    assignmentId?: string
    initialValues?: AssignmentFormValues
    onSubmitted?: () => void
}) {
    const mode = rest.mode ?? 'create'
    const [showImportDialog, setShowImportDialog] = useState(false)
    const [importPreview, setImportPreview] =
        useState<ImportPreviewResult | null>(null)
    const [isUploading, setIsUploading] = useState(false)

    console.log('🚀 CreateAssignmentModal render:', {
        open,
        mode,
        hasInitialValues: !!rest.initialValues,
        initialActivitiesCount: rest.initialValues?.activities?.length,
    })

    const queryClient = useQueryClient()
    const { register, control, handleSubmit, watch, setValue, reset } =
        useForm<AssignmentFormValues>({
            defaultValues: rest.initialValues
                ? {
                    ...rest.initialValues,
                }
                : {
                    title: '',
                    description: '',
                    instructions: '',
                    isPublished: false,
                    totalPoints: 100,
                    maxAttempts: 1,
                    timeLimit: undefined,
                    activities: [],
                },
        })

    const {
        fields: actFields,
        append: addAct,
        remove: removeAct,
        replace: replaceActivities,
    } = useFieldArray({ control, name: 'activities' })

    // Reset form when initialValues change (for edit mode)
    useEffect(() => {
        if (rest.initialValues && mode === 'edit') {
            console.log('🔄 Resetting form with initialValues:', rest.initialValues)
            console.log('📋 Activities count:', rest.initialValues.activities?.length)
            rest.initialValues.activities?.forEach((activity, index) => {
                console.log(`📝 Activity ${index}:`, {
                    type: activity.type,
                    title: activity.title,
                    content: activity.content,
                })
            })

            // Reset the entire form
            reset(rest.initialValues)

            // Also manually replace field array to ensure it updates
            if (rest.initialValues.activities) {
                replaceActivities(rest.initialValues.activities)
            }

            // Also manually ensure field array is updated
            setTimeout(() => {
                console.log('📊 After reset - actFields length:', actFields.length)
            }, 100)
        }
    }, [rest.initialValues, mode, reset, actFields.length])

    // Debug log current field array state
    useEffect(() => {
        console.log('📊 Current actFields length:', actFields.length)
        actFields.forEach((field, index) => {
            console.log(`📋 Field ${index}:`, field)
        })
    }, [actFields])

    // Import handlers
    const handleDownloadTemplate = async () => {
        try {
            const response = await assignmentApi.downloadImportTemplate()

            const blob = new Blob([response], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' })
            const url = window.URL.createObjectURL(blob)
            const a = document.createElement('a')
            a.href = url
            a.download = 'assignment-import-template.xlsx'
            document.body.appendChild(a)
            a.click()
            window.URL.revokeObjectURL(url)
            document.body.removeChild(a)

            toast.success('Template downloaded successfully')
        } catch (error) {
            console.error('Download template error:', error)
            toast.error('Failed to download template')
        }
    }

    const handleFileUpload = async (file: File) => {
        if (!file.name.match(/\.(xlsx|xls)$/)) {
            toast.error('Please upload an Excel file (.xlsx or .xls)')
            return
        }

        setIsUploading(true)
        try {
            const result = await assignmentApi.previewImportData(file)
            // Handle the response structure - data is nested
            const previewData = result.data || result
            setImportPreview(previewData)

            if ((previewData.errors || []).length === 0) {
                toast.success('File processed successfully')
            } else {
                toast.error('File processed with errors')
            }
        } catch (error: any) {
            console.error('Import preview error:', error)
            toast.error(error?.response?.data?.message || 'Failed to process file')
        } finally {
            setIsUploading(false)
        }
    }

    const handleImportConfirm = () => {
        if (!importPreview) return

        // Merge imported data with current form values
        const currentValues = watch()

        // Update form values with imported assignment data
        if (importPreview.assignment?.title) {
            setValue('title', importPreview.assignment.title)
        }
        if (importPreview.assignment?.description) {
            setValue('description', importPreview.assignment.description)
        }
        if (importPreview.assignment?.instructions) {
            setValue('instructions', importPreview.assignment.instructions)
        }
        if (importPreview.assignment?.totalPoints) {
            setValue('totalPoints', importPreview.assignment.totalPoints)
        }
        if (importPreview.assignment?.timeLimit) {
            setValue('timeLimit', importPreview.assignment.timeLimit)
        }
        if (importPreview.assignment?.maxAttempts) {
            setValue('maxAttempts', importPreview.assignment.maxAttempts)
        }
        if (typeof importPreview.assignment?.isPublished === 'boolean') {
            setValue('isPublished', importPreview.assignment.isPublished)
        }

        // Add imported activities to existing ones
        const existingActivities = currentValues.activities || []
        const newActivities = [...existingActivities, ...(importPreview.activities || [])]
        replaceActivities(newActivities)

        setShowImportDialog(false)
        setImportPreview(null)
        toast.success(`Imported ${(importPreview.activities || []).length} activities`)
    }

    const mutation = useMutation({
        mutationFn: (payload: AssignmentFormValues) => {
            // Convert AssignmentFormValues to CreateAssignmentDto
            const createDto: CreateAssignmentDto = {
                title: payload.title,
                description: payload.description,
                instructions: payload.instructions,
                dueDate: payload.dueDate,
                totalPoints: payload.totalPoints,
                timeLimit: payload.timeLimit,
                maxAttempts: payload.maxAttempts,
                isPublished: payload.isPublished,
                assignedTo: [],
                activities: (payload.activities || []).map((activity: any) => ({
                    type: activity.type,
                    title: activity.title,
                    instructions: activity.instructions,
                    content: activity.content,
                    points: activity.points || 10,
                    difficulty: activity.difficulty,
                    hints: activity.hints,
                })),
            }
            return mode === 'edit' && rest.assignmentId
                ? (async () => {
                    // TODO: Implement update assignment API
                    return assignmentApi.createAssignment(classroomId, createDto)
                })()
                : assignmentApi.createAssignment(classroomId, createDto)
        },
        onSuccess: () => {
            toast.success('Tạo bài tập thành công')
            queryClient.invalidateQueries({
                queryKey: ['classroom-detail', classroomId],
            })
            onClose()
            rest.onSubmitted?.()
        },
        onError: (e: any) => {
            toast.error(e?.response?.data?.message || 'Tạo bài tập thất bại')
        },
    })

    if (!open) return null

    const addActivityOf = (type: ExtendedActivityType) => {
        const base = {
            type,
            title: type.charAt(0).toUpperCase() + type.slice(1).replace('_', ' '),
            points: 10,
            content: {},
        }
        // seed minimal content per type
        switch (type) {
            case 'quiz':
            case 'grammar':
                ; (base as any).content = {
                    question: '',
                    options: ['', ''],
                    correctIndex: 0,
                }
                break
            case 'reading':
                ; (base as any).content = {
                    passage: '',
                    questions: [
                        {
                            question: '',
                            options: ['', ''],
                            correctIndex: 0,
                        },
                    ],
                }
                break
            case 'listening':
                ; (base as any).content = {
                    audioUrl: '',
                    questions: [
                        {
                            question: '',
                            options: ['', ''],
                            correctIndex: 0,
                        },
                    ],
                }
                break
            case 'vocab':
                ; (base as any).content = { items: [{ word: '', definition: '' }] }
                break
            case 'pronunciation':
                ; (base as any).content = {
                    phrases: [{ text: '', sampleUrl: '' }],
                }
                break
            case 'speaking':
                ; (base as any).content = { prompt: '', minSeconds: 10, tips: [] }
                break
            case 'mini_game':
                ; (base as any).content = { target: '', pool: [], rounds: 3 }
                break
            case 'writing':
                ; (base as any).content = { prompt: '', minWords: 50, rubric: [] }
                break
            case 'flashcard':
                ; (base as any).content = { cards: [{ front: '', back: '' }] }
                break
            case 'conversation':
                ; (base as any).content = {
                    scenario: '',
                    initialDialog: [{ role: 'assistant', text: '' }],
                    suggestions: [],
                }
                break
            case 'fill_blank':
                ; (base as any).content = { passage: '', blanks: [''] }
                break
            case 'dictation':
                ; (base as any).content = {
                    audioUrl: '',
                    transcript: '',
                    minWords: 0,
                }
                break
            case 'matching':
                ; (base as any).content = { pairs: [{ left: '', right: '' }] }
                break
        }
        addAct(base as any)
    }

    const onSubmit = (values: AssignmentFormValues) => {
        // ensure dueDate ISO if provided (from datetime-local)
        const due = (values as any).dueDate as any
        const payload: AssignmentFormValues = {
            ...values,
            dueDate: due ? new Date(due).toISOString() : undefined,
            isPublished:
                typeof values.isPublished === 'string'
                    ? values.isPublished === 'true'
                    : !!values.isPublished,
        }
        mutation.mutate(payload)
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
            <div className="max-h-[90vh] w-full max-w-5xl overflow-y-auto rounded-2xl bg-white p-6 shadow-xl">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xl font-semibold">
                        {mode === 'edit' ? 'Chỉnh sửa bài tập' : 'Tạo bài tập'}
                    </h3>
                    <div className="flex items-center gap-2">
                        {mode === 'create' && (
                            <button
                                type="button"
                                onClick={() => setShowImportDialog(true)}
                                className="inline-flex items-center gap-2 rounded-lg border border-gray-300 px-3 py-2 text-sm hover:bg-gray-50"
                            >
                                <FileUp className="h-4 w-4" />
                                Import Excel
                            </button>
                        )}
                        <button
                            onClick={onClose}
                            className="rounded-lg p-2 hover:bg-gray-100"
                        >
                            <X className="h-5 w-5" />
                        </button>
                    </div>
                </div>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    <Section title="Thông tin bài tập">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <Labeled label="Tiêu đề">
                                <TextInput
                                    placeholder="Ví dụ: Unit 3 – Practice"
                                    {...register('title', { required: true })}
                                />
                            </Labeled>
                            <Labeled label="Mô tả">
                                <TextArea
                                    rows={2}
                                    placeholder="Mô tả ngắn cho học sinh"
                                    {...register('description')}
                                />
                            </Labeled>
                            <Labeled label="Hướng dẫn chung">
                                <TextArea
                                    rows={2}
                                    placeholder="Lưu ý khi làm bài"
                                    {...register('instructions')}
                                />
                            </Labeled>
                            <Labeled label="Hạn nộp">
                                <TextInput type="datetime-local" {...register('dueDate')} />
                            </Labeled>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                            <Labeled label="Tổng điểm">
                                <TextInput
                                    type="number"
                                    min={0}
                                    {...register('totalPoints', { valueAsNumber: true })}
                                />
                            </Labeled>
                            <Labeled label="Giới hạn thời gian (phút)">
                                <TextInput
                                    type="number"
                                    min={0}
                                    {...register('timeLimit', { valueAsNumber: true })}
                                />
                            </Labeled>
                            <Labeled label="Số lần làm tối đa">
                                <TextInput
                                    type="number"
                                    min={1}
                                    defaultValue={1}
                                    {...register('maxAttempts', { valueAsNumber: true })}
                                />
                            </Labeled>
                            <Labeled label="Trạng thái">
                                <select
                                    {...register('isPublished')}
                                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
                                >
                                    <option value="false">Nháp</option>
                                    <option value="true">Xuất bản</option>
                                </select>
                            </Labeled>
                        </div>
                    </Section>

                    <Section title="Hoạt động trong bài tập">
                        <div className="flex flex-wrap gap-2">
                            {ACTIVITY_TYPES.map((t) => (
                                <button
                                    key={t}
                                    type="button"
                                    onClick={() => addActivityOf(t)}
                                    className="inline-flex items-center gap-2 rounded-lg border border-gray-300 px-3 py-1.5 text-sm hover:bg-gray-50"
                                >
                                    <Plus className="h-4 w-4" /> {t.replace('_', ' ')}
                                </button>
                            ))}
                        </div>

                        {actFields.length === 0 && (
                            <p className="text-sm text-gray-500">
                                Chưa có hoạt động. Hãy chọn loại để thêm.
                            </p>
                        )}

                        <div className="space-y-4">
                            {actFields.map((f, idx) => {
                                const type = watch(
                                    `activities.${idx}.type`
                                ) as ExtendedActivityType
                                return (
                                    <div key={f.id} className="rounded-xl border border-gray-200">
                                        <div className="flex items-center justify-between p-3 border-b border-gray-100 bg-gray-50 rounded-t-xl">
                                            <div className="flex items-center gap-2 text-sm">
                                                <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 px-2 py-0.5 text-blue-700">
                                                    #{idx + 1}
                                                </span>
                                                <span className="font-medium capitalize">
                                                    {type?.replace('_', ' ') || 'activity'}
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <button
                                                    type="button"
                                                    onClick={() => removeAct(idx)}
                                                    className="rounded-lg p-2 hover:bg-red-50 text-red-600"
                                                    title="Xóa hoạt động"
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </button>
                                            </div>
                                        </div>

                                        <div className="p-4 space-y-3">
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <Labeled label="Tiêu đề hoạt động">
                                                    <TextInput
                                                        {...register(`activities.${idx}.title` as const)}
                                                        placeholder="Ví dụ: Quiz 1"
                                                    />
                                                </Labeled>
                                                <Labeled label="Điểm">
                                                    <TextInput
                                                        type="number"
                                                        min={0}
                                                        {...register(`activities.${idx}.points` as const, {
                                                            valueAsNumber: true,
                                                        })}
                                                    />
                                                </Labeled>
                                                <Labeled label="Qua bài khi ≥ điểm">
                                                    <TextInput
                                                        type="number"
                                                        min={0}
                                                        {...register(
                                                            `activities.${idx}.passingScore` as const,
                                                            { valueAsNumber: true }
                                                        )}
                                                    />
                                                </Labeled>
                                                <Labeled label="Hướng dẫn">
                                                    <TextArea
                                                        rows={2}
                                                        placeholder="Gợi ý cho học sinh"
                                                        {...register(
                                                            `activities.${idx}.instructions` as const
                                                        )}
                                                    />
                                                </Labeled>
                                            </div>

                                            {/* Type specific form */}
                                            <TypeSpecificFields
                                                idx={idx}
                                                type={type}
                                                register={register}
                                                setValue={setValue}
                                                watch={watch}
                                            />
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    </Section>

                    <div className="flex items-center justify-end gap-2">
                        <button
                            type="button"
                            onClick={onClose}
                            className="rounded-lg border border-gray-300 px-4 py-2 text-sm hover:bg-gray-50"
                        >
                            Hủy
                        </button>
                        <button
                            type="submit"
                            disabled={mutation.isPending}
                            className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm text-white hover:bg-blue-700 disabled:opacity-50"
                        >
                            {mutation.isPending ? (
                                <span className="inline-flex items-center gap-2">
                                    <Clock className="h-4 w-4 animate-spin" /> Đang tạo...
                                </span>
                            ) : (
                                <span className="inline-flex items-center gap-2">
                                    <Trophy className="h-4 w-4" /> Tạo bài tập
                                </span>
                            )}
                        </button>
                    </div>
                </form>
            </div>

            {/* Import Dialog */}
            {showImportDialog && (
                <div className="fixed inset-0 z-60 flex items-center justify-center bg-black/50 p-4">
                    <div className="max-h-[80vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white p-6 shadow-xl">
                        <div className="flex items-center justify-between mb-4">
                            <h4 className="text-lg font-semibold">
                                Import Assignment from Excel
                            </h4>
                            <button
                                onClick={() => {
                                    setShowImportDialog(false)
                                    setImportPreview(null)
                                }}
                                className="rounded-lg p-2 hover:bg-gray-100"
                            >
                                <X className="h-5 w-5" />
                            </button>
                        </div>

                        <div className="space-y-4">
                            {/* Step 1: Download Template */}
                            <div className="rounded-xl border border-gray-200 p-4">
                                <h5 className="font-medium mb-2">Step 1: Download Template</h5>
                                <p className="text-sm text-gray-600 mb-3">
                                    Download the Excel template, fill in your assignment data, and
                                    upload it below.
                                </p>
                                <button
                                    onClick={handleDownloadTemplate}
                                    className="inline-flex items-center gap-2 rounded-lg border border-gray-300 px-3 py-2 text-sm hover:bg-gray-50"
                                >
                                    <Download className="h-4 w-4" />
                                    Download Template
                                </button>
                            </div>

                            {/* Step 2: Upload File */}
                            <div className="rounded-xl border border-gray-200 p-4">
                                <h5 className="font-medium mb-2">
                                    Step 2: Upload Completed File
                                </h5>
                                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition">
                                    <input
                                        accept=".xlsx,.xls"
                                        style={{ display: 'none' }}
                                        id="excel-file-upload"
                                        type="file"
                                        onChange={(e) => {
                                            const file = e.target.files?.[0]
                                            if (file) {
                                                handleFileUpload(file)
                                            }
                                        }}
                                    />
                                    <label htmlFor="excel-file-upload" className="cursor-pointer">
                                        <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                                        <p className="text-sm font-medium text-gray-900 mb-1">
                                            Click to upload Excel file
                                        </p>
                                        <p className="text-xs text-gray-500">
                                            Supports .xlsx and .xls files
                                        </p>
                                    </label>
                                </div>

                                {isUploading && (
                                    <div className="mt-3">
                                        <div className="flex items-center gap-2 text-sm text-blue-600">
                                            <Clock className="h-4 w-4 animate-spin" />
                                            Processing file...
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Import Preview */}
                            {importPreview && (
                                <div className="rounded-xl border border-gray-200 p-4">
                                    <h5 className="font-medium mb-2">Import Preview</h5>

                                    {(importPreview.errors || []).length > 0 && (
                                        <div className="rounded-lg bg-red-50 border border-red-200 p-3 mb-3">
                                            <p className="text-sm font-medium text-red-800 mb-1">
                                                Errors:
                                            </p>
                                            <ul className="text-sm text-red-700 space-y-1">
                                                {(importPreview.errors || []).map((error, index) => (
                                                    <li key={index}>• {error}</li>
                                                ))}
                                            </ul>
                                        </div>
                                    )}

                                    {(importPreview.warnings || []).length > 0 && (
                                        <div className="rounded-lg bg-yellow-50 border border-yellow-200 p-3 mb-3">
                                            <p className="text-sm font-medium text-yellow-800 mb-1">
                                                Warnings:
                                            </p>
                                            <ul className="text-sm text-yellow-700 space-y-1">
                                                {(importPreview.warnings || []).map((warning, index) => (
                                                    <li key={index}>• {warning}</li>
                                                ))}
                                            </ul>
                                        </div>
                                    )}

                                    {(importPreview.errors || []).length === 0 && (
                                        <div className="rounded-lg bg-green-50 border border-green-200 p-3 mb-3">
                                            <p className="text-sm font-medium text-green-800 mb-1">
                                                Ready to Import:
                                            </p>
                                            <ul className="text-sm text-green-700 space-y-1">
                                                <li>• Assignment: {importPreview.assignment?.title || 'Untitled'}</li>
                                                <li>
                                                    • Activities: {(importPreview.activities || []).length} found
                                                </li>
                                            </ul>
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Dialog Actions */}
                            <div className="flex items-center justify-end gap-2 pt-4 border-t border-gray-200">
                                <button
                                    onClick={() => {
                                        setShowImportDialog(false)
                                        setImportPreview(null)
                                    }}
                                    className="rounded-lg border border-gray-300 px-4 py-2 text-sm hover:bg-gray-50"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleImportConfirm}
                                    disabled={!importPreview || (importPreview.errors || []).length > 0}
                                    className="rounded-lg bg-blue-600 px-4 py-2 text-sm text-white hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    Import Data
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
