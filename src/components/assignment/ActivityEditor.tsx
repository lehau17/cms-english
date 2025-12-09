import { Control, UseFormRegister, UseFormWatch } from 'react-hook-form';
import { AssignmentFormValues } from '../../schemas/assignment.schema';
import { TypeSpecificFields } from './TypeSpecificFields';

interface ActivityEditorProps {
    activityIndex: number;
    activityType: string;
    control: Control<AssignmentFormValues>;
    register: UseFormRegister<AssignmentFormValues>;
    watch: UseFormWatch<AssignmentFormValues>;
    setValue: any;
}

export const ActivityEditor: React.FC<ActivityEditorProps> = ({
    activityIndex,
    activityType,
    control,
    register,
    watch,
    setValue,
}) => {
    return (
        <TypeSpecificFields
            idx={activityIndex}
            type={activityType}
            control={control}
            register={register}
            setValue={setValue}
            watch={watch}
        />
    );
};

