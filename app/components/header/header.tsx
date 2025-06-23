import React, { type PropsWithChildren } from 'react';

import './header.css';

interface ContainerProps extends PropsWithChildren {
  type?: 'h1' | 'h2';
}

export function Header({ type, children }: ContainerProps) {
  if (!type || type == 'h1') {
    return <h1 className="resonance-text">{children}</h1>;
  } else if (type == 'h2') {
    return <h2 className="match-title">{children}</h2>;
  }
}
