import React from 'react';

export type SlugParams = { params: Promise<{ slug: string }> };

export interface ChildrenProps {
  children: React.ReactNode;
}
