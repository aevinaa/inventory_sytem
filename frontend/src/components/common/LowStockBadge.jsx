import Badge from '../ui/Badge';
import { AlertCircle } from 'lucide-react';

const LowStockBadge = ({ quantity, threshold = 10, className = '' }) => {
  if (quantity > threshold) {
    return <Badge variant="success" className={className}>In Stock ({quantity})</Badge>;
  }

  return (
    <Badge variant="danger" className={`flex items-center gap-1 ${className}`}>
      <AlertCircle size={12} />
      Low Stock ({quantity})
    </Badge>
  );
};

export default LowStockBadge;
