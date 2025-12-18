import { StringArrayField } from '@/components/shared/activity-editors';
import { AssignmentFormValues } from '@/schemas/assignment.schema';
import {
  type Control,
  type UseFormRegister,
  type UseFormWatch
} from 'react-hook-form';

interface WritingFieldsProps {
  activityIndex: number;
  control: Control<AssignmentFormValues>;
  register: UseFormRegister<AssignmentFormValues>;
  watch: UseFormWatch<AssignmentFormValues>;
}

export const WritingFields: React.FC<WritingFieldsProps> = ({
  activityIndex,
  control,
  register,
  watch,
}) => {
  const basePath = `activities.${activityIndex}.content`;

  return (
    <div className="space-y-4">
      <input
        {...register(`${basePath}.prompt` as any)}
        className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-colors"
        placeholder="Prompt *"
      />
      <div className="grid md:grid-cols-2 gap-3">
        <input
          type="number"
          {...register(`${basePath}.minWords` as any, { valueAsNumber: true })}
          className="px-3 py-2 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-colors"
          placeholder="Min words (e.g., 40)"
        />
        <StringArrayField
          name={`${basePath}.rubric`}
          control={control}
          label="Rubric *"
          placeholder="Criterion (e.g., Grammar - 25%)"
          register={register}
        />
      </div>
    </div>
  );
};





















