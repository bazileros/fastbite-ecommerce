"use client";

import { useEffect } from 'react';

export default function AppError({ error, reset }: { error: Error; reset: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex justify-center items-center min-h-screen">
      <div className="p-8 max-w-md text-center">
        <h1 className="font-bold text-3xl">Something went wrong</h1>
        <p className="mt-4 text-muted-foreground">An unexpected error occurred. Try refreshing the page.</p>
        <div className="space-x-2 mt-6">
          <button
            type="button"
            onClick={() => reset()}
            className="bg-primary px-4 py-2 rounded-md text-primary-foreground"
          >
            Try again
          </button>
        </div>
      </div>
    </div>
  );
}
