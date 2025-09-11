export function buildPayload(f: FormState): string {
  switch (f.kind) {
    case "url": {
      const v = f.url.trim();
      return v || "https://example.com";
    }
    case "text": {
      const v = f.text.trim();
      return v || "Scan me";
    }
    case "wifi": {
      const T = f.wifiAuth;
      const S = escapeSemicolons(f.wifiSsid);
      const isNoPass = f.wifiAuth === "nopass";
      const P = isNoPass ? "" : `P:${escapeSemicolons(f.wifiPassword)};`;
      const H = `H:${f.wifiHidden ? "true" : "false"};`;
      return `WIFI:T:${T === "nopass" ? "nopass" : T};S:${S};${P}${H}`;
    }
    case "vcard": {
      const parts = [
        "BEGIN:VCARD",
        "VERSION:3.0",
        `N:${safe(f.vcLast)};${safe(f.vcFirst)};;;`,
        `FN:${[f.vcFirst, f.vcLast].filter(Boolean).join(" ").trim()}`,
        f.vcOrg ? `ORG:${safe(f.vcOrg)}` : "",
        f.vcTitle ? `TITLE:${safe(f.vcTitle)}` : "",
        f.vcPhone ? `TEL:${safe(f.vcPhone)}` : "",
        f.vcEmail ? `EMAIL:${safe(f.vcEmail)}` : "",
        f.vcUrl ? `URL:${safe(f.vcUrl)}` : "",
        "END:VCARD",
      ].filter(Boolean);
      return parts.join("\n");
    }
    case "email": {
      const to = encodeURIComponent(f.emailTo.trim() || "hello@example.com");
      const subject = encodeURIComponent(f.emailSubject || "");
      const body = encodeURIComponent(f.emailBody || "");
      const qs = new URLSearchParams();
      if (subject) qs.set("subject", subject);
      if (body) qs.set("body", body);
      return `mailto:${to}${qs.toString() ? `?${qs.toString()}` : ""}`;
    }
    case "sms": {
      const to = (f.smsTo || "").trim();
      const body = encodeURIComponent(f.smsBody || "");
      return `sms:${to}${body ? `?body=${body}` : ""}`;
    }
    case "whatsapp": {
      const to = (f.waTo || "").replace(/[^\d]/g, "");
      const text = encodeURIComponent(f.waText || "");
      const base = `https://wa.me/${to || "000"}`;
      return text ? `${base}?text=${text}` : base;
    }
    default:
      return "Scan me";
  }
}

export function escapeSemicolons(v: string) {
  return v.replace(/;/g, "\\;");
}

export function safe(v: string) {
  return v.replace(/\n/g, " ").trim();
}
