// Base64 Encoder / Decoder
type Mode = "encode" | "decode";
type TabKey = "text" | "file";

type FileInfo = {
  name: string;
  size: number;
  type: string;
};

// Case Converter
type CaseMode =
  | "upper"
  | "lower"
  | "title"
  | "sentence"
  | "camel"
  | "pascal"
  | "snake"
  | "kebab"
  | "constant"
  | "capitalized"
  | "alternating"
  | "invert";

type PipelineToggle =
  | "trim"
  | "collapseSpaces"
  | "removePunctuation"
  | "normalizeQuotes"
  | "removeDiacritics";

// slugify
type DelimiterChar = "-" | "_" | "";
type DelimiterKey = "dash" | "underscore" | "none";

type Options = {
  delimiter: DelimiterChar;
  lowercase: boolean;
  trim: boolean;
  transliterate: boolean;
  collapse: boolean;
  preserveUnderscore: boolean;
  keepNumbers: boolean;
  maxLen: number;
  stopwords: string[];
  customMap: Record<string, string>;
};

// word counter
type DensityRow = { word: string; count: number; percent: number };
