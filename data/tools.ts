import {
  Braces,
  Calculator,
  ClipboardList,
  Clock,
  Globe,
  ImageIcon,
  LinkIcon,
  Map as MapIcon,
  Settings2,
  Type,
  Wallet,
  Wrench,
} from "lucide-react";

export const ToolsData = [
  {
    title: "Tools",
    url: "/tools",
    icon: Settings2,
    isActive: true,
    items: [
      {
        title: "All Tools",
        url: "/tools",
        description: "Browse and search all available tools",
        popular: true,
      },
    ],
  },
  {
    title: "URL",
    url: "/tools/url",
    icon: LinkIcon,
    isActive: true,
    items: [
      {
        title: "URL Shortener",
        url: "/tools/url/shortener",
        description:
          "Create short, custom URLs with analytics. Free link shortener with QR codes, click tracking, and custom slugs. Perfect for social media, marketing campaigns, and link management.",
        popular: true,
      },
      {
        title: "UTM Builder",
        url: "/tools/url/utm-builder",
        description:
          "Build campaign tracking URLs with UTM parameters for Google Analytics. Generate utm_source, utm_medium, utm_campaign, utm_term, and utm_content tags to track your marketing performance.",
        popular: false,
      },
      {
        title: "Link Expander",
        url: "/tools/url/expand",
        description:
          "Unshorten URLs and reveal the destination of shortened links safely. Check where bit.ly, tinyurl, and other short links lead before clicking. Preview redirects and inspect link safety.",
        popular: false,
      },
      {
        title: "QR Code Generator",
        url: "/tools/url/qr",
        description:
          "Create custom QR codes from URLs, text, contact info, WiFi credentials, and more. Download as PNG, SVG, or PDF. Customize colors, add logos, and generate high-resolution QR codes for free.",
        popular: true,
      },
    ],
  },
  {
    title: "Text",
    url: "/tools/text",
    icon: Type,
    isActive: true,
    items: [
      {
        title: "Base64 Encoder/Decoder",
        url: "/tools/text/base64",
        description:
          "Encode and decode Base64 strings and files online. Convert text, images, or any file to Base64 encoding. Free Base64 converter with support for UTF-8, ASCII, and binary data.",
        popular: false,
      },
      {
        title: "Case Converter",
        url: "/tools/text/case-converter",
        description:
          "Convert text to uppercase, lowercase, title case, sentence case, camelCase, snake_case, kebab-case, and more. Transform text formatting instantly for programming, writing, and data processing.",
        popular: false,
      },
      {
        title: "Slugify Text",
        url: "/tools/text/slugify",
        description:
          "Convert text into SEO-friendly URL slugs. Generate clean, lowercase, hyphenated slugs from any text. Perfect for creating blog URLs, file names, and web-safe identifiers.",
        popular: false,
      },
      {
        title: "Word Counter",
        url: "/tools/text/word-counter",
        description:
          "Count words, characters, sentences, paragraphs, and reading time instantly. Free online word counter with character count, keyword density, and readability analysis. Perfect for writers, students, and SEO.",
        popular: true,
      },
      {
        title: "Line Tools",
        url: "/tools/text/line-tools",
        description:
          "Sort, deduplicate, trim, and manipulate text lines. Remove duplicate lines, sort alphabetically, add line numbers, find and replace across multiple lines. Bulk text processing made easy.",
        popular: false,
      },
      {
        title: "Text Cleaner",
        url: "/tools/text/cleaner",
        description:
          "Remove extra spaces, line breaks, HTML tags, emojis, and special characters from text. Clean and format text for databases, CSV files, and data processing. Bulk text cleanup tool.",
        popular: false,
      },
      {
        title: "Text to List",
        url: "/tools/text/to-list",
        description:
          "Convert comma-separated or newline-separated text into formatted lists. Split text by delimiters, clean entries, and export as array, JSON, or CSV. Text to list converter.",
        popular: false,
      },
      {
        title: "Password Strength Checker",
        url: "/tools/text/password-strength",
        description:
          "Check password strength and security score. Analyze password entropy, detect weak passwords, and get suggestions for creating strong, secure passwords. Free password strength tester.",
        popular: false,
      },
    ],
  },
  // {
  //   title: "PDF",
  //   url: "/tools/pdf",
  //   icon: FileText,
  //   isActive: true,
  //   items: [
  //     {
  //       title: "PDF Merge",
  //       url: "/tools/pdf/merge",
  //       description: "Combine multiple PDF files into one",
  //       popular: true,
  //     },
  //     {
  //       title: "PDF Split",
  //       url: "/tools/pdf/split",
  //       description: "Split PDFs into individual pages",
  //       popular: false,
  //     },
  //     {
  //       title: "PDF Compress",
  //       url: "/tools/pdf/compress",
  //       description: "Reduce PDF file size while keeping quality",
  //       popular: true,
  //     },
  //     {
  //       title: "PDF to Word",
  //       url: "/tools/pdf/pdf-to-word",
  //       description: "Convert PDF documents into editable Word",
  //       popular: false,
  //     },
  //     {
  //       title: "Image To PDF",
  //       url: "/tools/pdf/image-pdf",
  //       description: "Images to PDF and PDF pages to images",
  //       popular: false,
  //     },
  //     {
  //       title: "Protect / Unlock",
  //       url: "/tools/pdf/protect",
  //       description: "Add/remove password & permissions",
  //       popular: false,
  //     },
  //     {
  //       title: "Sign & Fill",
  //       url: "/tools/pdf/sign-fill",
  //       description: "Fill forms and add signatures",
  //       popular: false,
  //     },
  //     {
  //       title: "PDF Rotate",
  //       url: "/tools/pdf/rotate",
  //       description: "Rotate selected pages & save",
  //       popular: false,
  //     },
  //   ],
  // },
  {
    title: "Image",
    url: "/tools/image",
    icon: ImageIcon,
    isActive: true,
    items: [
      {
        title: "Image Convert",
        url: "/tools/image/convert",
        description: "Convert between JPG, PNG, WebP, AVIF",
        popular: true,
      },
      {
        title: "Image Resize",
        url: "/tools/image/resize",
        description: "Resize, crop, or scale images easily",
        popular: false,
      },
      // {
      //   title: "EXIF Remove",
      //   url: "/tools/image/exif-remove",
      //   description: "Remove sensitive EXIF metadata from images",
      //   popular: false,
      // },
      // {
      //   title: "Image Compress",
      //   url: "/tools/image/compress",
      //   description: "Shrink images for web & social",
      //   popular: true,
      // },
      // {
      //   title: "Background Remover",
      //   url: "/tools/image/bg-remove",
      //   description: "Erase background (client-side)",
      //   popular: false,
      // },
    ],
  },
  {
    title: "Developer",
    url: "/tools/dev",
    icon: Braces,
    isActive: true,
    items: [
      {
        title: "JSON Formatter",
        url: "/tools/dev/json-formatter",
        description:
          "Format, validate, and beautify JSON data online. JSON pretty printer with syntax highlighting, error detection, minify/compress options. Free JSON formatter and validator for developers.",
        popular: true,
      },
      {
        title: "JWT Decoder",
        url: "/tools/dev/jwt-decode",
        description:
          "Decode and inspect JWT (JSON Web Tokens) safely in your browser. View header, payload, and signature of JWT tokens. Validate token structure and debug authentication issues without sending data to servers.",
        popular: false,
      },
      {
        title: "Regex Tester",
        url: "/tools/dev/regex-tester",
        description:
          "Test and debug regular expressions online with real-time matching. RegEx tester with syntax highlighting, match groups, and test cases. Support for JavaScript, Python, PHP regex patterns.",
        popular: false,
      },
      {
        title: "Hash Generator",
        url: "/tools/dev/hash-generator",
        description:
          "Generate MD5, SHA1, SHA256, SHA512, and other cryptographic hashes online. Hash text, files, and passwords with multiple algorithms. Free hash calculator and checksum generator.",
        popular: true,
      },
      {
        title: "Lorem Ipsum Generator",
        url: "/tools/dev/lorem-ipsum",
        description:
          "Generate Lorem Ipsum placeholder text for design mockups and testing. Create paragraphs, sentences, or words of dummy text. Lorem Ipsum generator with word count control.",
        popular: false,
      },
      {
        title: "Password Generator",
        url: "/tools/dev/password-generator",
        description:
          "Generate strong, random passwords with custom length and character sets. Secure password generator with uppercase, lowercase, numbers, and special characters. Create cryptographically secure passwords.",
        popular: true,
      },
      {
        title: "UUID / NanoID Generator",
        url: "/tools/dev/uuid-nanoid",
        description:
          "Generate unique UUIDs (v4), NanoIDs, and short IDs online. Create universally unique identifiers for databases, APIs, and distributed systems. Bulk UUID generator with copy-to-clipboard.",
        popular: true,
      },
      {
        title: "Timestamp Converter",
        url: "/tools/dev/timestamp-converter",
        description:
          "Convert UNIX timestamps to human-readable dates and vice versa. Timestamp converter supporting milliseconds, seconds, and ISO 8601 formats. Time zone aware date converter.",
        popular: false,
      },
      {
        title: "Color Converter",
        url: "/tools/dev/color-converter",
        description:
          "Convert between HEX, RGB, HSL, and CMYK color formats. Color picker and converter with live preview. Extract colors from images and generate color palettes for web design.",
        popular: false,
      },
      {
        title: "Diff Checker",
        url: "/tools/dev/diff-checker",
        description:
          "Compare two text files and find differences line-by-line. Text diff tool with syntax highlighting for code comparison. Find changes, additions, and deletions between versions.",
        popular: true,
      },
      {
        title: "Markdown Previewer",
        url: "/tools/dev/markdown-previewer",
        description:
          "Preview Markdown syntax and convert to HTML in real-time. Markdown editor with GitHub-flavored markdown support, syntax highlighting, and export options. Live markdown renderer.",
        popular: false,
      },
      {
        title: "Regex Library",
        url: "/tools/dev/regex-library",
        description:
          "Collection of useful regular expression patterns for email, URL, phone, credit card validation, and more. Ready-to-use regex patterns with explanations and test cases.",
        popular: false,
      },
      {
        title: "API Request Tester",
        url: "/tools/dev/api-tester",
        description:
          "Test REST API endpoints without Postman. Send GET, POST, PUT, DELETE requests with custom headers, body, and authentication. Free online API testing tool for developers.",
        popular: true,
      },
      {
        title: "YAML to JSON Converter",
        url: "/tools/dev/yaml-json",
        description:
          "Convert YAML to JSON and JSON to YAML online. YAML parser and converter with syntax validation and formatting. Perfect for configuration files and data transformation.",
        popular: false,
      },
      {
        title: "CSV to JSON Converter",
        url: "/tools/dev/csv-json",
        description:
          "Convert CSV files to JSON format with automatic header detection. Transform tabular data to JSON arrays or objects. Supports custom delimiters and bulk CSV processing.",
        popular: false,
      },
      {
        title: "Number Base Converter",
        url: "/tools/dev/base-converter",
        description:
          "Convert numbers between binary, octal, decimal, and hexadecimal bases. Base converter with support for negative numbers and fractional values. Programmer's calculator for number systems.",
        popular: false,
      },
    ],
  },
  {
    title: "SEO",
    url: "/tools/seo",
    icon: Globe,
    isActive: true,
    items: [
      {
        title: "OG Image Builder",
        url: "/tools/seo/og-builder",
        description:
          "Create custom Open Graph images for social media sharing. Design OG images for Facebook, Twitter, LinkedIn previews. Free social media card generator with templates and customization.",
        popular: false,
      },
      {
        title: "Open Graph Preview",
        url: "/tools/seo/og-preview",
        description:
          "Preview how URLs appear on Facebook, Twitter, LinkedIn, and Slack. Test Open Graph and Twitter Card meta tags. Check social media link previews before sharing.",
        popular: false,
      },
      {
        title: "robots.txt Generator",
        url: "/tools/seo/robots-generator",
        description:
          "Generate robots.txt files for SEO and search engine crawling control. Create robots.txt with custom user-agent rules, disallow patterns, and sitemap references. Free robots.txt builder.",
        popular: false,
      },
      {
        title: "Meta Tags Generator",
        url: "/tools/seo/meta-generator",
        description:
          "Generate SEO meta tags for HTML head section. Create title, description, Open Graph, Twitter Cards, canonical tags with live preview. Free meta tag generator for better search rankings.",
        popular: true,
      },
      {
        title: "Sitemap.xml Generator",
        url: "/tools/seo/sitemap-generator",
        description:
          "Create XML sitemaps from URL lists for search engines. Generate sitemaps for Google, Bing, and other search engines. Add priority, change frequency, and last modified dates. Free sitemap builder.",
        popular: false,
      },
      {
        title: "Schema Markup Generator",
        url: "/tools/seo/schema-generator",
        description:
          "Generate JSON-LD structured data for rich snippets. Create schema markup for Articles, Products, Organizations, LocalBusiness, FAQ, and more. Improve SEO with structured data.",
        popular: false,
      },
    ],
  },
  {
    title: "Calculators",
    url: "/tools/calc",
    icon: Calculator,
    isActive: true,
    items: [
      {
        title: "BMI Calculator",
        url: "/tools/calc/bmi",
        description:
          "Calculate Body Mass Index (BMI) instantly from height and weight. Free BMI calculator with health category classification. Check if you're underweight, normal, overweight, or obese based on WHO standards.",
        popular: true,
      },
      {
        title: "Unit Converter",
        url: "/tools/calc/unit-converter",
        description:
          "Convert units of length, weight, temperature, volume, area, speed, time, and more. Free online unit converter with support for metric, imperial, and US customary units.",
        popular: false,
      },
      {
        title: "Date Difference Calculator",
        url: "/tools/calc/date-diff",
        description:
          "Calculate days, weeks, months, and years between two dates. Find the exact time difference between dates with business days calculation. Free date calculator for planning and scheduling.",
        popular: false,
      },
      {
        title: "Standard Calculator",
        url: "/tools/calc/standard",
        description:
          "Free online calculator for basic arithmetic operations. Add, subtract, multiply, divide with keyboard support. Simple calculator for everyday math and quick calculations.",
        popular: false,
      },
      {
        title: "Scientific Calculator",
        url: "/tools/calc/scientific",
        description:
          "Advanced scientific calculator with trigonometric, logarithmic, and exponential functions. Calculate sin, cos, tan, log, square root, and more. Free online scientific calculator for students and engineers.",
        popular: false,
      },
      {
        title: "Percentage Calculator",
        url: "/tools/calc/percentage",
        description:
          "Calculate percentages, percentage increase/decrease, and percentage change. Find X% of Y, calculate tips, discounts, and markups. Free percentage calculator with multiple modes.",
        popular: false,
      },
      {
        title: "Loan EMI Calculator",
        url: "/tools/calc/emi",
        description:
          "Calculate monthly EMI payments for home loans, car loans, and personal loans. EMI calculator with interest rate, loan amount, tenure, and amortization schedule. Plan your loan repayment effectively.",
        popular: true,
      },
      {
        title: "Currency Converter",
        url: "/tools/calc/currency",
        description:
          "Convert currencies with live exchange rates. Real-time currency converter for 150+ currencies including USD, EUR, GBP, JPY, INR. Free forex calculator for international money exchange.",
        popular: true,
      },
      {
        title: "Tip Calculator & Bill Splitter",
        url: "/tools/calc/tip-split",
        description:
          "Calculate tips and split bills among friends. Tip calculator with percentage options (10%, 15%, 20%, custom). Free bill splitter for restaurants and group dining.",
        popular: false,
      },
      {
        title: "Discount Calculator",
        url: "/tools/calc/discount",
        description:
          "Calculate discounted prices and savings from original price. Find final price after discount, percentage off, and amount saved. Free discount calculator for shopping and sales.",
        popular: false,
      },
    ],
  },
  {
    title: "Date & Time",
    url: "/tools/time",
    icon: Clock,
    isActive: true,
    items: [
      {
        title: "Time Zone Converter",
        url: "/tools/time/timezone",
        description:
          "Convert time between different time zones worldwide. World clock and time zone calculator for scheduling international meetings. Compare times across multiple cities and countries.",
        popular: true,
      },
      {
        title: "Age Calculator",
        url: "/tools/time/age",
        description:
          "Calculate exact age in years, months, weeks, days, hours from date of birth. Free age calculator with next birthday countdown. Find your age down to the second.",
        popular: false,
      },
      {
        title: "Countdown Timer",
        url: "/tools/time/countdown",
        description:
          "Online countdown timer for events, meetings, and Pomodoro technique. Customizable timer with alarm sound. Track time remaining for deadlines and important dates.",
        popular: false,
      },
      {
        title: "Week Number Calculator",
        url: "/tools/time/weekno",
        description:
          "Find ISO week number for any date. Week number calculator with date range display. Useful for project planning and scheduling with week-based calendars.",
        popular: false,
      },
    ],
  },
  {
    title: "Utilities",
    url: "/tools/util",
    icon: Wrench,
    isActive: true,
    items: [
      {
        title: "Clipboard Cleaner",
        url: "/tools/util/clipboard-cleaner",
        description:
          "Remove formatting from copied text and paste as plain text. Strip HTML, Rich Text formatting, and hidden characters. Clean clipboard content for emails and documents.",
        popular: false,
      },
      {
        title: "Random Picker",
        url: "/tools/util/random-picker",
        description:
          "Pick random winners from a list of names. Random name picker for contests, giveaways, and decision making. Fair and unbiased random selection tool.",
        popular: false,
      },
      {
        title: "ID Generator",
        url: "/tools/util/id-generator",
        description:
          "Generate unique readable order IDs, reference numbers, and short identifiers. Create human-friendly IDs for orders, tickets, and tracking numbers.",
        popular: false,
      },
      {
        title: "Pomodoro Timer",
        url: "/tools/util/pomodoro",
        description:
          "Pomodoro technique timer with 25-minute work sessions and 5-minute breaks. Productivity timer with sound notifications to boost focus and prevent burnout.",
        popular: false,
      },
      {
        title: "Unit Price Comparator",
        url: "/tools/util/unit-price",
        description:
          "Compare unit prices to find the best value. Calculate price per unit, ounce, kilogram, or liter. Smart shopping tool to compare product sizes and save money.",
        popular: false,
      },
    ],
  },
  {
    title: "Office",
    url: "/tools/office",
    icon: ClipboardList,
    isActive: true,
    items: [
      {
        title: "Invoice Generator",
        url: "/tools/office/invoice",
        description:
          "Create professional invoices online for free. Simple invoice generator with customizable templates. Add items, calculate totals, and download as PDF. No signup required.",
        popular: true,
      },
      {
        title: "To-Do List (Offline)",
        url: "/tools/office/todo",
        description:
          "Private offline to-do list that works without internet. Local task manager with no signup or cloud sync. Your tasks stay on your device for complete privacy.",
        popular: false,
      },
      {
        title: "Meeting Notes Template",
        url: "/tools/office/meeting-notes",
        description:
          "Take structured meeting notes with timestamps and action items. Meeting minutes template for recording discussions, decisions, and next steps. Export notes as text or PDF.",
        popular: false,
      },
    ],
  },
  {
    title: "Travel",
    url: "/tools/travel",
    icon: MapIcon,
    isActive: true,
    items: [
      {
        title: "Distance Calculator",
        url: "/tools/travel/distance",
        description:
          "Calculate distance and estimated travel time between cities on a map. Interactive distance calculator with driving, walking, and straight-line distance. Plan your trips and routes.",
        popular: false,
      },
      {
        title: "Travel Packing Checklist",
        url: "/tools/travel/packing",
        description:
          "Smart packing list generator for trips. Customizable travel checklist based on destination, duration, and season. Never forget essential items when traveling.",
        popular: false,
      },
    ],
  },
  {
    title: "Finance",
    url: "/tools/finance",
    icon: Wallet,
    isActive: true,
    items: [
      {
        title: "Savings Goal Calculator",
        url: "/tools/finance/savings-goal",
        description:
          "Calculate how much to save monthly to reach your financial goals. Savings calculator with compound interest and target date. Plan your savings strategy effectively.",
        popular: false,
      },
      {
        title: "GST/VAT Calculator",
        url: "/tools/finance/vat",
        description:
          "Add or remove GST/VAT from prices. Tax calculator for sales tax, VAT, GST with custom rates. Calculate inclusive and exclusive tax amounts instantly.",
        popular: false,
      },
      {
        title: "Salary to Hourly Converter",
        url: "/tools/finance/salary-hourly",
        description:
          "Convert annual salary to hourly rate and vice versa. Salary calculator with work hours, overtime, and take-home pay estimation. Compare job offers and negotiate better.",
        popular: false,
      },
    ],
  },
];
