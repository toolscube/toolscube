import { pad } from "@/lib/utils";

export const msIn = {
  second: 1000,
  minute: 60 * 1000,
  hour: 60 * 60 * 1000,
  day: 24 * 60 * 60 * 1000,
};

export function diffYMD(from: Date, to: Date) {
  if (to < from) return { years: 0, months: 0, days: 0 };
  const a = new Date(from.getTime());
  let years = 0,
    months = 0,
    days = 0;

  while (true) {
    const next = new Date(a);
    next.setFullYear(next.getFullYear() + 1);
    if (next <= to) {
      a.setFullYear(a.getFullYear() + 1);
      years++;
    } else break;
  }

  while (true) {
    const next = new Date(a);
    next.setMonth(next.getMonth() + 1);
    if (next <= to) {
      a.setMonth(a.getMonth() + 1);
      months++;
    } else break;
  }

  while (true) {
    const next = new Date(a.getTime() + msIn.day);
    if (next <= to) {
      a.setDate(a.getDate() + 1);
      days++;
    } else break;
  }
  return { years, months, days };
}

export function clampDateString(s: string) {
  const m = /^([0-9]{4})-([0-9]{2})-([0-9]{2})$/.exec(s);
  if (!m) return s;
  const y = Math.max(1, Math.min(275760, Number(m[1])));
  const mm = Math.max(1, Math.min(12, Number(m[2])));
  const daysInMonth = new Date(y, mm, 0).getDate();
  const dd = Math.max(1, Math.min(daysInMonth, Number(m[3])));
  return `${pad(y, 4)}-${pad(mm)}-${pad(dd)}`;
}

export function nextBirthday(fromDob: Date, now: Date) {
  const y = now.getFullYear();
  const candidate = new Date(
    y,
    fromDob.getMonth(),
    fromDob.getDate(),
    fromDob.getHours(),
    fromDob.getMinutes(),
    0,
    0,
  );
  if (candidate < now) {
    candidate.setFullYear(y + 1);
  }
  return candidate;
}

export function shortDate(d: Date, timeZone?: string) {
  return new Intl.DateTimeFormat("en-GB", {
    timeZone,
    year: "numeric",
    month: "short",
    day: "2-digit",
    weekday: "short",
  }).format(d);
}
