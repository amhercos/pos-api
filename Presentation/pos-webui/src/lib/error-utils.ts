// lib/error-utils.ts

export interface ApiErrorResponse {
  response?: {
    status: number;
    data?: {
      message?: string;
      error?: string;
    } | string; // Handle case where server returns a raw string
  };
  message?: string;
}

export function getErrorMessage(error: unknown): string {
  const err = error as ApiErrorResponse;
  
  const status = err.response?.status;
  const data = err.response?.data;
  
  // Since your backend logs a 500 error on Foreign Key violations:
  if (status === 500 || status === 409 || status === 400) {
    return "Cannot delete: This category is currently linked to products.";
  }

  // Fallback parsing
  if (typeof data === 'string') return data;
  if (data && typeof data === 'object') {
    return data.message || data.error || "An unexpected error occurred.";
  }
  
  return err.message || "An unexpected error occurred.";
}