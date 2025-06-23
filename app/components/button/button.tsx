import React, { type PropsWithChildren } from 'react';

import './button.css';

interface ButtonProps extends PropsWithChildren {
  type?: 'submit' | 'reset' | 'button' | undefined;
  disabled?: boolean | undefined;
  className?: string;
}

export function Button({ children, className, ...otherProps }: ButtonProps) {
  return (
    <button className={`action-button ${className}`} {...otherProps}>
      {children}
    </button>
  );
}
