import { Braces, Calculator, FileText, Globe, ImageIcon, LinkIcon, Type } from 'lucide-react';

export const ToolsData = [
  {
    title: 'URL',
    url: '/tools/url',
    icon: LinkIcon,
    isActive: true,
    items: [
      {
        title: 'URL Shortener',
        url: '/tools/url/shortener',
        description: 'Shorten links with custom slugs & analytics',
        popular: true,
      },
      {
        title: 'QR (Advanced)',
        url: '/tools/url/qr',
        description: 'Generate customizable QR codes with logos',
        popular: false,
      },
    ],
  },
  {
    title: 'Text',
    url: '/tools/text/qr',
    icon: Type,
    isActive: true,
    items: [
      {
        title: 'QR Code',
        url: '/tools/text/qr',
        description: 'Create QR codes quickly from text or links',
        popular: true,
      },
      {
        title: 'Base64',
        url: '/tools/text/base64',
        description: 'Encode or decode strings & files in Base64',
        popular: false,
      },
      {
        title: 'Case Converter',
        url: '/tools/text/case-converter',
        description: 'Convert text into upper, lower, title case',
        popular: false,
      },
      {
        title: 'Slugify',
        url: '/tools/text/slugify',
        description: 'Create SEO-friendly slugs from text',
        popular: false,
      },
      {
        title: 'Word Counter',
        url: '/tools/text/word-counter',
        description: 'Count words, characters, and lines',
        popular: true,
      },
    ],
  },
  {
    title: 'PDF',
    url: '/tools/pdf/merge',
    icon: FileText,
    isActive: true,
    items: [
      {
        title: 'PDF Merge',
        url: '/tools/pdf/merge',
        description: 'Combine multiple PDF files into one',
        popular: true,
      },
      {
        title: 'PDF Split',
        url: '/tools/pdf/split',
        description: 'Split PDFs into individual pages',
        popular: false,
      },
      {
        title: 'PDF Compress',
        url: '/tools/pdf/compress',
        description: 'Reduce PDF file size while keeping quality',
        popular: true,
      },
      {
        title: 'PDF to Word',
        url: '/tools/pdf/pdf-to-word',
        description: 'Convert PDF documents into editable Word',
        popular: false,
      },
    ],
  },
  {
    title: 'Image',
    url: '/tools/image/convert',
    icon: ImageIcon,
    isActive: true,
    items: [
      {
        title: 'Image Convert',
        url: '/tools/image/convert',
        description: 'Convert between JPG, PNG, WebP, AVIF',
        popular: true,
      },
      {
        title: 'Image Resize',
        url: '/tools/image/resize',
        description: 'Resize, crop, or scale images easily',
        popular: false,
      },
      {
        title: 'EXIF Remove',
        url: '/tools/image/exif-remove',
        description: 'Remove sensitive EXIF metadata from images',
        popular: false,
      },
    ],
  },
  {
    title: 'Developer',
    url: '/tools/dev/json-formatter',
    icon: Braces,
    isActive: true,
    items: [
      {
        title: 'JSON Formatter',
        url: '/tools/dev/json-formatter',
        description: 'Pretty print & validate JSON data',
        popular: true,
      },
      {
        title: 'JWT Decoder',
        url: '/tools/dev/jwt-decode',
        description: 'Decode and inspect JWT tokens safely',
        popular: false,
      },
      {
        title: 'Regex Tester',
        url: '/tools/dev/regex-tester',
        description: 'Test & debug regular expressions online',
        popular: false,
      },
      {
        title: 'Hash Generator',
        url: '/tools/dev/hash-generator',
        description: 'Generate MD5, SHA1, SHA256 and other hashes',
        popular: true,
      },

      {
        title: 'Lorem Ipsum Generator',
        url: '/tools/dev/lorem-ipsum',
        description: 'Generate filler Lorem Ipsum text',
        popular: false,
      },
      {
        title: 'Password Generator',
        url: '/tools/dev/password-generator',
        description: 'Generate secure random passwords',
        popular: true,
      },
      {
        title: 'Base64 Encode/Decode',
        url: '/tools/dev/base64',
        description: 'Encode and decode Base64 strings easily',
        popular: false,
      },
      {
        title: 'UUID / NanoID Generator',
        url: '/tools/dev/uuid-nanoid',
        description: 'Generate unique UUIDs and NanoIDs',
        popular: true,
      },
      {
        title: 'Timestamp Converter',
        url: '/tools/dev/timestamp-converter',
        description: 'Convert UNIX timestamps to human-readable dates',
        popular: false,
      },
      {
        title: 'Color Converter',
        url: '/tools/dev/color-converter',
        description: 'Convert HEX, RGB, HSL color values',
        popular: false,
      },
      {
        title: 'Diff Checker',
        url: '/tools/dev/diff-checker',
        description: 'Compare text and find differences easily',
        popular: true,
      },
      {
        title: 'Markdown Previewer',
        url: '/tools/dev/markdown-previewer',
        description: 'Preview and convert Markdown to HTML',
        popular: false,
      },
      {
        title: 'Regex Library',
        url: '/tools/dev/regex-library',
        description: 'Collection of useful regular expressions',
        popular: false,
      },
      {
        title: 'API Request Tester',
        url: '/tools/dev/api-tester',
        description: 'Test API endpoints (like a mini Postman)',
        popular: true,
      },
    ],
  },
  {
    title: 'SEO',
    url: '/tools/seo/og-builder',
    icon: Globe,
    isActive: true,
    items: [
      {
        title: 'OG Image Builder',
        url: '/tools/seo/og-builder',
        description: 'Create Open Graph images for social media',
        popular: false,
      },
      {
        title: 'robots.txt Generator',
        url: '/tools/seo/robots-generator',
        description: 'Generate robots.txt for SEO optimization',
        popular: false,
      },
    ],
  },
  {
    title: 'Calculators',
    url: '/tools/calc/bmi',
    icon: Calculator,
    isActive: true,
    items: [
      {
        title: 'BMI Calculator',
        url: '/tools/calc/bmi',
        description: 'Calculate Body Mass Index instantly',
        popular: true,
      },
      {
        title: 'Unit Converter',
        url: '/tools/calc/unit-converter',
        description: 'Convert units of length, weight, temp, etc.',
        popular: false,
      },
      {
        title: 'Date Difference',
        url: '/tools/calc/date-diff',
        description: 'Find days between two dates',
        popular: false,
      },
      {
        title: 'Standard Calculator',
        url: '/tools/calc/standard',
        description: 'Basic calculator for everyday math',
        popular: false,
      },
      {
        title: 'Scientific Calculator',
        url: '/tools/calc/scientific',
        description: 'Advanced calculator for science & engineering',
        popular: false,
      },
      {
        title: 'Percentage Calculator',
        url: '/tools/calc/percentage',
        description: 'Quickly calculate percentages',
        popular: false,
      },
    ],
  },
];
