import type { FieldError, ValidationResult } from "../types/index.js";

export function createFieldError(message: string, code?: string): FieldError {
  return {
    message,
    ...(code && { code })
  };
}

export function isValidationResult(value: any): value is ValidationResult {
  return (
    typeof value === 'object' &&
    value !== null &&
    typeof value.valid === 'boolean'
  );
}

export function normalizeValidationResult(
  result: ValidationResult | string | boolean
): ValidationResult {
  if (typeof result === 'boolean') {
    return { valid: result };
  }
  
  if (typeof result === 'string') {
    return { valid: false, error: result };
  }
  
  if (isValidationResult(result)) {
    return result;
  }
  
  return { valid: false, error: 'Invalid validation result' };
}

export function combineValidationResults(results: ValidationResult[]): ValidationResult {
  const errors = results
    .filter(result => !result.valid)
    .map(result => result.error)
    .filter(Boolean);
    
  if (errors.length === 0) {
    return { valid: true };
  }
  
  return {
    valid: false,
    error: errors.length === 1 ? errors[0] : errors.join(', ')
  };
}

export function validateRequired(value: any, message = "This field is required"): ValidationResult {
  if (value === null || value === undefined || value === '') {
    return { valid: false, error: message };
  }
  
  if (Array.isArray(value) && value.length === 0) {
    return { valid: false, error: message };
  }
  
  return { valid: true };
}

export function validateEmail(value: string, message = "Please enter a valid email address"): ValidationResult {
  if (!value) return { valid: true }; // Let required validation handle empty values
  
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  
  if (!emailRegex.test(value)) {
    return { valid: false, error: message };
  }
  
  return { valid: true };
}

export function validateMinLength(
  value: string, 
  minLength: number, 
  message?: string
): ValidationResult {
  if (!value) return { valid: true }; // Let required validation handle empty values
  
  if (value.length < minLength) {
    return { 
      valid: false, 
      error: message || `Must be at least ${minLength} characters long` 
    };
  }
  
  return { valid: true };
}

export function validateMaxLength(
  value: string, 
  maxLength: number, 
  message?: string
): ValidationResult {
  if (!value) return { valid: true }; // Let required validation handle empty values
  
  if (value.length > maxLength) {
    return { 
      valid: false, 
      error: message || `Must be no more than ${maxLength} characters long` 
    };
  }
  
  return { valid: true };
}

export function validatePattern(
  value: string, 
  pattern: RegExp, 
  message = "Invalid format"
): ValidationResult {
  if (!value) return { valid: true }; // Let required validation handle empty values
  
  if (!pattern.test(value)) {
    return { valid: false, error: message };
  }
  
  return { valid: true };
}

export function validateNumber(
  value: any,
  options?: {
    min?: number;
    max?: number;
    integer?: boolean;
    message?: string;
  }
): ValidationResult {
  if (value === null || value === undefined || value === '') {
    return { valid: true }; // Let required validation handle empty values
  }
  
  const num = Number(value);
  
  if (isNaN(num)) {
    return { valid: false, error: options?.message || "Must be a valid number" };
  }
  
  if (options?.integer && !Number.isInteger(num)) {
    return { valid: false, error: options?.message || "Must be a whole number" };
  }
  
  if (options?.min !== undefined && num < options.min) {
    return { 
      valid: false, 
      error: options?.message || `Must be at least ${options.min}` 
    };
  }
  
  if (options?.max !== undefined && num > options.max) {
    return { 
      valid: false, 
      error: options?.message || `Must be no more than ${options.max}` 
    };
  }
  
  return { valid: true };
}