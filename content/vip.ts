// VIP tables and bookable nights. Zones, tables, prices and availability are
// PLACEHOLDERS until the club supplies its real floor plan and price list.
import { events, nights, type Locale } from "./site";

type L = Record<Locale, string>;

export type Table = { id: string; pax: number; min: number };
export type Zone = { id: string; name: L; included: L; image: string; tables: Table[] };
export type TableStatus = "available" | "last" | "soldout";

export const zones: Zone[] = [
  {
    id: "dj",
    name: { pt: "DJ Booth VIP", en: "DJ Booth VIP" },
    included: { pt: "2 garrafas + sparklers + anfitrião", en: "2 bottles + sparklers + host" },
    image: "/img/hq/dj-magenta.webp",
    tables: [
      { id: "D1", pax: 10, min: 600 },
      { id: "D2", pax: 10, min: 500 },
    ],
  },
  {
    id: "pista",
    name: { pt: "Pista", en: "Dance floor" },
    included: { pt: "1 garrafa + sparklers", en: "1 bottle + sparklers" },
    image: "/img/hq/lasers-crowd.webp",
    tables: [1, 2, 3, 4].map((n) => ({ id: `P${n}`, pax: 8, min: 300 })),
  },
  {
    id: "lounge",
    name: { pt: "Lounge", en: "Lounge" },
    included: { pt: "1 garrafa + mixers", en: "1 bottle + mixers" },
    image: "/img/hq/bar-neon.webp",
    tables: [1, 2, 3, 4].map((n) => ({ id: `L${n}`, pax: 6, min: 200 })),
  },
  {
    id: "bar",
    name: { pt: "Bar", en: "Bar" },
    included: { pt: "Garrafa à escolha", en: "Bottle of your choice" },
    image: "/img/hq/golden-lights.webp",
    tables: [1, 2, 3, 4].map((n) => ({ id: `B${n}`, pax: 4, min: 120 })),
  },
];

export const iso = (d: Date) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;

export type VipNight = {
  date: string;
  title: string;
  subtitle?: L;
  special: boolean;
  image: string;
  open: string;
  close: string;
  lineup: string[];
  from: number;
};

function hash(s: string) {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) h = Math.imul(h ^ s.charCodeAt(i), 16777619);
  return (h >>> 0) / 4294967295;
}

/** Deterministic placeholder availability; specials sell out faster. */
export function tableStatus(date: string, tableId: string, special: boolean): TableStatus {
  const r = hash(`${date}:${tableId}`);
  if (r < (special ? 0.45 : 0.2)) return "soldout";
  if (r < (special ? 0.6 : 0.3)) return "last";
  return "available";
}

const cheapest = (date: string, special: boolean) =>
  Math.min(...zones.flatMap((z) => z.tables.filter((t) => tableStatus(date, t.id, special) !== "soldout").map((t) => t.min)), 9999);

/** One bookable night for a date (special event or weekly night), or null if closed. */
export function vipNight(date: string): VipNight | null {
  const d = new Date(date + "T12:00:00");
  if (Number.isNaN(d.getTime())) return null;
  const ev = events.find((e) => e.date === date);
  const weekly = nights[d.getDay() - 2]; // Tue(2)…Sat(6)
  if (!ev && !weekly) return null;
  const special = !!ev && !ev.recurring;
  return {
    date,
    title: ev?.title ?? weekly!.name,
    subtitle: ev?.subtitle ?? weekly?.blurb,
    special,
    image: ev?.image ?? weekly!.image,
    open: ev?.open ?? "23:00",
    close: ev?.close ?? (d.getDay() <= 3 ? "03:00" : "04:00"),
    lineup: ev?.lineup ?? ["André Salgueiro"],
    from: cheapest(date, special),
  };
}

/** Every open night (Tue–Sat) from `start` for `weeks` weeks, plus any events beyond. */
export function vipNights(start: Date, weeks = 10): VipNight[] {
  const out: VipNight[] = [];
  const d = new Date(start);
  d.setHours(12, 0, 0, 0);
  const end = new Date(d);
  end.setDate(end.getDate() + weeks * 7);
  for (; d <= end; d.setDate(d.getDate() + 1)) {
    const n = vipNight(iso(d));
    if (n) out.push(n);
  }
  for (const e of events) {
    if (e.date > iso(end)) {
      const n = vipNight(e.date);
      if (n) out.push(n);
    }
  }
  return out;
}
