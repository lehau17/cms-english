import {
  createVocabularyList,
  deleteVocabularyList,
  getVocabularyLists,
  updateVocabularyList,
} from '@/apis/vocabulary';
import { DataTable, PageHeader, PaginationBar, SearchFilterBar, type ActionButton, type TableColumn } from '@/components/ui';
import { useBaseRequestQuery } from '@/hooks/useBaseRequestQuery';
import { ESoftOrder } from '@/interface/base-request.interface';
import { DifficultyLevel, LanguageCode } from '@/interface/enums';
import {
  CreateVocabularyListInput,
  UpdateVocabularyListInput,
  VocabularyList,
} from '@/interface/vocabulary.interface';
import {
    Add as PlusIcon,
    Book as BookIcon,
    Delete as TrashIcon,
    Edit as EditIcon,
    PlaylistAddCheck as ListChecksIcon,
    Sort as SortAscendingIcon
} from '@mui/icons-material';
import { Box, Button, Chip, Container, IconButton, Stack, Tooltip, Typography } from '@mui/material';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

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
};

type ListFormState = CreateVocabularyListInput;

const difficultyOptions = Object.values(DifficultyLevel).map((value) => ({
  value,
  label: value
    .split('_')
    .map((chunk) => chunk.charAt(0).toUpperCase() + chunk.slice(1))
    .join(' '),
}));

const languageOptions = Object.values(LanguageCode).map((value) => ({
  value,
  label: value.toUpperCase(),
}));

const Modal: React.FC<{
  open: boolean;
  title: string;
  onClose: () => void;
  children: React.ReactNode;
}> = ({ open, title, onClose, children }) => {
  if (!open) return null;
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
  );
};

const ConfirmDialog: React.FC<{
  open: boolean;
  description: string;
  onConfirm: () => void;
  onCancel: () => void;
}> = ({ open, description, onConfirm, onCancel }) => {
  if (!open) return null;
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
  );
};

