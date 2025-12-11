import { VocabItemsEditor } from '@/components/shared/activity-editors';
import { AssignmentFormValues } from '@/schemas/assignment.schema';
import {
  type Control,
  type UseFormRegister,
  type UseFormSetValue,
  type UseFormWatch
} from 'react-hook-form';

interface VocabFieldsProps {
  activityIndex: number;
  control: Control<AssignmentFormValues>;
  register: UseFormRegister<AssignmentFormValues>;
  setValue: UseFormSetValue<AssignmentFormValues>;
  watch: UseFormWatch<AssignmentFormValues>;
}

export const VocabFields: React.FC<VocabFieldsProps> = ({
  activityIndex,
  control,
  register,
  setValue,
  watch,
}) => {
  const basePath = `activities.${activityIndex}.content`;

  return (
    <VocabItemsEditor
      basePath={basePath}
      control={control}
      register={register}
      setValue={setValue}
      watch={watch}
    />
  );
};










