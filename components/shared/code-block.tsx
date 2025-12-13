"use client";

import { Check, Copy } from "lucide-react";
import { type ComponentPropsWithoutRef, useState } from "react";
import { highlight } from "sugar-high";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import logger from "@/lib/logger";

interface CodeBlockProps extends ComponentPropsWithoutRef<"code"> {
  code: string;
  language?: string;
}

export function CodeBlock({ code, language = "text", ...props }: CodeBlockProps) {
  const highlightedCode = highlight(code);

  return (
    <div className="relative">
      <CopyButton code={code} />
      <pre className="overflow-x-auto text-sm leading-relaxed">
        <code
          className={`language-${language}`}
          dangerouslySetInnerHTML={{ __html: highlightedCode }}
          {...props}
        />
      </pre>
    </div>
  );
}

function CopyButton({ code }: { code: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch (err) {
      logger.error({ err }, "Code copy failed");
    }
  };

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="outline"
            size="icon"
            onClick={handleCopy}
            className="absolute right-3 top-3 h-7 w-7 border bg-white/80 p-0 text-muted-foreground backdrop-blur-sm hover:bg-muted dark:border-zinc-700 dark:bg-zinc-800/70 dark:hover:bg-zinc-700"
          >
            {copied ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
          </Button>
        </TooltipTrigger>
        <TooltipContent>{copied ? "Copied!" : "Copy to clipboard"}</TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