const VocabularyListPage: React.FC = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

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
  });

  const lists = data?.data.data ?? [];
  const pagination = data?.data;

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [selectedList, setSelectedList] = useState<VocabularyList | null>(null);
  const [formState, setFormState] = useState<ListFormState>(defaultListForm);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);

  const resetForm = () => {
    setFormState({ ...defaultListForm });
  };

  const createMutation = useMutation({
    mutationFn: (payload: CreateVocabularyListInput) => createVocabularyList(payload),
    onSuccess: () => {
      toast.success('Tạo danh sách từ vựng thành công');
      queryClient.invalidateQueries({ queryKey: ['admin-vocabulary-lists'] });
      setIsCreateOpen(false);
      resetForm();
    },
    onError: () => toast.error('Không thể tạo danh sách'),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateVocabularyListInput }) =>
      updateVocabularyList(id, payload),
    onSuccess: () => {
      toast.success('Cập nhật danh sách thành công');
      queryClient.invalidateQueries({ queryKey: ['admin-vocabulary-lists'] });
      setIsEditOpen(false);
      setSelectedList(null);
    },
    onError: () => toast.error('Không thể cập nhật danh sách'),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteVocabularyList(id),
    onSuccess: () => {
      toast.success('Đã xóa danh sách');
      queryClient.invalidateQueries({ queryKey: ['admin-vocabulary-lists'] });
      setIsDeleteOpen(false);
      setSelectedList(null);
    },
    onError: () => toast.error('Không thể xóa danh sách'),
  });

  const handleOpenCreate = () => {
    resetForm();
    setIsCreateOpen(true);
  };

  const handleOpenEdit = (list: VocabularyList) => {
    setSelectedList(list);
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
    });
    setIsEditOpen(true);
  };

  const handleSubmitCreate = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    createMutation.mutate(formState);
  };

  const handleSubmitEdit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!selectedList) return;
    const payload: UpdateVocabularyListInput = {
      ...formState,
    };
    updateMutation.mutate({ id: selectedList.id, payload });
  };

  const handleDelete = (list: VocabularyList) => {
    setSelectedList(list);
    setIsDeleteOpen(true);
  };

  const handleConfirmDelete = () => {
    if (!selectedList) return;
    deleteMutation.mutate(selectedList.id);
  };

  const handleSortToggle = () => {
    const nextOrder = request.sortOrder === ESoftOrder.DESC ? ESoftOrder.ASC : ESoftOrder.DESC;
    setSort('createdAt', nextOrder);
    refetch();
  };

  const handlePageChange = (newPage: number) => {
    if (newPage > 0 && newPage <= (pagination?.totalPages || 1)) {
      setPage(newPage);
    }
  };

  const getDifficultyChip = (difficulty: DifficultyLevel) => {
    switch (difficulty) {
      case DifficultyLevel.BEGINNER:
        return <Chip label="Beginner" color="success" size="small" />;
      case DifficultyLevel.INTERMEDIATE:
        return <Chip label="Intermediate" color="info" size="small" />;
      case DifficultyLevel.ADVANCED:
        return <Chip label="Advanced" color="secondary" size="small" />;
      default:
        return <Chip label={difficulty} size="small" />;
    }
  };

  const columns: TableColumn<VocabularyList>[] = [
    {
      id: 'title',
      label: 'Danh sách',
      render: (list) => (
        <Stack spacing={0.5}>
          <Typography variant="body2" fontWeight={600}>
            {list.title}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {list.description || 'Không có mô tả'}
          </Typography>
        </Stack>
      ),
    },
    {
      id: 'info',
      label: 'Thông tin',
      render: (list) => (
        <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
          {getDifficultyChip(list.difficulty)}
          <Chip label={list.language.toUpperCase()} size="small" variant="outlined" />
          <Chip label={`${list.totalUnits} units`} size="small" color="primary" variant="outlined" />
          <Chip label={`${list.totalTerms} terms`} size="small" color="warning" variant="outlined" />
        </Stack>
      ),
    },
    {
      id: 'time',
      label: 'Thời gian',
      render: (list) => (
        <Stack spacing={0.5}>
          <Typography variant="body2">
            {new Date(list.createdAt).toLocaleDateString()}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            Cập nhật {new Date(list.updatedAt).toLocaleDateString()}
          </Typography>
        </Stack>
      ),
    },
  ];

  const actions: ActionButton<VocabularyList>[] = [
    {
      icon: <ListChecksIcon fontSize="small" />,
      label: 'Quản lý',
      color: 'primary',
      onClick: (list) => navigate(`/vocabulary/${list.id}`),
    },
    {
      icon: <EditIcon fontSize="small" />,
      label: 'Sửa',
      color: 'warning',
      onClick: handleOpenEdit,
    },
    {
      icon: <TrashIcon fontSize="small" />,
      label: 'Xóa',
      color: 'error',
      onClick: handleDelete,
    },
  ];

  return (
    <Container maxWidth="xl">
      <Stack spacing={3} sx={{ py: 3 }}>
        <PageHeader
          title="Vocabulary Management"
          description="Quản lý danh sách từ vựng, unit và các từ cho học viên."
          createButtonLabel="Tạo danh sách mới"
          onCreateClick={handleOpenCreate}
        />

        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
          <SearchFilterBar
            searchValue={request.search || ''}
            onSearchChange={setSearch}
            searchPlaceholder="Tìm kiếm theo tiêu đề, mô tả..."
            limitValue={request.limit || 10}
            onLimitChange={setLimit}
            isLoading={isLoading}
            limitOptions={[10, 20, 50]}
          />
          <Tooltip title="Sắp xếp">
            <IconButton onClick={handleSortToggle}>
              <SortAscendingIcon />
            </IconButton>
          </Tooltip>
        </Box>

        <DataTable
          columns={columns}
          data={lists}
          isLoading={isLoading}
          actions={actions}
          getRowId={(list) => list.id}
          emptyState={{
            icon: <BookIcon sx={{ fontSize: 64, color: 'text.disabled', mb: 2 }} />,
            title: 'Chưa có danh sách nào',
            description: 'Tạo danh sách từ vựng mới để bắt đầu.',
            actionButton: (
              <Button
                variant="contained"
                startIcon={<PlusIcon />}
                onClick={handleOpenCreate}
              >
                Tạo danh sách đầu tiên
              </Button>
            ),
          }}
        />

        {pagination && (
          <PaginationBar
            page={pagination.page}
            totalPages={pagination.totalPages ?? 1}
            totalItems={pagination.totalItems ?? 0}
            limit={pagination.limit}
            onPageChange={handlePageChange}
          />
        )}
      </Stack>

      {/* Modals - giữ nguyên */}
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
              {updateMutation.isPending ? 'Đang cập nhật...' : 'Cập nhật'}
            </button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        open={isDeleteOpen}
        description={`Bạn có chắc chắn muốn xóa danh sách "${selectedList?.title}"? Hành động này không thể hoàn tác.`}
        onConfirm={handleConfirmDelete}
        onCancel={() => setIsDeleteOpen(false)}
      />
    </Container>
  );
};

export default VocabularyListPage;
