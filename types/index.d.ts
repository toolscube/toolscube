import type React from "react";

export type SlugParams = { params: Promise<{ slug: string }> };

export interface ChildrenProps {
  children: React.ReactNode;
}

declare global {
  interface Window {
    webkitAudioContext?: typeof AudioContext;
  }
}
