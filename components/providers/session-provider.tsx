"use client";

import type { ReactNode } from "react";

interface Props {
  children: ReactNode;
}

export default function AuthSessionProvider({ children }: Props) {
  return <>{children}</>;
}
