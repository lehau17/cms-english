import { Trash2 } from "lucide-react";
import {
  type Control,
  Controller,
  type FieldValues,
  useFieldArray,
  type UseFormRegister
} from "react-hook-form";

interface OptionsEditorProps<TForm extends FieldValues = any> {
  basePath: string;
  control: Control<TForm>;
  register: UseFormRegister<TForm>;
  showExplanation?: boolean;
}

export function OptionsEditor<TForm extends FieldValues = any>({
  basePath,
  control,
  register,
  showExplanation = false,
}: OptionsEditorProps<TForm>) {
  const name = `${basePath}.options`;
  const { fields, append, remove } = useFieldArray({ control, name: name as any });

  return (
    <div className="space-y-2">
      <label className="block text-xs font-medium text-gray-600">Options *</label>
      <div className="space-y-2">
        {fields.map((f, i) => (
          <div key={f.id} className="flex items-center gap-2">
            <input
              {...register(`${name}.${i}` as any)}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              placeholder={`Option #${i + 1}`}
            />
            <label className="text-xs inline-flex items-center gap-1 px-2 py-1 border border-gray-300 rounded">
              <Controller
                name={`${basePath}.correctIndex` as any}
                control={control}
                render={({ field: radioField }) => (
                  <input
                    type="radio"
                    value={i}
                    checked={radioField.value === i}
                    onChange={() => radioField.onChange(i)}
                  />
                )}
              />
              Correct
            </label>
            <button type="button" onClick={() => remove(i)} className="text-red-500">
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => append("" as any)}
          className="text-gray-700 border border-gray-300 px-2 py-1 rounded text-xs hover:bg-gray-50 transition-colors"
        >
          + Add option
        </button>
        {showExplanation && (
          <input
            {...register(`${basePath}.explanation` as any)}
            className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-colors"
            placeholder="Explanation (optional)"
          />
        )}
      </div>
    </div>
  );
}
