import React, { type PropsWithChildren } from 'react';

import './conversation.css';

interface ContainerProps extends PropsWithChildren {
  className?: string;
}

export function Container({
  children,
  className = 'py-10 px-8',
}: ContainerProps) {
  return (
    <div className="parent-container">
      <div className={`container ${className}`}>{children}</div>
    </div>
  );
}
