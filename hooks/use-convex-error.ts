'use client';

import { useCallback, useState } from 'react';

import { toast } from 'sonner';

// Hook for handling Convex operations with error handling
export function useConvexErrorHandler() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const handleError = useCallback((error: unknown, customMessage?: string) => {
    console.error('Convex operation failed:', error);

    let message = customMessage || 'An unexpected error occurred';

    if (error instanceof Error) {
      // Handle specific error types
      if (error.message.includes('Not authenticated')) {
        message = 'Please sign in to continue';
      } else if (error.message.includes('network') || error.message.includes('fetch')) {
        message = 'Network error. Please check your connection and try again';
      } else if (error.message.includes('permission') || error.message.includes('unauthorized')) {
        message = 'You do not have permission to perform this action';
      } else if (error.message.includes('not found')) {
        message = 'The requested item was not found';
      } else {
        message = error.message;
      }

      setError(error);
    } else {
      setError(new Error(String(error)));
    }

    toast.error(message);
    return message;
  }, []);

  const executeWithErrorHandling = useCallback(async <T>(
    operation: () => Promise<T>,
    options?: {
      successMessage?: string;
      errorMessage?: string;
      showSuccessToast?: boolean;
    }
  ): Promise<T | null> => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await operation();

      if (options?.showSuccessToast && options.successMessage) {
        toast.success(options.successMessage);
      }

      return result;
    } catch (error) {
      handleError(error, options?.errorMessage);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [handleError]);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    isLoading,
    error,
    handleError,
    executeWithErrorHandling,
    clearError,
  };
}