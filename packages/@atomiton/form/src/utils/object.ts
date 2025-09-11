export function safeStringify(obj: any): string {
  try {
    return JSON.stringify(obj);
  } catch {
    return "[CIRCULAR_OR_INVALID]";
  }
}

export function hasCircularReference(obj: any, seen = new WeakSet()): boolean {
  if (obj === null || typeof obj !== "object") {
    return false;
  }
  
  if (seen.has(obj)) {
    return true;
  }
  
  seen.add(obj);
  
  for (const key in obj) {
    if (obj.hasOwnProperty(key) && hasCircularReference(obj[key], seen)) {
      return true;
    }
  }
  
  return false;
}

export function getNestedValue(obj: any, path: string): any {
  if (!path || path === '') {
    return obj;
  }
  return path.split('.').reduce((current, key) => current?.[key], obj);
}

export function setNestedValue(obj: any, path: string, value: any): void {
  const keys = path.split('.');
  const lastKey = keys.pop();
  
  if (!lastKey) return;
  
  let current = obj;
  for (const key of keys) {
    if (current[key] === undefined || current[key] === null) {
      current[key] = {};
    }
    current = current[key];
  }
  
  current[lastKey] = value;
}

export function deepClone<T>(obj: T): T {
  if (obj === null || typeof obj !== "object") {
    return obj;
  }
  
  if (hasCircularReference(obj)) {
    console.warn("Cannot deep clone object with circular references");
    return obj;
  }
  
  if (obj instanceof Date) {
    return new Date(obj.getTime()) as T;
  }
  
  if (Array.isArray(obj)) {
    return obj.map(item => deepClone(item)) as T;
  }
  
  const cloned = {} as T;
  for (const key in obj) {
    if (obj.hasOwnProperty(key)) {
      cloned[key] = deepClone(obj[key]);
    }
  }
  
  return cloned;
}