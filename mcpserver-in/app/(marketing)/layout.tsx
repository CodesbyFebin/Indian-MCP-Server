// app/(marketing)/layout.tsx
// Marketing section layout — fully static, no auth required

import { ReactNode } from 'react';

export default function MarketingLayout({ children }: { children: ReactNode }) {
  return (
    <>
      {children}
    </>
  );
}
