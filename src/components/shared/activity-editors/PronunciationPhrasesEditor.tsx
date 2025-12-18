import { useGenerateAudio } from "@/hooks/useGenerateAudio";
import { Trash2, Wand2 } from "lucide-react";
import {
  type Control,
  type FieldValues,
  useFieldArray,
  type UseFormRegister,
  type UseFormSetValue,
  type UseFormWatch
} from "react-hook-form";
import toast from "react-hot-toast";
import { UploadField } from "./UploadField";

interface PronunciationPhrasesEditorProps<TForm extends FieldValues = any> {
  basePath: string;
  control: Control<TForm>;
  register: UseFormRegister<TForm>;
  setValue: UseFormSetValue<TForm>;
  watch: UseFormWatch<TForm>;
}

export function PronunciationPhrasesEditor<TForm extends FieldValues = any>({
  basePath,
  control,
  register,
  setValue,
  watch
}: PronunciationPhrasesEditorProps<TForm>) {
  const name = `${basePath}.phrases`;
  const { fields, append, remove } = useFieldArray({ control, name: name as any });
  const generateAudio = useGenerateAudio();

  const handleGenerateAudio = async (index: number) => {
    const text = watch(`${name}.${index}.text` as any) as string;
    if (!text || (typeof text === 'string' && text.trim() === '')) {
      toast.error('Vui lòng nhập phrase text trước');
      return;
    }

    try {
      const result = await generateAudio.mutateAsync({ text: String(text), language: 'en' });
      setValue(`${name}.${index}.sampleUrl` as any, result.url as any, { shouldDirty: true });
    } catch (error) {
      // Error is handled by useGenerateAudio hook
    }
  };

  return (
    <div className="space-y-3">
      <label className="block text-xs font-medium text-gray-600">Phrases to Practice *</label>

      {fields.map((f, i) => (
        <div key={f.id} className="p-3 border rounded-lg bg-white space-y-3">
          <div className="flex items-center justify-between">
            <div className="font-semibold text-sm text-purple-800">Phrase #{i + 1}</div>
            <button type="button" onClick={() => remove(i)} className="text-red-500">
              <Trash2 className="w-4 h-4" />
            </button>
          </div>

          <input
            {...register(`${name}.${i}.text` as any)}
            className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-colors"
            placeholder="Phrase text (e.g., 'I see a lion.')"
          />

          <div className="flex items-end gap-2">
            <div className="flex-1">
              <UploadField
                name={`${name}.${i}.sampleUrl`}
                label="Sample Audio"
                accept="audio/*"
                placeholder="Upload or generate audio"
                register={register}
                setValue={setValue}
                watch={watch}
                type="audio"
              />
            </div>
            <button
              type="button"
              onClick={() => handleGenerateAudio(i)}
              disabled={generateAudio.isPending}
              className="px-3 py-2 bg-purple-100 text-purple-700 rounded hover:bg-purple-200 disabled:opacity-50 flex items-center gap-1 text-sm whitespace-nowrap"
            >
              <Wand2 className="w-4 h-4" />
              {generateAudio.isPending ? 'Đang tạo...' : 'Gen AI'}
            </button>
          </div>
        </div>
      ))}

      <button
        type="button"
        onClick={() => append({ text: "", sampleUrl: "" } as any)}
        className="text-gray-700 border border-gray-300 px-2 py-1 rounded text-xs hover:bg-gray-50 transition-colors"
      >
        + Add phrase
      </button>
    </div>
  );
}





















