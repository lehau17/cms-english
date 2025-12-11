import { Control, UseFormRegister, UseFormSetValue, UseFormWatch } from 'react-hook-form';
import { AssignmentFormValues } from '../../schemas/assignment.schema';
import {
  ConversationFields,
  DictationFields,
  FillBlankFields,
  FlashcardFields,
  GrammarFields,
  ListeningFields,
  MatchingFields,
  MiniGameFields,
  PronunciationFields,
  QuizFields,
  ReadingFields,
  SpeakingFields,
  VocabFields,
  WritingFields,
} from './activity-fields';

interface TypeSpecificFieldsProps {
  idx: number;
  type: string;
  control?: Control<AssignmentFormValues>;
  register: UseFormRegister<AssignmentFormValues>;
  setValue: UseFormSetValue<AssignmentFormValues>;
  watch: UseFormWatch<AssignmentFormValues>;
}

export const TypeSpecificFields: React.FC<TypeSpecificFieldsProps> = ({
  idx,
  type,
  control,
  register,
  setValue,
  watch,
}) => {
  // Default control to avoid undefined
  if (!control) {
    console.warn('TypeSpecificFields: control prop is undefined');
    return null;
  }

  const props = {
    activityIndex: idx,
    control,
    register,
    setValue,
    watch,
  };

  switch (type) {
    case 'vocab':
      return <VocabFields {...props} />;

    case 'pronunciation':
      return <PronunciationFields {...props} />;

    case 'quiz':
      return <QuizFields {...props} />;

    case 'listening':
      return <ListeningFields {...props} />;

    case 'speaking':
      return <SpeakingFields {...props} />;

    case 'writing':
      return <WritingFields {...props} />;

    case 'flashcard':
      return <FlashcardFields {...props} />;

    case 'conversation':
      return <ConversationFields {...props} />;

    case 'fill_blank':
      return <FillBlankFields {...props} />;

    case 'dictation':
      return <DictationFields {...props} />;

    case 'matching':
      return <MatchingFields {...props} />;

    case 'mini_game':
      return <MiniGameFields {...props} />;

    case 'reading':
      return <ReadingFields {...props} />;

    case 'grammar':
      return <GrammarFields {...props} />;

    default:
      return (
        <div className="p-4 bg-yellow-50 border border-yellow-200 rounded">
          <p className="text-sm text-yellow-800">
            Unknown activity type: <strong>{type}</strong>
          </p>
        </div>
      );
  }
};
