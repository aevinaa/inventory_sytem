import { Loader2 } from 'lucide-react';

const LoadingSpinner = ({ size = 'md', color = 'current', className = '' }) => {
  const sizeMap = {
    sm: 16,
    md: 24,
    lg: 32,
    xl: 48,
  };

  return (
    <div className={`flex justify-center items-center ${className}`}>
      <Loader2 
        size={sizeMap[size]} 
        className="animate-spin" 
        style={{ color: color === 'current' ? 'currentColor' : color }}
      />
    </div>
  );
};

export default LoadingSpinner;
