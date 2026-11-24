// Shapes for /measurements. The templates (garments, fields, dropdown
// options) come from GET /measurements/templates — nothing is hardcoded here.
export type Gender = "MALE" | "FEMALE";
export type MeasurementUnit = "INCH" | "CM";
export type FitPreference = "SLIM" | "REGULAR" | "LOOSE";

export interface Option<T extends string = string> {
  value: T;
  label: string;
}

export interface MeasurementFieldDef {
  key: string;
  label: string;
  group: string;
  hint: string;
}

export interface GarmentTemplate {
  value: string;
  label: string;
  fields: string[];
}

export interface MeasurementTemplates {
  fields: Record<string, MeasurementFieldDef>;
  garments: Record<Gender, GarmentTemplate[]>;
  groups: Option[];
  genders: Option<Gender>[];
  units: (Option<MeasurementUnit> & { symbol?: string })[];
  fits: Option<FitPreference>[];
  occasions: string[];
}

export interface ClientRef {
  id: string;
  name: string;
  phone: string | null;
  gender: Gender;
}

export interface MeasurementRecord {
  id: string;
  clientId: string;
  garmentType: string;
  unit: MeasurementUnit;
  fit: FitPreference;
  values: Record<string, number>;
  occasion: string | null;
  dueDate: string | null;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
  client?: ClientRef;
}

export interface ClientSummary extends ClientRef {
  notes: string | null;
  createdAt: string;
  updatedAt: string;
  measurementCount: number;
  lastMeasuredAt: string | null;
  lastGarmentType: string | null;
}

export interface ClientDetail extends ClientRef {
  notes: string | null;
  createdAt: string;
  measurements: MeasurementRecord[];
}

export interface MeasurementStats {
  totalClients: number;
  totalMeasurements: number;
  thisMonth: number;
  overdueLast30Days: number;
  dueSoon: MeasurementRecord[];
  byGarment: { garmentType: string; count: number }[];
}

// ---------- helpers ----------

export function garmentLabel(t: MeasurementTemplates | null, gender: Gender | undefined, value: string) {
  if (!t) return value;
  const pool = gender ? t.garments[gender] : [...t.garments.FEMALE, ...t.garments.MALE];
  return pool.find((g) => g.value === value)?.label ?? value;
}

export const optionLabel = <T extends string>(options: Option<T>[] | undefined, value: T) =>
  options?.find((o) => o.value === value)?.label ?? value;

// Short unit symbol from the API ("in", "cm"), falling back to its label.
export const unitSymbol = (t: MeasurementTemplates | null, unit: MeasurementUnit) => {
  const option = t?.units.find((u) => u.value === unit);
  return option?.symbol ?? option?.label ?? "";
};

// The API's 422 carries a per-field `errors` map; show the first one.
export function apiErrorMessage(json: { message?: string; errors?: Record<string, string> } | undefined, fallback: string) {
  const first = json?.errors ? Object.values(json.errors)[0] : undefined;
  return first || json?.message || fallback;
}

// Display-only conversion; the record keeps the unit it was taken in.
export function convertValue(value: number, from: MeasurementUnit, to: MeasurementUnit) {
  if (from === to) return value;
  return from === "INCH" ? value * 2.54 : value / 2.54;
}

export const formatNumber = (n: number) => String(Math.round(n * 10) / 10);

export const initials = (name: string) =>
  name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((p) => p.charAt(0).toUpperCase())
    .join("");

const DAY_MS = 24 * 60 * 60 * 1000;

// "Today", "Tomorrow", "In 3 days", "2 days overdue"
export function dueLabel(iso: string) {
  const due = new Date(iso);
  const today = new Date();
  const a = Date.UTC(due.getUTCFullYear(), due.getUTCMonth(), due.getUTCDate());
  const b = Date.UTC(today.getFullYear(), today.getMonth(), today.getDate());
  const days = Math.round((a - b) / DAY_MS);
  if (days === 0) return { text: "Due today", tone: "urgent" as const };
  if (days === 1) return { text: "Due tomorrow", tone: "urgent" as const };
  if (days > 1) return { text: `Due in ${days} days`, tone: days <= 7 ? ("soon" as const) : ("later" as const) };
  return { text: `${-days} day${days === -1 ? "" : "s"} overdue`, tone: "overdue" as const };
}

export const DUE_TONE_CLASS = {
  urgent: "bg-rose-50 text-rose-600",
  soon: "bg-amber-50 text-amber-700",
  later: "bg-stone-100 text-stone-600",
  overdue: "bg-red-100 text-red-700",
};

export function relativeDate(iso: string) {
  const days = Math.floor((Date.now() - new Date(iso).getTime()) / DAY_MS);
  if (days <= 0) return "today";
  if (days === 1) return "yesterday";
  if (days < 30) return `${days} days ago`;
  return new Date(iso).toLocaleDateString(undefined, { day: "numeric", month: "short", year: "numeric" });
}

export const GENDER_STYLE: Record<Gender, { avatar: string; pill: string }> = {
  FEMALE: { avatar: "bg-[#FDE6F1] text-[#ED1280]", pill: "bg-[#FDF1F7] text-[#ED1280]" },
  MALE: { avatar: "bg-indigo-50 text-indigo-600", pill: "bg-indigo-50 text-indigo-600" },
};
