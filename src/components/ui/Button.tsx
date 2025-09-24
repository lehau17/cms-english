
import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'danger';
  isLoading?: boolean;
  size?: 'sm' | 'md';
}

const Button: React.FC<ButtonProps> = ({ children, variant = 'primary', isLoading = false, size = 'sm', ...props }) => {
  const sizeClasses = size === 'sm' ? 'px-4 py-2 text-sm rounded-lg' : 'px-5 py-2.5 text-base rounded-xl';
  const baseClasses = `${sizeClasses} font-medium transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex flex-rol items-center justify-center gap-2`;

  const variantClasses = {
    primary: 'bg-indigo-600 hover:bg-indigo-700 text-white',
    secondary: 'bg-gray-100 text-gray-800 hover:bg-gray-200',
    danger: 'bg-red-600 hover:bg-red-700 text-white',
  };

  return (
    <button
      {...props}
      className={`${baseClasses} ${variantClasses[variant]}`}
      disabled={isLoading || props.disabled}
    >
      {isLoading ? (
        <div className="flex items-center justify-center gap-2">
          <div className="animate-spin rounded-full h-4 w-4 border-2 border-white/30 border-t-white"></div>
          <span className="text-inherit">Loading…</span>
        </div>
      ) : children}
    </button>
  );
};

export default Button;
