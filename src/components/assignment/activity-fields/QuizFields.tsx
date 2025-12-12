import { ListeningQuestionsEditor } from '@/components/shared/activity-editors';
import { AssignmentFormValues } from '@/schemas/assignment.schema';
import {
  type Control,
  type UseFormRegister,
  type UseFormWatch
} from 'react-hook-form';

interface QuizFieldsProps {
  activityIndex: number;
  control: Control<AssignmentFormValues>;
  register: UseFormRegister<AssignmentFormValues>;
  watch: UseFormWatch<AssignmentFormValues>;
}

export const QuizFields: React.FC<QuizFieldsProps> = ({
  activityIndex,
  control,
  register,
  watch,
}) => {
  const basePath = `activities.${activityIndex}.content.questions`;

  return (
    <ListeningQuestionsEditor
      basePath={basePath}
      control={control}
      register={register}
      watch={watch}
    />
  );
};




















