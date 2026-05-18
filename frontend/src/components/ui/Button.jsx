import { forwardRef } from 'react';
import LoadingSpinner from '../common/LoadingSpinner';

const Button = forwardRef(({ 
  children, 
  variant = 'primary', 
  size = 'md', 
  isLoading = false, 
  className = '', 
  disabled, 
  ...props 
}, ref) => {
  const baseStyles = 'inline-flex items-center justify-center font-medium rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2';
  
  const variants = {
    primary: 'bg-[#1a3c5e] hover:bg-[#112a45] text-white focus:ring-[#1a3c5e]',
    secondary: 'bg-[#c9922a] hover:bg-[#b07f23] text-white focus:ring-[#c9922a]',
    outline: 'border border-gray-300 bg-white hover:bg-gray-50 text-gray-700 focus:ring-[#1a3c5e]',
    danger: 'bg-red-600 hover:bg-red-700 text-white focus:ring-red-600',
    ghost: 'hover:bg-gray-100 text-gray-700 focus:ring-gray-400',
  };

  const sizes = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-6 py-3 text-lg',
  };

  return (
    <button
      ref={ref}
      disabled={isLoading || disabled}
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${disabled || isLoading ? 'opacity-50 cursor-not-allowed' : ''} ${className}`}
      {...props}
    >
      {isLoading ? (
        <LoadingSpinner size="sm" color="white" className="mr-2" />
      ) : null}
      {children}
    </button>
  );
});

Button.displayName = 'Button';
export default Button;
