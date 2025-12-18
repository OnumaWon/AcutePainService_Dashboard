
export const COLORS = [
  '#3b82f6', '#f59e0b', '#10b981', '#ef4444', '#8b5cf6', 
  '#06b6d4', '#ec4899', '#6366f1', '#14b8a6', '#f43f5e', 
  '#84cc16', '#2dd4bf', '#fb923c', '#a78bfa'
];

export const MONTH_NAMES = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun", 
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
];

export const formatVal = (v: any): string => {
  if (v === null || v === undefined || v === '') return '-';
  const num = typeof v === 'string' ? parseFloat(v.replace(/%/g, '')) : v;
  if (isNaN(num)) return String(v);
  if (num % 1 === 0) return num.toString();
  return num.toFixed(2);
};

export const cleanMedName = (name: string): string => {
  if (!name) return '';
  // Remove common administrative tags like (HAD), (Fall), (ph2.5), (Pregab), etc.
  return name
    .replace(/\(.*?\)/g, '')
    .replace(/\s+/g, ' ')
    .trim();
};
