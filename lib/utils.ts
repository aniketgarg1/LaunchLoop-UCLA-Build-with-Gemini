import type { BriefInput } from "./types";

export function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export function sanitizeFilename(name: string): string {
  return name.replace(/[^a-zA-Z0-9._-]/g, "_").toLowerCase();
}

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

function formatSingleDate(iso: string): { month: string; day: number; year: number } | null {
  const parts = iso.split("-");
  if (parts.length !== 3) return null;
  return {
    month: MONTHS[parseInt(parts[1], 10) - 1] || parts[1],
    day: parseInt(parts[2], 10),
    year: parseInt(parts[0], 10),
  };
}

function formatTime(time24: string): string {
  const [hStr, mStr] = time24.split(":");
  let h = parseInt(hStr, 10);
  const m = mStr || "00";
  const ampm = h >= 12 ? "PM" : "AM";
  if (h > 12) h -= 12;
  if (h === 0) h = 12;
  return m === "00" ? `${h} ${ampm}` : `${h}:${m} ${ampm}`;
}

export function buildDateLine(brief: BriefInput): string {
  const startIso = brief.eventDate || "";
  const endIso = brief.eventEndDate || "";
  const time = brief.eventTime || "";

  if (!startIso && !endIso) return "TBA";

  const start = formatSingleDate(startIso);
  if (!start) return startIso;

  let line: string;

  if (endIso && endIso !== startIso) {
    const end = formatSingleDate(endIso);
    if (end) {
      if (start.month === end.month && start.year === end.year) {
        line = `${start.month} ${start.day}-${end.day}`;
      } else if (start.year === end.year) {
        line = `${start.month} ${start.day} - ${end.month} ${end.day}`;
      } else {
        line = `${start.month} ${start.day}, ${start.year} - ${end.month} ${end.day}, ${end.year}`;
      }
    } else {
      line = `${start.month} ${start.day}`;
    }
  } else {
    line = `${start.month} ${start.day}`;
  }

  if (time) {
    line += `, ${formatTime(time)}`;
  }

  return line;
}
