import { ListeningQuestionsEditor } from '@/components/shared/activity-editors';
import { AssignmentFormValues } from '@/schemas/assignment.schema';
import {
  type Control,
  type UseFormRegister,
  type UseFormWatch
} from 'react-hook-form';

interface GrammarFieldsProps {
  activityIndex: number;
  control: Control<AssignmentFormValues>;
  register: UseFormRegister<AssignmentFormValues>;
  watch: UseFormWatch<AssignmentFormValues>;
}

export const GrammarFields: React.FC<GrammarFieldsProps> = ({
  activityIndex,
  control,
  register,
  watch,
}) => {
  const basePath = `activities.${activityIndex}.content`;

  return (
    <div className="space-y-4">
      <div className="mb-4">
        <label className="block text-xs font-medium text-gray-600 mb-1">Grammar Rule *</label>
        <input
          {...register(`${basePath}.rule` as any)}
          className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-colors"
          placeholder="Grammar rule *"
        />
      </div>
      <ListeningQuestionsEditor
        basePath={`${basePath}.exercises`}
        control={control}
        register={register}
        watch={watch}
      />
    </div>
  );
};
















