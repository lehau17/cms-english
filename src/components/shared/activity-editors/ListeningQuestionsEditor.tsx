import { Trash2 } from "lucide-react";
import {
  type Control,
  Controller,
  type FieldValues,
  useFieldArray,
  type UseFormRegister,
  type UseFormWatch
} from "react-hook-form";

interface ListeningQuestionsEditorProps<TForm extends FieldValues = any> {
  basePath: string;
  control: Control<TForm>;
  register: UseFormRegister<TForm>;
  watch: UseFormWatch<TForm>;
}

function ListeningQuestionOptionsEditor<TForm extends FieldValues = any>({
  basePath,
  control,
  register,
}: {
  basePath: string;
  control: Control<TForm>;
  register: UseFormRegister<TForm>;
}) {
  const optionsName = `${basePath}.options`;
  const { fields, append, remove } = useFieldArray({ control, name: optionsName as any });

  return (
    <div className="space-y-2">
      <label className="block text-xs font-medium text-gray-600">Answer Options</label>
      <div className="space-y-2">
        {fields.map((field, optionIndex) => (
          <div key={field.id} className="flex items-center gap-2">
            <input
              {...register(`${optionsName}.${optionIndex}` as any)}
              className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              placeholder={`Option ${optionIndex + 1}`}
            />
            <label className="text-xs inline-flex items-center gap-1 px-2 py-1 border border-gray-300 rounded whitespace-nowrap">
              <Controller
                name={`${basePath}.correctIndex` as any}
                control={control}
                render={({ field: radioField }) => (
                  <input
                    type="radio"
                    value={optionIndex}
                    checked={radioField.value === optionIndex}
                    onChange={() => radioField.onChange(optionIndex)}
                  />
                )}
              />
              Correct
            </label>
            <button
              type="button"
              onClick={() => remove(optionIndex)}
              className="text-red-500 hover:text-red-700"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>
      <button
        type="button"
        onClick={() => append("" as any)}
        className="text-gray-700 border border-gray-300 px-2 py-1 rounded text-xs hover:bg-gray-50 transition-colors"
      >
        + Add Option
      </button>
    </div>
  );
}

export function ListeningQuestionsEditor<TForm extends FieldValues = any>({
  basePath,
  control,
  register,
  watch,
}: ListeningQuestionsEditorProps<TForm>) {
  const { fields, append, remove } = useFieldArray({ control, name: basePath as any });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <label className="block text-sm font-medium text-gray-700">Questions</label>
        <button
          type="button"
          onClick={() => append({ question: "", options: ["", ""], correctIndex: 0 } as any)}
          className="text-purple-700 border border-purple-300 px-3 py-1 rounded text-sm hover:bg-purple-50"
        >
          + Add Question
        </button>
      </div>

      {fields.map((field, questionIndex) => (
        <div key={field.id} className="p-4 border border-gray-200 rounded-lg bg-white">
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-sm font-medium text-gray-700">Question #{questionIndex + 1}</h4>
            <button
              type="button"
              onClick={() => remove(questionIndex)}
              className="text-red-500 hover:text-red-700"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>

          <div className="space-y-3">
            <input
              {...register(`${basePath}.${questionIndex}.question` as any)}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              placeholder="Enter your question"
            />

            <ListeningQuestionOptionsEditor
              basePath={`${basePath}.${questionIndex}`}
              control={control}
              register={register}
            />
          </div>
        </div>
      ))}

      {fields.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          <p className="mb-2">No questions added yet</p>
          <button
            type="button"
            onClick={() => append({ question: "", options: ["", ""], correctIndex: 0 } as any)}
            className="text-purple-700 border border-purple-300 px-4 py-2 rounded hover:bg-purple-50"
          >
            Add First Question
          </button>
        </div>
      )}
    </div>
  );
}
