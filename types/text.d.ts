// Base64 Encoder / Decoder
type Mode = 'encode' | 'decode';
type TabKey = 'text' | 'file';

type FileInfo = {
  name: string;
  size: number;
  type: string;
};
