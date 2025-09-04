import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Merge Tailwind CSS classes with proper precedence
 * Combines clsx for conditional classes with tailwind-merge for deduplication
 *
 * @example
 * cn('px-4 py-2', 'px-8') // → 'py-2 px-8'
 * cn('text-red-500', condition && 'text-blue-500') // → 'text-blue-500' (if condition is true)
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
