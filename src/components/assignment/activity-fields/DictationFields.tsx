import { UploadField } from '@/components/shared/activity-editors';
import { AssignmentFormValues } from '@/schemas/assignment.schema';
import {
  type Control,
  Controller,
  type UseFormRegister,
  type UseFormSetValue,
  type UseFormWatch
} from 'react-hook-form';

interface DictationFieldsProps {
  activityIndex: number;
  control: Control<AssignmentFormValues>;
  register: UseFormRegister<AssignmentFormValues>;
  setValue: UseFormSetValue<AssignmentFormValues>;
  watch: UseFormWatch<AssignmentFormValues>;
}

export const DictationFields: React.FC<DictationFieldsProps> = ({
  activityIndex,
  control,
  register,
  setValue,
  watch,
}) => {
  const basePath = `activities.${activityIndex}.content`;

  return (
    <div className="space-y-4">
      <div className="grid md:grid-cols-2 gap-3">
        <Controller
          name={`${basePath}.audioUrl` as any}
          control={control}
          render={({ field }) => (
            <UploadField
              name={field.name}
              label="Audio File (optional)"
              accept="audio/*"
              placeholder="Upload audio for dictation"
              register={register}
              setValue={setValue}
              watch={watch}
              type="audio"
            />
          )}
        />
        <input
          type="number"
          {...register(`${basePath}.minWords` as any, { valueAsNumber: true })}
          className="px-3 py-2 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-colors"
          placeholder="Min words (optional)"
        />
      </div>
      <textarea
        {...register(`${basePath}.transcript` as any)}
        className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-colors resize-none"
        rows={2}
        placeholder="Expected transcript / answer"
      />
    </div>
  );
};





















