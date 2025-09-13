import type { ChildrenProps } from "@/types";

export default function layout({ children }: ChildrenProps) {
  return <main className="max-w-7xl mx-auto p-4">{children}</main>;
}
