import { Trash2 } from "lucide-react";
import {
  type Control,
  type FieldValues,
  useFieldArray,
  type UseFormRegister,
  type UseFormSetValue,
  type UseFormWatch
} from "react-hook-form";
import { UploadField } from "./UploadField";

interface FlashcardsEditorProps<TForm extends FieldValues = any> {
  basePath: string;
  control: Control<TForm>;
  register: UseFormRegister<TForm>;
  setValue: UseFormSetValue<TForm>;
  watch: UseFormWatch<TForm>;
}

export function FlashcardsEditor<TForm extends FieldValues = any>({
  basePath,
  control,
  register,
  setValue,
  watch,
}: FlashcardsEditorProps<TForm>) {
  const name = `${basePath}.cards`;
  const { fields, append, remove } = useFieldArray({ control, name: name as any });

  return (
    <div className="space-y-2">
      <label className="block text-xs font-medium text-gray-600">Cards *</label>
      <div className="space-y-3">
        {fields.map((f, i) => (
          <div key={f.id} className="grid md:grid-cols-3 gap-2">
            <input
              {...register(`${name}.${i}.front` as any)}
              className="px-3 py-2 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              placeholder="Front *"
            />
            <input
              {...register(`${name}.${i}.back` as any)}
              className="px-3 py-2 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              placeholder="Back *"
            />
            <div className="flex items-center gap-2">
              <div className="flex-1">
                <UploadField
                  key={`flashcard-image-${f.id}`}
                  name={`${name}.${i}.imageUrl`}
                  label=""
                  accept="image/*"
                  placeholder="Upload image"
                  register={register}
                  setValue={setValue}
                  watch={watch}
                  type="image"
                />
              </div>
              <button type="button" onClick={() => remove(i)} className="text-red-500">
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>
      <button
        type="button"
        onClick={() => append({ front: "", back: "", imageUrl: "" } as any)}
        className="text-purple-700 border border-purple-300 px-2 py-1 rounded text-xs"
      >
        + Add card
      </button>
    </div>
  );
}




















