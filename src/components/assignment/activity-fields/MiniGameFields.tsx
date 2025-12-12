import { StringArrayField } from '@/components/shared/activity-editors';
import { AssignmentFormValues } from '@/schemas/assignment.schema';
import {
  type Control,
  type UseFormRegister,
  type UseFormWatch
} from 'react-hook-form';

interface MiniGameFieldsProps {
  activityIndex: number;
  control: Control<AssignmentFormValues>;
  register: UseFormRegister<AssignmentFormValues>;
  watch: UseFormWatch<AssignmentFormValues>;
}

export const MiniGameFields: React.FC<MiniGameFieldsProps> = ({
  activityIndex,
  control,
  register,
  watch,
}) => {
  const basePath = `activities.${activityIndex}.content`;

  return (
    <div className="space-y-4">
      <div className="grid md:grid-cols-3 gap-3">
        <input
          {...register(`${basePath}.target` as any)}
          className="px-3 py-2 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-colors"
          placeholder="Target *"
        />
        <input
          type="number"
          {...register(`${basePath}.rounds` as any, { valueAsNumber: true })}
          className="px-3 py-2 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-colors"
          placeholder="Rounds *"
        />
      </div>
      <StringArrayField
        name={`${basePath}.pool`}
        control={control}
        label="Word pool *"
        placeholder="Word"
        register={register}
      />
    </div>
  );
};
















