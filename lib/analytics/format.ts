export const money = (value: number, signed = false) => `${signed && value > 0 ? '+' : ''}${new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(value)}`;
export const time = (value: string) => new Intl.DateTimeFormat('en-IN', { timeZone: 'Asia/Kolkata', hour: '2-digit', minute: '2-digit', hour12: false }).format(new Date(value));
export const dateLabel = (value: string) => new Intl.DateTimeFormat('en-IN', { timeZone: 'Asia/Kolkata', day: 'numeric', month: 'short' }).format(new Date(value));
export function exactMoney(value: string): string {
  const negative = value.startsWith('-');
  const [whole, fraction = ''] = value.replace(/^-/, '').split('.');
  const last = whole.slice(-3);
  const first = whole.slice(0, -3).replace(/\B(?=(\d{2})+(?!\d))/g, ',');
  return `${negative ? '−' : ''}₹${first ? first + ',' : ''}${last}${fraction ? '.' + fraction : ''}`;
}

// Presentation only: round decimal text exactly, keeping calculations/exports untouched.
export function displayMoney(value: string): string {
  if (!/^-?\d+(?:\.\d+)?$/.test(value)) return '—';
  const negative = value.startsWith('-');
  const [whole, fraction = ''] = value.replace(/^-/, '').split('.');
  let cents = BigInt(whole) * BigInt(100) + BigInt((fraction + '00').slice(0, 2));
  if ((fraction[2] || '0') >= '5') cents += BigInt(1);
  const rounded = `${negative && cents !== BigInt(0) ? '-' : ''}${cents / BigInt(100)}.${(cents % BigInt(100)).toString().padStart(2, '0')}`;
  return exactMoney(rounded);
}
