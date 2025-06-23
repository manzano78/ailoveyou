import React from 'react';
import clsx from 'clsx';

type SpinnerSize = 'small' | 'medium' | 'big';

interface SpinnerProps {
  size?: SpinnerSize;
  className?: string;
  color?: string;
}

const sizeMap: Record<SpinnerSize, string> = {
  small: 'h-4 w-4',
  medium: 'h-8 w-8',
  big: 'h-12 w-12',
};

export function Spinner({
  size = 'medium',
  className,
  color = '#3b82f6' /* Tailwind blue-500 */,
}: SpinnerProps) {
  return (
    <div className={clsx('flex items-center justify-center', className)}>
      <div
        className={clsx(
          'animate-spin rounded-full border-4 border-t-transparent border-white/30',
          sizeMap[size],
        )}
        style={{ borderTopColor: color }}
      />
    </div>
  );
}
