'use client';

import { Button } from '@/components/ui/button';
import { CheckCircle2, Copy } from 'lucide-react';
import * as React from 'react';

export default function CopyUrlButton({ url }: { url: string }) {
  const [copied, setCopied] = React.useState(false);
  return (
    <Button
      type="button"
      className="gap-2"
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(url);
          setCopied(true);
          setTimeout(() => setCopied(false), 1000);
        } catch {}
      }}>
      {copied ? <CheckCircle2 className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
      {copied ? 'Copied' : 'Copy URL'}
    </Button>
  );
}
