'use client';

import * as React from 'react';

import { cn } from '@/lib/utils';

interface ProgressProps extends React.HTMLAttributes<HTMLDivElement> {
  value?: number;
  max?: number;
}

const Progress = React.forwardRef<HTMLDivElement, ProgressProps>(
  ({ className, value = 0, max = 100, ...props }, ref) => {
    // Ensure value is a valid number and clamp between 0 and max
    const safeValue = typeof value === 'number' && !Number.isNaN(value)
      ? Math.max(0, Math.min(max, value))
      : 0;

    const percentage = max > 0 ? (safeValue / max) * 100 : 0;

    return (
      <div
        ref={ref}
        className={cn(
          'relative bg-secondary rounded-full w-full h-4 overflow-hidden',
          className
        )}
        {...props}
      >
        <div
          className="flex-1 bg-primary w-full h-full transition-all duration-300 ease-in-out"
          style={{ transform: `translateX(-${100 - percentage}%)` }}
        />
      </div>
    );
  }
);

Progress.displayName = 'Progress';

export { Progress };