import { Braces, Calculator, FileText, Globe, ImageIcon, LinkIcon, Type } from 'lucide-react';

export const ToolsData = [
  {
    title: 'Url',
    url: '/tools/url',
    icon: LinkIcon,
    isActive: true,
    items: [
      { title: 'URL Shortener', url: '/tools/url/shortener' },
      { title: 'QR (Advanced)', url: '/tools/url/qr' },
    ],
  },
  {
    title: 'Text',
    url: '/tools/text/qr',
    icon: Type,
    isActive: true,
    items: [
      { title: 'QR Code', url: '/tools/text/qr' },
      { title: 'Base64', url: '/tools/text/base64' },
      { title: 'Case Converter', url: '/tools/text/case-converter' },
      { title: 'Slugify', url: '/tools/text/slugify' },
      { title: 'Word Counter', url: '/tools/text/word-counter' },
    ],
  },
  {
    title: 'PDF',
    url: '/tools/pdf/merge',
    icon: FileText,
    isActive: true,
    items: [
      { title: 'PDF Merge', url: '/tools/pdf/merge' },
      { title: 'PDF Split', url: '/tools/pdf/split' },
      { title: 'PDF Compress', url: '/tools/pdf/compress' },
      { title: 'PDF to Word', url: '/tools/pdf/pdf-to-word' },
    ],
  },
  {
    title: 'Image',
    url: '/tools/image/convert',
    icon: ImageIcon,
    isActive: true,
    items: [
      { title: 'Image Convert', url: '/tools/image/convert' },
      { title: 'Image Resize', url: '/tools/image/resize' },
      { title: 'EXIF Remove', url: '/tools/image/exif-remove' },
    ],
  },
  {
    title: 'Developer',
    url: '/tools/dev/json-formatter',
    icon: Braces,
    isActive: true,
    items: [
      { title: 'JSON Formatter', url: '/tools/dev/json-formatter' },
      { title: 'JWT Decoder', url: '/tools/dev/jwt-decode' },
      { title: 'Regex Tester', url: '/tools/dev/regex-tester' },
    ],
  },
  {
    title: 'SEO',
    url: '/tools/seo/og-builder',
    icon: Globe,
    isActive: true,
    items: [
      { title: 'OG Image Builder', url: '/tools/seo/og-builder' },
      { title: 'robots.txt Generator', url: '/tools/seo/robots-generator' },
    ],
  },
  {
    title: 'Calculators',
    url: '/tools/calc/bmi',
    icon: Calculator,
    isActive: true,
    items: [
      { title: 'BMI Calculator', url: '/tools/calc/bmi' },
      { title: 'Unit Converter', url: '/tools/calc/unit-converter' },
      { title: 'Date Difference', url: '/tools/calc/date-diff' },
      { title: 'Standard Calculator', url: '/tools/calc/standard' },
      { title: 'Scientific Calculator', url: '/tools/calc/scientific' },
      { title: 'Percentage Calculator', url: '/tools/calc/percentage' },
    ],
  },
];
