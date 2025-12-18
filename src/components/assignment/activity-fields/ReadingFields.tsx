import { ListeningQuestionsEditor } from '@/components/shared/activity-editors';
import { AssignmentFormValues } from '@/schemas/assignment.schema';
import {
  type Control,
  type UseFormRegister,
  type UseFormWatch
} from 'react-hook-form';

interface ReadingFieldsProps {
  activityIndex: number;
  control: Control<AssignmentFormValues>;
  register: UseFormRegister<AssignmentFormValues>;
  watch: UseFormWatch<AssignmentFormValues>;
}

export const ReadingFields: React.FC<ReadingFieldsProps> = ({
  activityIndex,
  control,
  register,
  watch,
}) => {
  const basePath = `activities.${activityIndex}.content`;

  return (
    <div className="space-y-4">
      <div className="mb-4">
        <label className="block text-xs font-medium text-gray-600 mb-1">Passage *</label>
        <textarea
          {...register(`${basePath}.passage` as any)}
          className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-colors resize-none"
          rows={4}
          placeholder="Reading passage *"
        />
      </div>
      <ListeningQuestionsEditor
        basePath={`${basePath}.questions`}
        control={control}
        register={register}
        watch={watch}
      />
    </div>
  );
};





















