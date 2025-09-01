// Base64 Encoder / Decoder
type Mode = 'encode' | 'decode';
type TabKey = 'text' | 'file';

type FileInfo = {
  name: string;
  size: number;
  type: string;
};

// Case Converter
type CaseMode = 'upper' | 'lower' | 'title' | 'sentence' | 'camel' | 'pascal' | 'snake' | 'kebab' | 'constant' | 'capitalized' | 'alternating' | 'invert';

type PipelineToggle = 'trim' | 'collapseSpaces' | 'removePunctuation' | 'normalizeQuotes' | 'removeDiacritics';
