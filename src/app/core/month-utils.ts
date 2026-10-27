const MONTH_MAP: Record<string, string> = {
  'janvier': 'Janvier',
  'février': 'Fevrier',
  'fevrier': 'Fevrier',
  'mars': 'Mars',
  'avril': 'Avril',
  'mai': 'Mai',
  'juin': 'Juin',
  'juillet': 'Juillet',
  'août': 'Aout',
  'aout': 'Aout',
  'septembre': 'Septembre',
  'octobre': 'Octobre',
  'novembre': 'Novembre',
  'décembre': 'Decembre',
  'decembre': 'Decembre',
};

const MONTHS_ORDERED = [
  'Janvier', 'Fevrier', 'Mars', 'Avril', 'Mai', 'Juin',
  'Juillet', 'Aout', 'Septembre', 'Octobre', 'Novembre', 'Decembre'
];

export function toMonthKey(month: string, year: number): string {
  const normalized = MONTH_MAP[month.toLowerCase()] ?? month;
  return `${normalized}${year}`;
}

export function parseMonthKey(key: string): { month: string; year: number } | null {
  for (const m of MONTHS_ORDERED) {
    if (key.startsWith(m)) {
      const year = parseInt(key.substring(m.length), 10);
      if (!isNaN(year)) return { month: m, year };
    }
  }
  return null;
}

export function navigateMonth(key: string, delta: number): string {
  const parsed = parseMonthKey(key);
  if (!parsed) return key;
  let idx = MONTHS_ORDERED.indexOf(parsed.month) + delta;
  let year = parsed.year;
  if (idx < 0) { idx = 11; year--; }
  if (idx > 11) { idx = 0; year++; }
  return `${MONTHS_ORDERED[idx]}${year}`;
}

export function currentMonthKey(): string {
  const now = new Date();
  return `${MONTHS_ORDERED[now.getMonth()]}${now.getFullYear()}`;
}

export function monthKeyToLabel(key: string): string {
  const parsed = parseMonthKey(key);
  if (!parsed) return key;
  const DISPLAY: Record<string, string> = {
    Janvier: 'Janvier', Fevrier: 'Février', Mars: 'Mars', Avril: 'Avril',
    Mai: 'Mai', Juin: 'Juin', Juillet: 'Juillet', Aout: 'Août',
    Septembre: 'Septembre', Octobre: 'Octobre', Novembre: 'Novembre', Decembre: 'Décembre'
  };
  return `${DISPLAY[parsed.month] ?? parsed.month} ${parsed.year}`;
}
