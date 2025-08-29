'use client';

export function safeEval(expr: string): number | null {
  try {
    if (!expr.trim()) return 0;
    // Replace display tokens with JS/Math tokens
    let js = expr
      .replace(/π/g, 'Math.PI')
      .replace(/√\(/g, 'Math.sqrt(')
      .replace(/ln\(/g, 'Math.log(')
      .replace(/log\(/g, 'Math.log10(')
      .replace(/sin\(/g, 'Math.sin(')
      .replace(/cos\(/g, 'Math.cos(')
      .replace(/tan\(/g, 'Math.tan(')
      .replace(/\^/g, '**')
      .replace(/e(?![a-zA-Z])/g, 'Math.E');

    // Only allow safe characters
    if (/[^0-9+\-*/().,%\s]|(\*\*){3,}/.test(js)) return null;

    // eslint-disable-next-line no-new-func
    const val = Function(`"use strict"; return (${js})`)();
    return Number.isFinite(val) ? val : null;
  } catch {
    return null;
  }
}
