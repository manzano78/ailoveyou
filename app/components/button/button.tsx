import React, { type PropsWithChildren } from 'react';

import './button.css';

interface ButtonProps extends PropsWithChildren {
  type?: 'submit' | 'reset' | 'button' | undefined;
  disabled?: boolean | undefined;
}

export function Button({ children, ...otherProps }: ButtonProps) {
  return (
    <button className="action-button" {...otherProps}>
      {children}
    </button>
  );
}
