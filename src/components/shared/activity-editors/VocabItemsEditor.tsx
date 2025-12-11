import { Trash2 } from "lucide-react";
import {
  type Control,
  type FieldValues,
  useFieldArray,
  type UseFormRegister,
  type UseFormSetValue,
  type UseFormWatch
} from "react-hook-form";
import { StringArrayField } from "./StringArrayField";
import { UploadField } from "./UploadField";

interface VocabItemsEditorProps<TForm extends FieldValues = any> {
  basePath: string;
  control: Control<TForm>;
  register: UseFormRegister<TForm>;
  setValue: UseFormSetValue<TForm>;
  watch: UseFormWatch<TForm>;
}

export function VocabItemsEditor<TForm extends FieldValues = any>({
  basePath,
  control,
  register,
  setValue,
  watch
}: VocabItemsEditorProps<TForm>) {
  const name = `${basePath}.items`;
  const { fields, append, remove } = useFieldArray({ control, name: name as any });

  return (
    <div className="space-y-3">
      <label className="block text-xs font-medium text-gray-600">Vocabulary Items *</label>

      {fields.map((f, i) => (
        <div key={f.id} className="p-3 border rounded-lg bg-white space-y-3">
          <div className="flex items-center justify-between">
            <div className="font-semibold text-sm text-purple-800">Item #{i + 1}</div>
            <button type="button" onClick={() => remove(i)} className="text-red-500">
              <Trash2 className="w-4 h-4" />
            </button>
          </div>

          <div className="grid md:grid-cols-2 gap-3">
            <input
              {...register(`${name}.${i}.word` as any)}
              className="px-3 py-2 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              placeholder="Word *"
            />
            <input
              {...register(`${name}.${i}.definition` as any)}
              className="px-3 py-2 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              placeholder="Definition *"
            />
          </div>

          <div className="grid md:grid-cols-2 gap-3">
            <UploadField
              key={`image-${f.id}`}
              name={`${name}.${i}.imageUrl`}
              label="Image"
              accept="image/*"
              placeholder="Drag & drop or click to upload image"
              register={register}
              setValue={setValue}
              watch={watch}
              type="image"
            />
            <UploadField
              key={`audio-${f.id}`}
              name={`${name}.${i}.audioUrl`}
              label="Audio"
              accept="audio/*"
              placeholder="Drag & drop or click to upload audio"
              register={register}
              setValue={setValue}
              watch={watch}
              type="audio"
            />
          </div>

          <StringArrayField
            name={`${name}.${i}.examples`}
            control={control}
            label="Examples"
            placeholder="Example sentence"
            register={register}
          />
        </div>
      ))}

      <button
        type="button"
        onClick={() => append({ word: "", definition: "", examples: [""], imageUrl: "", audioUrl: "" } as any)}
        className="text-gray-700 border border-gray-300 px-2 py-1 rounded text-xs hover:bg-gray-50 transition-colors"
      >
        + Add vocab item
      </button>
    </div>
  );
}










