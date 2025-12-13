// url shortener
type RecentItem = { slug: string; url: string; createdAt: number };
type ECC = "L" | "M" | "Q" | "H";

// qr code
type ECL = "L" | "M" | "Q" | "H";
type RenderFormat = "png" | "svg";
type QRKind = "url" | "text" | "wifi" | "vcard" | "email" | "sms" | "whatsapp";
type WifiAuth = "nopass" | "WPA" | "WEP";

type FormState = {
  kind: QRKind;
  url: string;
  text: string;
  wifiSsid: string;
  wifiPassword: string;
  wifiAuth: WifiAuth;
  wifiHidden: boolean;
  vcFirst: string;
  vcLast: string;
  vcOrg: string;
  vcTitle: string;
  vcPhone: string;
  vcEmail: string;
  vcUrl: string;
  emailTo: string;
  emailSubject: string;
  emailBody: string;
  smsTo: string;
  smsBody: string;
  waTo: string;
  waText: string;
};

type ControlValues = {
  kind: QRKind;
  ecl: ECL;
  format: RenderFormat;
  wifiAuth: WifiAuth;
};

// utm builder
type Pair = { id: string; key: string; value: string; enabled: boolean };

type UTMState = {
  source: string;
  medium: string;
  campaign: string;
  term: string;
  content: string;
  id: string;
  custom: Pair[];
};

type OptionsState = {
  keepExisting: boolean;
  encodeParams: boolean;
  lowercaseKeys: boolean;
  prefixCustomWithUTM: boolean;
  batchMode: boolean;
};

type Preset = {
  name: string;
  utm: UTMState;
  options: OptionsState;
};

type HistoryItem = {
  ts: number;
  base: string;
  result: string | string[];
};

// Link Expander
type Hop = {
  index: number;
  url: string;
  status: number;
  statusText: string;
  location?: string | null;
};

type Meta = {
  title?: string;
  description?: string;
  ogTitle?: string;
  ogDescription?: string;
  ogImage?: string;
  finalUrl?: string;
  contentType?: string;
};

type Result = {
  ok: boolean;
  inputUrl: string;
  finalUrl: string;
  totalHops: number;
  hops: Hop[];
  meta?: Meta;
  error?: string;
  startedAt: string;
  ms: number;
};
