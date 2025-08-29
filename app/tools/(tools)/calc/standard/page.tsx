'use client';

import { CalcButton } from '@/components/calculators/calc-button';
import { Display } from '@/components/calculators/display';
import SectionHeader from '@/components/root/section-header';
import { MotionGlassCard } from '@/components/ui/glass-card';
import { safeEval } from '@/lib/safe-eval';
import { Delete, Divide, Equal, Repeat, X } from 'lucide-react';
import { useEffect, useState } from 'react';

export default function StandardCalculatorPage() {
  const [expr, setExpr] = useState('');
  const [ans, setAns] = useState<string>('');

  // live preview
  useEffect(() => {
    const v = safeEval(expr);
    setAns(v == null ? '' : String(v));
  }, [expr]);

  const push = (t: string) => setExpr((e) => e + t);
  const clear = () => {
    setExpr('');
    setAns('');
  };
  const back = () => setExpr((e) => e.slice(0, -1));
  const equal = () => {
    const v = safeEval(expr);
    if (v == null) return;
    setExpr(String(v));
    setAns('');
  };

  // keyboard support
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const k = e.key;
      if (/^[0-9.+\-*/() ]$/.test(k)) setExpr((x) => x + k);
      else if (k === 'Enter') equal();
      else if (k === 'Backspace') back();
      else if (k.toLowerCase() === 'c') clear();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  return (
    <div className="container mx-auto max-w-xl px-4 py-10">
      <SectionHeader title="Standard Calculator" desc="Basic arithmetic with keyboard support and live preview." />

      <MotionGlassCard className="p-4">
        <div className="grid grid-cols-4 gap-3">
          <Display value={expr || '0'} hint={ans ? `= ${ans}` : ''} />

          <CalcButton onClick={clear} variantIntent="danger" className="col-span-2">
            <Repeat className="mr-2 h-4 w-4" />
            AC
          </CalcButton>
          <CalcButton onClick={back}>
            <Delete className="mr-2 h-4 w-4" />
            DEL
          </CalcButton>
          <CalcButton onClick={() => push('/')} variantIntent="accent">
            <Divide className="h-4 w-4" />
          </CalcButton>

          {['7', '8', '9', '*', '4', '5', '6', '-', '1', '2', '3', '+', '0', '.', '(', ')'].map((t, i) => (
            <CalcButton key={i} onClick={() => push(t)} variantIntent={['*', '-', '+'].includes(t) ? 'accent' : 'ghost'}>
              {t === '*' ? <X className="h-4 w-4" /> : t}
            </CalcButton>
          ))}

          <CalcButton className="col-span-4" variantIntent="primary" onClick={equal}>
            <Equal className="mr-2 h-4 w-4" /> Equals
          </CalcButton>
        </div>
      </MotionGlassCard>
    </div>
  );
}
