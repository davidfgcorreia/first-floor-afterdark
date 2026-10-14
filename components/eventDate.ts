import type { Dict } from "@/content/site";

export function when(iso: string, t: Dict) {
  const d = new Date(iso + "T12:00:00");
  return {
    wd: t.weekdays[d.getDay()],
    day: String(d.getDate()).padStart(2, "0"),
    mon: t.months[d.getMonth()],
    year: d.getFullYear(),
  };
}
