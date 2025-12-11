import { AssignmentFormValues } from '@/schemas/assignment.schema';
import {
  type Control,
  type UseFormRegister,
  type UseFormSetValue,
  type UseFormWatch
} from 'react-hook-form';

interface MatchingFieldsProps {
  activityIndex: number;
  control: Control<AssignmentFormValues>;
  register: UseFormRegister<AssignmentFormValues>;
  setValue: UseFormSetValue<AssignmentFormValues>;
  watch: UseFormWatch<AssignmentFormValues>;
}

export const MatchingFields: React.FC<MatchingFieldsProps> = ({
  activityIndex,
  control,
  register,
  setValue,
  watch,
}) => {
  const basePath = `activities.${activityIndex}.content`;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between text-xs text-gray-600 mb-2">
        <span>Pairs are matched by index.</span>
        <button
          type="button"
          className="px-2 py-1 border rounded"
          onClick={() => {
            const left: string[] = (watch(`${basePath}.leftItems` as any) as string[]) || [];
            const right: string[] = (watch(`${basePath}.rightItems` as any) as string[]) || [];
            setValue(`${basePath}.leftItems` as any, [...left, ""] as any, { shouldDirty: true });
            setValue(`${basePath}.rightItems` as any, [...right, ""] as any, { shouldDirty: true });
          }}
        >
          Add Pair
        </button>
      </div>
      {(() => {
        const left: string[] = (watch(`${basePath}.leftItems` as any) as string[]) || [];
        const right: string[] = (watch(`${basePath}.rightItems` as any) as string[]) || [];
        const len = Math.max(left.length, right.length);
        return (
          <div className="space-y-2">
            {Array.from({ length: len }).map((_, i) => (
              <div key={i} className="grid md:grid-cols-3 gap-2 items-center">
                <input
                  {...register(`${basePath}.leftItems.${i}` as any)}
                  className="px-3 py-2 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  placeholder={`Left #${i + 1}`}
                />
                <input
                  {...register(`${basePath}.rightItems.${i}` as any)}
                  className="px-3 py-2 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  placeholder={`Right #${i + 1}`}
                />
                <div className="flex justify-end">
                  <button
                    type="button"
                    className="text-red-600 border px-2 py-1 rounded"
                    onClick={() => {
                      const l: string[] = (watch(`${basePath}.leftItems` as any) as string[]) || [];
                      const r: string[] = (watch(`${basePath}.rightItems` as any) as string[]) || [];
                      const l2 = l.filter((_, idx) => idx !== i);
                      const r2 = r.filter((_, idx) => idx !== i);
                      setValue(`${basePath}.leftItems` as any, l2 as any, { shouldDirty: true });
                      setValue(`${basePath}.rightItems` as any, r2 as any, { shouldDirty: true });
                    }}
                  >
                    Remove
                  </button>
                </div>
              </div>
            ))}
          </div>
        );
      })()}
    </div>
  );
};













