import { motion } from 'framer-motion';

const Button = ({ 
  children, 
  variant = 'primary', 
  size = 'medium', 
  disabled = false,
  className = '',
  onClick,
  type = 'button',
  ...props 
}) => {
  const baseClasses = 'font-medium rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed';
  
  const variants = {
    primary: 'bg-primary text-white hover:bg-blue-700 focus:ring-primary',
    secondary: 'bg-secondary text-white hover:bg-purple-800 focus:ring-secondary',
    outline: 'border border-surface-300 text-surface-700 bg-white hover:bg-surface-50 focus:ring-primary',
    danger: 'bg-error text-white hover:bg-red-600 focus:ring-error',
    success: 'bg-success text-white hover:bg-green-600 focus:ring-success'
  };

  const sizes = {
    small: 'px-3 py-1.5 text-sm',
    medium: 'px-4 py-2 text-sm',
    large: 'px-6 py-3 text-base'
  };

  const buttonClasses = `${baseClasses} ${variants[variant]} ${sizes[size]} ${className}`;

  return (
    <motion.button
      whileHover={{ scale: disabled ? 1 : 1.02 }}
      whileTap={{ scale: disabled ? 1 : 0.98 }}
      className={buttonClasses}
      disabled={disabled}
      onClick={onClick}
      type={type}
      {...props}
    >
      {children}
    </motion.button>
  );
};

export default Button;