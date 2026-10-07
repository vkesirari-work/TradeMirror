export function validateDisplayName(value: unknown): {name:string;error:string|null} {
 const name = typeof value === 'string' ? value.trim() : '';
 const length = Array.from(name).length;
 return {name,error:length < 1 || length > 100 || /[\u0000-\u001f\u007f]/.test(name) ? 'Use a name between 1 and 100 characters without control characters.' : null};
}
