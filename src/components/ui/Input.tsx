
import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
  size?: 'sm' | 'md';
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, size = 'sm', className, ...props }, ref) => {
    const sizeClasses = size === 'sm'
      ? 'px-3 py-2 text-sm rounded-lg'
      : 'px-4 py-2.5 text-base rounded-xl';
    const inputId = (props.id as string) || (props.name as string) || undefined;
    const errorId = inputId ? `${inputId}-error` : undefined;

    return (
      <div>
        <label htmlFor={inputId} className="block text-xs font-medium text-gray-700 mb-1.5">{label}</label>
        <input
          {...props}
          ref={ref}
          id={inputId}
          aria-invalid={!!error}
          aria-describedby={error ? errorId : undefined}
          className={`w-full border border-gray-300 ${sizeClasses} focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors ${className || ''}`}
        />
        {error && <p id={errorId} className="text-red-500 text-xs mt-1">{error}</p>}
      </div>
    );
  }
);

export default Input;
