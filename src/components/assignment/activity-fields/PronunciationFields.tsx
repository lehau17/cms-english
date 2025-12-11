import { PronunciationPhrasesEditor, StringArrayField } from '@/components/shared/activity-editors';
import { AssignmentFormValues } from '@/schemas/assignment.schema';
import {
  type Control,
  type UseFormRegister,
  type UseFormSetValue,
  type UseFormWatch
} from 'react-hook-form';

interface PronunciationFieldsProps {
  activityIndex: number;
  control: Control<AssignmentFormValues>;
  register: UseFormRegister<AssignmentFormValues>;
  setValue: UseFormSetValue<AssignmentFormValues>;
  watch: UseFormWatch<AssignmentFormValues>;
}

export const PronunciationFields: React.FC<PronunciationFieldsProps> = ({
  activityIndex,
  control,
  register,
  setValue,
  watch,
}) => {
  const basePath = `activities.${activityIndex}.content`;

  return (
    <div className="space-y-4">
      <PronunciationPhrasesEditor
        basePath={basePath}
        control={control}
        register={register}
        setValue={setValue}
        watch={watch}
      />
      <div className="mt-4">
        <label className="block text-xs font-medium text-gray-600 mb-1">Phonetics</label>
        <input
          {...register(`${basePath}.phonetics` as any)}
          className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-colors"
          placeholder="Phonetics (e.g., /aɪ siː ə ˈlaɪən/)"
        />
      </div>
      <StringArrayField
        name={`${basePath}.tips`}
        control={control}
        label="Tips"
        placeholder="Tip"
        register={register}
      />
    </div>
  );
};










