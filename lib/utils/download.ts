export function downloadBlob(filename: string, blob: Blob) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

export function downloadText(filename: string, text: string, mime = 'text/plain;charset=utf-8;') {
  const blob = new Blob([text], { type: mime });
  downloadBlob(filename, blob);
}

export function downloadFromUrl(filename: string, url: string) {
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
}

export function csvDownload(filename: string, rows: (string | number)[][]) {
  const content = rows.map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(',')).join('\n');
  downloadText(filename, content, 'text/csv;charset=utf-8;');
}
