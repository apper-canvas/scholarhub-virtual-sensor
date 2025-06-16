import { forwardRef } from 'react';

const Input = forwardRef(({ 
  label, 
  error, 
  type = 'text', 
  className = '', 
  required = false,
  ...props 
}, ref) => {
  const inputClasses = `
    w-full px-3 py-2 border rounded-md text-sm
    ${error 
      ? 'border-error focus:ring-error focus:border-error' 
      : 'border-surface-300 focus:ring-primary focus:border-primary'
    }
    focus:outline-none focus:ring-2 focus:ring-opacity-50
    disabled:bg-surface-50 disabled:text-surface-500
    ${className}
  `;

  return (
    <div className="space-y-1">
      {label && (
        <label className="block text-sm font-medium text-surface-700">
          {label}
          {required && <span className="text-error ml-1">*</span>}
        </label>
      )}
      <input
        ref={ref}
        type={type}
        className={inputClasses}
        {...props}
      />
      {error && (
        <p className="text-sm text-error">{error}</p>
      )}
    </div>
  );
});

Input.displayName = 'Input';

export default Input;