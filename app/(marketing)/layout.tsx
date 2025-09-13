import type { ChildrenProps } from "@/types";

export default function layout({ children }: ChildrenProps) {
  return <main className="p-4">{children}</main>;
}
