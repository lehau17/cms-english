import { Trash2 } from "lucide-react";
import {
  type Control,
  type FieldValues,
  useFieldArray,
  type UseFormRegister
} from "react-hook-form";

interface ConversationDialogEditorProps<TForm extends FieldValues = any> {
  basePath: string;
  control: Control<TForm>;
  register: UseFormRegister<TForm>;
}

export function ConversationDialogEditor<TForm extends FieldValues = any>({
  basePath,
  control,
  register,
}: ConversationDialogEditorProps<TForm>) {
  const { fields, append, remove } = useFieldArray({ control, name: basePath as any });

  return (
    <div className="space-y-2">
      <label className="block text-xs font-medium text-gray-600">Initial Dialog</label>
      {fields.map((f, i) => (
        <div key={f.id} className="grid md:grid-cols-3 gap-2">
          <select
            {...register(`${basePath}.${i}.role` as any)}
            className="px-3 py-2 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-colors"
          >
            <option value="assistant">assistant</option>
            <option value="user">user</option>
          </select>
          <input
            {...register(`${basePath}.${i}.text` as any)}
            className="md:col-span-2 px-3 py-2 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-colors"
            placeholder="Text *"
          />
          <div className="md:col-span-3 flex justify-end">
            <button type="button" onClick={() => remove(i)} className="text-red-500">
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      ))}
      <button
        type="button"
        onClick={() => append({ role: "assistant", text: "" } as any)}
        className="text-purple-700 border border-purple-300 px-2 py-1 rounded text-xs"
      >
        + Add message
      </button>
    </div>
  );
}










