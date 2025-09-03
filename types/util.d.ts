type CleanOptions = {
  trim: boolean;
  collapseSpaces: boolean;
  stripLineBreaks: boolean;
  stripExtraBlankLines: boolean;
  normalizeQuotes: boolean;
  normalizeDashes: boolean;
  replaceEllipsis: boolean;
  tabsToSpaces: boolean;
  removeZeroWidth: boolean;
  removeUrls: boolean;
  removeEmojis: boolean;

  caseMode: "none" | "lower" | "upper" | "title" | "sentence";
  autoCleanOnPaste: boolean;
};
