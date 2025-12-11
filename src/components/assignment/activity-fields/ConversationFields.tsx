import { ConversationDialogEditor, StringArrayField } from '@/components/shared/activity-editors';
import { AssignmentFormValues } from '@/schemas/assignment.schema';
import {
  type Control,
  type UseFormRegister,
  type UseFormWatch
} from 'react-hook-form';

interface ConversationFieldsProps {
  activityIndex: number;
  control: Control<AssignmentFormValues>;
  register: UseFormRegister<AssignmentFormValues>;
  watch: UseFormWatch<AssignmentFormValues>;
}

export const ConversationFields: React.FC<ConversationFieldsProps> = ({
  activityIndex,
  control,
  register,
  watch,
}) => {
  const basePath = `activities.${activityIndex}.content`;

  return (
    <div className="space-y-4">
      <input
        {...register(`${basePath}.scenario` as any)}
        className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-colors"
        placeholder="Scenario *"
      />
      <ConversationDialogEditor
        basePath={`${basePath}.initialDialog`}
        control={control}
        register={register}
      />
      <StringArrayField
        name={`${basePath}.suggestions`}
        control={control}
        label="Suggestions"
        placeholder="Suggestion"
        register={register}
      />
    </div>
  );
};













