// url shortener
type ECC = 'L' | 'M' | 'Q' | 'H';

// qr code
type ECL = 'L' | 'M' | 'Q' | 'H';
type RenderFormat = 'png' | 'svg';
type QRKind = 'url' | 'text' | 'wifi' | 'vcard' | 'email' | 'sms' | 'whatsapp';
type WifiAuth = 'nopass' | 'WPA' | 'WEP';

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
