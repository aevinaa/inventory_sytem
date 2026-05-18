import { format, parseISO } from 'date-fns';

export const formatCurrency = (amount) => {
  if (amount === undefined || amount === null) return '';
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 2,
  }).format(amount);
};

export const formatDate = (dateString, formatStr = 'PPP p') => {
  if (!dateString) return '';
  try {
    const date = typeof dateString === 'string' ? parseISO(dateString) : dateString;
    return format(date, formatStr);
  } catch (e) {
    return dateString;
  }
};

export const formatNumber = (num) => {
  if (num === undefined || num === null) return '';
  return new Intl.NumberFormat('en-IN').format(num);
};
