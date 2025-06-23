import React, { type PropsWithChildren } from 'react';

import './conversation.css';

interface ContainerProps extends PropsWithChildren {}

export function Container({ children }: ContainerProps) {
  return (
    <div className="parent-container">
      <div className="container">{children}</div>
    </div>
  );
}
