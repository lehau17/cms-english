import { StringArrayField } from '@/components/shared/activity-editors';
import { AssignmentFormValues } from '@/schemas/assignment.schema';
import {
  type Control,
  type UseFormRegister,
  type UseFormSetValue,
  type UseFormWatch
} from 'react-hook-form';

interface FillBlankFieldsProps {
  activityIndex: number;
  control: Control<AssignmentFormValues>;
  register: UseFormRegister<AssignmentFormValues>;
  setValue: UseFormSetValue<AssignmentFormValues>;
  watch: UseFormWatch<AssignmentFormValues>;
}

export const FillBlankFields: React.FC<FillBlankFieldsProps> = ({
  activityIndex,
  control,
  register,
  setValue,
  watch,
}) => {
  const basePath = `activities.${activityIndex}.content`;

  return (
    <div className="space-y-4">
      <textarea
        {...register(`${basePath}.passage` as any)}
        className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-colors"
        rows={3}
        placeholder="Passage with blanks. Use [____] to mark blanks (e.g., The [____] is [____])."
      />
      <div className="flex items-center justify-between text-xs text-gray-600 mb-1">
        <span>
          {(() => {
            const p = watch(`${basePath}.passage` as any) as string;
            const count = (p?.match(/\[_{2,}\]/g) || []).length;
            const blanks = (watch(`${basePath}.blanks` as any) as string[]) || [];
            return `Detected ${count} blanks • Answers: ${blanks.length}`;
          })()}
        </span>
        <button
          type="button"
          className="px-2 py-1 border rounded"
          onClick={() => {
            const passage = (watch(`${basePath}.passage` as any) as string) || "";
            const count = (passage.match(/\[_{2,}\]/g) || []).length;
            const current: string[] = (watch(`${basePath}.blanks` as any) as string[]) || [];
            const next = Array.from({ length: count }, (_, i) => current[i] || "");
            setValue(`${basePath}.blanks` as any, next as any, { shouldDirty: true });
          }}
        >
          Sync answers
        </button>
      </div>
      <StringArrayField
        name={`${basePath}.blanks`}
        control={control}
        label="Blanks / Answers (in order)"
        placeholder="answer"
        register={register}
      />
    </div>
  );
};





















