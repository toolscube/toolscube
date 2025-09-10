import Link from "next/link";
import type { ComponentPropsWithoutRef } from "react";
import { CodeBlock } from "./components/shared/code-block";

type HeadingProps = ComponentPropsWithoutRef<"h1">;
type ParagraphProps = ComponentPropsWithoutRef<"p">;
type ListProps = ComponentPropsWithoutRef<"ul">;
type ListItemProps = ComponentPropsWithoutRef<"li">;
type AnchorProps = ComponentPropsWithoutRef<"a">;
type BlockquoteProps = ComponentPropsWithoutRef<"blockquote">;

const components = {
  h1: (props: HeadingProps) => (
    <h1 className="text-3xl font-semibold tracking-tight pt-10 pb-4" {...props} />
  ),
  h2: (props: HeadingProps) => (
    <h2
      className="text-2xl font-semibold tracking-tight pt-8 pb-3 text-gray-900 dark:text-zinc-100"
      {...props}
    />
  ),
  h3: (props: HeadingProps) => (
    <h3 className="text-xl font-medium pt-6 pb-2 text-gray-900 dark:text-zinc-100" {...props} />
  ),
  h4: (props: HeadingProps) => <h4 className="text-lg font-medium pt-5 pb-1" {...props} />,
  p: (props: ParagraphProps) => (
    <p className="text-gray-800 dark:text-zinc-300 leading-relaxed mb-4" {...props} />
  ),
  ol: (props: ListProps) => (
    <ol className="list-decimal pl-5 space-y-2 text-gray-800 dark:text-zinc-300" {...props} />
  ),
  ul: (props: ListProps) => (
    <ul className="list-disc pl-5 space-y-1 text-gray-800 dark:text-zinc-300" {...props} />
  ),
  li: (props: ListItemProps) => <li className="pl-1" {...props} />,
  em: (props: ComponentPropsWithoutRef<"em">) => <em className="italic" {...props} />,
  strong: (props: ComponentPropsWithoutRef<"strong">) => (
    <strong className="font-semibold" {...props} />
  ),
  a: ({ href, children, ...props }: AnchorProps) => {
    const className = "text-blue-600 hover:underline dark:text-blue-400 dark:hover:text-blue-300";
    if (href?.startsWith("/")) {
      return (
        <Link href={href} className={className} {...props}>
          {children}
        </Link>
      );
    }
    if (href?.startsWith("#")) {
      return (
        <a href={href} className={className} {...props}>
          {children}
        </a>
      );
    }
    return (
      <a href={href} target="_blank" rel="noopener noreferrer" className={className} {...props}>
        {children}
      </a>
    );
  },

  code: CodeBlock,

  blockquote: (props: BlockquoteProps) => (
    <blockquote
      className="ml-2 border-l-4 border-gray-400 pl-4 italic text-gray-700 dark:border-zinc-500 dark:text-zinc-300"
      {...props}
    />
  ),

  table: (props: ComponentPropsWithoutRef<"table">) => (
    <table
      className="w-full table-auto border-collapse border border-zinc-300 dark:border-zinc-700 my-4"
      {...props}
    />
  ),
  thead: (props: ComponentPropsWithoutRef<"thead">) => (
    <thead className="bg-zinc-200 dark:bg-zinc-800" {...props} />
  ),
  tbody: (props: ComponentPropsWithoutRef<"tbody">) => <tbody {...props} />,
  tr: (props: ComponentPropsWithoutRef<"tr">) => (
    <tr className="border-t border-zinc-300 dark:border-zinc-700" {...props} />
  ),
  th: (props: ComponentPropsWithoutRef<"th">) => (
    <th
      className="p-2 text-left font-semibold text-sm text-zinc-700 dark:text-zinc-200"
      {...props}
    />
  ),
  td: (props: ComponentPropsWithoutRef<"td">) => (
    <td className="p-2 text-sm text-zinc-600 dark:text-zinc-300" {...props} />
  ),
};

declare global {
  type MDXProvidedComponents = typeof components;
}

export function useMDXComponents(): MDXProvidedComponents {
  return components;
}
