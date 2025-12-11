import { Trash2 } from "lucide-react";
import {
  type Control,
  type FieldValues,
  useFieldArray,
  type UseFormRegister
} from "react-hook-form";

interface StringArrayFieldProps<TForm extends FieldValues = any> {
  name: string;
  control: Control<TForm>;
  label: string;
  placeholder?: string;
  register: UseFormRegister<TForm>;
  errors?: any;
}

export function StringArrayField<TForm extends FieldValues = any>({
  name,
  control,
  label,
  placeholder = "Value",
  register,
  errors
}: StringArrayFieldProps<TForm>) {
  const { fields, append, remove } = useFieldArray({ control, name: name as any });

  // Parse error path to get error message
  const getFieldError = (index: number) => {
    const parts = name.split('.');
    let errorObj = errors;
    for (const part of parts) {
      if (errorObj?.[part]) {
        errorObj = errorObj[part];
      } else {
        return null;
      }
    }
    return errorObj?.[index]?.message;
  };

  // Get array-level error
  const getArrayError = () => {
    const parts = name.split('.');
    let errorObj = errors;
    for (const part of parts) {
      if (errorObj?.[part]) {
        errorObj = errorObj[part];
      } else {
        return null;
      }
    }
    return errorObj?.message || (Array.isArray(errorObj) ? null : errorObj?.message);
  };

  const arrayError = getArrayError();

  return (
    <div className="space-y-2">
      <label className="block text-xs font-medium text-gray-600">{label}</label>
      {fields.map((f, i) => {
        const fieldError = getFieldError(i);
        return (
          <div key={f.id} className="space-y-1">
            <div className="flex items-center gap-2">
              <input
                {...register(`${name}.${i}` as any)}
                className={`w-full px-3 py-2 text-sm border rounded focus:ring-1 transition-colors ${fieldError
                  ? 'border-red-500 focus:ring-red-500 focus:border-red-500'
                  : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'
                  }`}
                placeholder={placeholder}
              />
              <button type="button" onClick={() => remove(i)} className="text-red-500 hover:text-red-700">
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
            {fieldError && (
              <p className="text-xs text-red-600">{fieldError}</p>
            )}
          </div>
        );
      })}
      {arrayError && (
        <p className="text-xs text-red-600 bg-red-50 border border-red-200 rounded px-2 py-1">
          {arrayError}
        </p>
      )}
      <button
        type="button"
        onClick={() => append("" as any)}
        className="text-gray-700 border border-gray-300 px-2 py-1 rounded text-xs hover:bg-gray-50 transition-colors"
      >
        + Add
      </button>
    </div>
  );
}










