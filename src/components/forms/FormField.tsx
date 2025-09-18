
import React from 'react';
import { Controller, useFormContext } from 'react-hook-form';
import Input from '../ui/Input';

interface FormFieldProps {
  name: string;
  label: string;
  type?: string;
  placeholder?: string;
  size?: 'sm' | 'md';
}

const FormField: React.FC<FormFieldProps> = ({ name, label, type = 'text', placeholder, size = 'sm' }) => {
  const { control } = useFormContext();

  return (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState: { error } }) => (
        <Input
          {...field}
          label={label}
          type={type}
          placeholder={placeholder}
          error={error?.message}
          size={size}
        />
      )}
    />
  );
};

export default FormField;
