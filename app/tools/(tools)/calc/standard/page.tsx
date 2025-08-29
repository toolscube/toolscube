'use client';

import { CalcButton } from '@/components/calculators/calc-button';
import { Display } from '@/components/calculators/display';
import SectionHeader from '@/components/root/section-header';
import { MotionGlassCard } from '@/components/ui/glass-card';
import { safeEval } from '@/lib/safe-eval';
import { Calculator, Delete, Divide, Equal, Eraser, FunctionSquare, Percent, X } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState } from 'react';

export default function StandardCalculatorPage() {
  const [expr, setExpr] = useState('');
  const [ans, setAns] = useState<string>('');
  const [lastAns, setLastAns] = useState<string>('');

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
    setLastAns(String(v));
    setAns('');
  };

  // keyboard support
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const k = e.key;
      if (/^[0-9.+\-*/()% ]$/.test(k)) setExpr((x) => x + k);
      else if (k === 'Enter') equal();
      else if (k === 'Backspace') back();
      else if (k.toLowerCase() === 'c') clear();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  return (
    <div className="container mx-auto max-w-3xl px-4 py-10">
      <SectionHeader title="Standard Calculator" desc="Basic arithmetic with glass UI, keyboard support, and live preview." />

      {/* Quick nav */}
      <div className="mb-3 flex flex-wrap gap-2">
        <Link href="/tools/calc/standard">
          <CalcButton variantIntent="primary" className="px-3">
            <Calculator className="mr-2 h-4 w-4" />
            Standard
          </CalcButton>
        </Link>
        <Link href="/tools/calc/scientific">
          <CalcButton variantIntent="ghost" className="px-3">
            <FunctionSquare className="mr-2 h-4 w-4" />
            Scientific
          </CalcButton>
        </Link>
        <Link href="/tools/calc/percentage">
          <CalcButton variantIntent="ghost" className="px-3">
            <Percent className="mr-2 h-4 w-4" />
            Percentage
          </CalcButton>
        </Link>
      </div>

      <MotionGlassCard className="p-4">
        <div className="grid grid-cols-4 gap-3">
          <Display value={expr || '0'} hint={ans ? `= ${ans}` : ''} />

          {/* Top row */}
          <CalcButton onClick={clear} variantIntent="danger" className="col-span-2">
            <Eraser className="mr-2 h-4 w-4" />
            AC
          </CalcButton>
          <CalcButton onClick={back} variantIntent="accent">
            <Delete className="mr-2 h-4 w-4" />
            DEL
          </CalcButton>
          <CalcButton onClick={() => push('/')} variantIntent="accent">
            <Divide className="h-4 w-4" />
          </CalcButton>

          {/* Digits & ops grid */}
          {['7', '8', '9', '*', '4', '5', '6', '-', '1', '2', '3', '+', '0', '.', '(', ')'].map((t, i) => (
            <CalcButton key={i} onClick={() => push(t)} variantIntent={['*', '-', '+'].includes(t) ? 'accent' : 'ghost'}>
              {t === '*' ? <X className="h-4 w-4" /> : t}
            </CalcButton>
          ))}

          {/* Bottom row */}
          <CalcButton onClick={() => push('%')} variantIntent="ghost">
            %
          </CalcButton>
          <CalcButton onClick={() => push('ANS')} variantIntent="ghost" onDoubleClick={() => push(lastAns)}>
            ANS
          </CalcButton>
          <CalcButton className="col-span-2" variantIntent="primary" onClick={equal}>
            <Equal className="mr-2 h-4 w-4" />
            Equals
          </CalcButton>
        </div>
      </MotionGlassCard>
    </div>
  );
}
