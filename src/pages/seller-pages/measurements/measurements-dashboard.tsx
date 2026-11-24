import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  AlertTriangle,
  CalendarClock,
  ChevronRight,
  ClipboardList,
  NotebookPen,
  Plus,
  Ruler,
  Scissors,
  Search,
  Users,
} from "lucide-react";
import { ClipLoader } from "react-spinners";
import {
  useDebounced,
  useMeasurementClients,
  useMeasurementList,
  useMeasurementStats,
  useMeasurementTemplates,
} from "../../../hooks/use-measurements";
import type { Gender, GarmentTemplate, MeasurementTemplates } from "../../../types/measurement";
import { garmentLabel, optionLabel, relativeDate, unitSymbol } from "../../../types/measurement";
import { ClientAvatar, DueChip, GenderPill } from "../../../components/seller/measurements/ui";
import { selectClass } from "../../../components/seller/measurements/styles";

type Tab = "clients" | "records";

// Every garment across both genders, de-duplicated by value for the filter.
function allGarments(t: MeasurementTemplates | null, gender: string): GarmentTemplate[] {
  if (!t) return [];
  const pool = gender ? t.garments[gender as Gender] : [...t.garments.FEMALE, ...t.garments.MALE];
  const seen = new Set<string>();
  return pool.filter((g) => (seen.has(g.value) ? false : (seen.add(g.value), true)));
}

export default function MeasurementsDashboard() {
  const { templates } = useMeasurementTemplates();
  const stats = useMeasurementStats();
  const [tab, setTab] = useState<Tab>("clients");
  const [search, setSearch] = useState("");
  const [gender, setGender] = useState("");
  const [garmentType, setGarmentType] = useState("");
  const debouncedSearch = useDebounced(search.trim());

  const s = stats.data;
  const isEmpty = stats.loaded && s?.totalMeasurements === 0 && s.totalClients === 0;
  const garmentOptions = useMemo(() => allGarments(templates, gender), [templates, gender]);

  const statCards = [
    { label: "Clients", value: s?.totalClients, icon: Users, tint: "bg-[#FDF1F7] text-[#ED1280]" },
    { label: "Measurements", value: s?.totalMeasurements, icon: ClipboardList, tint: "bg-indigo-50 text-indigo-600" },
    { label: "This month", value: s?.thisMonth, icon: Ruler, tint: "bg-emerald-50 text-emerald-600" },
    { label: "Due in 7 days", value: s?.dueSoon.length, icon: CalendarClock, tint: "bg-amber-50 text-amber-600" },
  ];

  return (
    <div>
      {/* Hero */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#ED1280] via-[#C2106E] to-[#6B0F45] text-white p-6 sm:p-8 mb-6">
        <Scissors className="absolute -right-6 -bottom-8 w-44 h-44 text-white/10 rotate-[-20deg]" strokeWidth={1.5} />
        <Ruler className="absolute right-28 -top-6 w-28 h-28 text-white/10 rotate-[30deg] hidden sm:block" strokeWidth={1.5} />
        <div className="relative flex flex-col sm:flex-row sm:items-end sm:justify-between gap-5">
          <div>
            <p className="text-[12px] font-semibold uppercase tracking-[0.15em] text-white/70 mb-2">
              Measurement Book
            </p>
            <h1 className="text-2xl sm:text-3xl font-semibold leading-tight mb-2">
              Every client's measurements,
              <br className="hidden sm:block" /> always in your pocket.
            </h1>
            <p className="text-sm text-white/80 max-w-md">
              Take measurements, save them per client and pull them up any time, with no lost notebooks.
            </p>
          </div>
          <Link
            to="/seller/measurements/new"
            className="inline-flex items-center justify-center gap-2 bg-white text-[#ED1280] font-semibold px-5 py-3 rounded-full text-sm hover:bg-white/90 transition-colors shrink-0 shadow-lg shadow-black/10"
          >
            <Plus className="w-4 h-4" strokeWidth={2.5} />
            New measurement
          </Link>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {statCards.map(({ label, value, icon: Icon, tint }) => (
          <div key={label} className="bg-white rounded-2xl shadow-sm p-4">
            <span className={`w-9 h-9 rounded-full flex items-center justify-center mb-3 ${tint}`}>
              <Icon className="w-4 h-4" strokeWidth={2} />
            </span>
            <p className="text-2xl font-bold text-[#121212]">{value ?? "–"}</p>
            <p className="text-[12px] text-[#65799A]">{label}</p>
          </div>
        ))}
      </div>

      {isEmpty ? (
        <EmptyBook templates={templates} />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Book */}
          <div className="lg:col-span-2 min-w-0">
            <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
              <div className="inline-flex items-center gap-1 bg-[#F2E8ED] rounded-full p-1">
                {(["clients", "records"] as Tab[]).map((t) => (
                  <button
                    key={t}
                    onClick={() => setTab(t)}
                    className={`px-4 py-2 rounded-full text-[13px] font-semibold transition-colors ${
                      tab === t ? "bg-[#ED1280] text-white" : "text-[#4a4a4a] hover:text-[#121212]"
                    }`}
                  >
                    {t === "clients" ? "Clients" : "All measurements"}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 mb-4">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-[#95959D] absolute left-3.5 top-1/2 -translate-y-1/2" strokeWidth={2} />
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search by client name or phone"
                  className={`${selectClass} pl-10`}
                />
              </div>
              <select
                value={gender}
                onChange={(e) => {
                  setGender(e.target.value);
                  setGarmentType("");
                }}
                className={`${selectClass} sm:w-36`}
              >
                <option value="">All genders</option>
                {templates?.genders.map((g) => (
                  <option key={g.value} value={g.value}>
                    {g.label}
                  </option>
                ))}
              </select>
              {tab === "records" && (
                <select
                  value={garmentType}
                  onChange={(e) => setGarmentType(e.target.value)}
                  className={`${selectClass} sm:w-48`}
                >
                  <option value="">All outfits</option>
                  {garmentOptions.map((g) => (
                    <option key={g.value} value={g.value}>
                      {g.label}
                    </option>
                  ))}
                </select>
              )}
            </div>

            {tab === "clients" ? (
              <ClientList search={debouncedSearch} gender={gender} templates={templates} />
            ) : (
              <RecordList search={debouncedSearch} gender={gender} garmentType={garmentType} templates={templates} />
            )}
          </div>

          {/* Side rail */}
          <div className="flex flex-col gap-6">
            <div className="bg-white rounded-2xl shadow-sm p-5">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-sm font-semibold text-[#121212]">Due this week</h2>
                <CalendarClock className="w-4 h-4 text-[#ED1280]" strokeWidth={2} />
              </div>
              {(s?.overdueLast30Days ?? 0) > 0 && (
                <p className="flex items-center gap-2 text-[12px] text-red-700 bg-red-50 rounded-xl px-3 py-2 mb-3">
                  <AlertTriangle className="w-3.5 h-3.5 shrink-0" strokeWidth={2} />
                  {s!.overdueLast30Days} outfit{s!.overdueLast30Days === 1 ? " is" : "s are"} past due
                </p>
              )}
              {!stats.loaded ? (
                <div className="flex justify-center py-6">
                  <ClipLoader size={20} color="#ED1280" />
                </div>
              ) : !s || s.dueSoon.length === 0 ? (
                <p className="text-[13px] text-[#65799A]">
                  Nothing due in the next 7 days. Add a due date when you take a measurement and it'll show here.
                </p>
              ) : (
                <div className="flex flex-col gap-2">
                  {s.dueSoon.map((m) => (
                    <Link
                      key={m.id}
                      to={`/seller/measurements/${m.id}`}
                      className="flex items-center gap-3 rounded-xl p-2 -mx-2 hover:bg-[#F7F2F4] transition-colors"
                    >
                      {m.client && <ClientAvatar name={m.client.name} gender={m.client.gender} size="sm" />}
                      <div className="flex-1 min-w-0">
                        <p className="text-[13px] font-semibold text-[#121212] truncate">{m.client?.name}</p>
                        <p className="text-[11px] text-[#65799A] truncate">
                          {garmentLabel(templates, m.client?.gender, m.garmentType)}
                          {m.occasion && ` · ${m.occasion}`}
                        </p>
                      </div>
                      {m.dueDate && <DueChip date={m.dueDate} />}
                    </Link>
                  ))}
                </div>
              )}
            </div>

            {s && s.byGarment.length > 0 && (
              <div className="bg-white rounded-2xl shadow-sm p-5">
                <h2 className="text-sm font-semibold text-[#121212] mb-4">What you make most</h2>
                <div className="flex flex-col gap-3">
                  {s.byGarment.slice(0, 5).map((g) => (
                    <div key={g.garmentType}>
                      <div className="flex justify-between text-[12px] mb-1">
                        <span className="text-[#333333] font-medium">{garmentLabel(templates, undefined, g.garmentType)}</span>
                        <span className="text-[#65799A]">{g.count}</span>
                      </div>
                      <div className="h-1.5 rounded-full bg-[#F2E8ED] overflow-hidden">
                        <div
                          className="h-full rounded-full bg-[#ED1280]"
                          style={{ width: `${(g.count / s.byGarment[0].count) * 100}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function ClientList({
  search,
  gender,
  templates,
}: {
  search: string;
  gender: string;
  templates: MeasurementTemplates | null;
}) {
  const { data, lastData, loaded, error } = useMeasurementClients(search, gender);
  const clients = data ?? lastData;

  if (!clients && !loaded) return <ListLoader />;
  if (error) return <ListMessage text={error} />;
  if (!clients || clients.length === 0)
    return <ListMessage text={search || gender ? "No clients match your search." : "No clients yet."} />;

  return (
    <div className="bg-white rounded-2xl shadow-sm divide-y divide-[#F2E8ED] overflow-hidden">
      {clients.map((c) => (
        <Link
          key={c.id}
          to={`/seller/measurements/clients/${c.id}`}
          className="flex items-center gap-3 p-4 hover:bg-[#FCF8FA] transition-colors"
        >
          <ClientAvatar name={c.name} gender={c.gender} />
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <p className="text-[14px] font-semibold text-[#121212] truncate">{c.name}</p>
              <GenderPill gender={c.gender} label={optionLabel(templates?.genders, c.gender)} />
            </div>
            <p className="text-[12px] text-[#65799A] truncate">
              {c.phone ? `${c.phone} · ` : ""}
              {c.measurementCount} measurement{c.measurementCount === 1 ? "" : "s"}
              {c.lastMeasuredAt && c.lastGarmentType &&
                ` · last: ${garmentLabel(templates, c.gender, c.lastGarmentType)}, ${relativeDate(c.lastMeasuredAt)}`}
            </p>
          </div>
          <ChevronRight className="w-4 h-4 text-[#95959D] shrink-0" strokeWidth={2} />
        </Link>
      ))}
    </div>
  );
}

function RecordList({
  search,
  gender,
  garmentType,
  templates,
}: {
  search: string;
  gender: string;
  garmentType: string;
  templates: MeasurementTemplates | null;
}) {
  const { data, lastData, loaded, error } = useMeasurementList({ search, gender, garmentType });
  const records = data ?? lastData;

  if (!records && !loaded) return <ListLoader />;
  if (error) return <ListMessage text={error} />;
  if (!records || records.length === 0) return <ListMessage text="No measurements match these filters." />;

  return (
    <div className="bg-white rounded-2xl shadow-sm divide-y divide-[#F2E8ED] overflow-hidden">
      {records.map((m) => (
        <Link
          key={m.id}
          to={`/seller/measurements/${m.id}`}
          className="flex items-center gap-3 p-4 hover:bg-[#FCF8FA] transition-colors"
        >
          <span className="w-11 h-11 rounded-xl bg-[#F2E8ED] flex items-center justify-center shrink-0">
            <NotebookPen className="w-5 h-5 text-[#ED1280]" strokeWidth={2} />
          </span>
          <div className="flex-1 min-w-0">
            <p className="text-[14px] font-semibold text-[#121212] truncate">
              {garmentLabel(templates, m.client?.gender, m.garmentType)}
              <span className="font-normal text-[#65799A]"> · {m.client?.name}</span>
            </p>
            <p className="text-[12px] text-[#65799A] truncate">
              {Object.keys(m.values).length} measurements in {unitSymbol(templates, m.unit)} · {optionLabel(templates?.fits, m.fit)} ·{" "}
              {relativeDate(m.createdAt)}
            </p>
          </div>
          {m.dueDate && (
            <span className="hidden sm:inline-flex">
              <DueChip date={m.dueDate} />
            </span>
          )}
          <ChevronRight className="w-4 h-4 text-[#95959D] shrink-0" strokeWidth={2} />
        </Link>
      ))}
    </div>
  );
}

const ListLoader = () => (
  <div className="bg-white rounded-2xl shadow-sm flex justify-center py-14">
    <ClipLoader size={24} color="#ED1280" />
  </div>
);

const ListMessage = ({ text }: { text: string }) => (
  <div className="bg-white rounded-2xl shadow-sm py-14 px-6 text-center text-sm text-[#65799A]">{text}</div>
);

function EmptyBook({ templates }: { templates: MeasurementTemplates | null }) {
  // Example outfits pulled from the API templates.
  const examples = templates
    ? [...new Set([...templates.garments.FEMALE, ...templates.garments.MALE].map((g) => g.label))].slice(0, 3).join(", ")
    : "";
  const steps = [
    { title: "Pick the client", body: "Add them once with their name, phone and gender. Next time they're one tap away." },
    { title: "Choose the outfit", body: `${examples ? `${examples}... ` : ""}we show only the measurements that outfit needs.` },
    { title: "Measure and save", body: "Fill in what you take. Set a due date and we'll remind you on this page." },
  ];
  return (
    <div className="bg-white rounded-3xl shadow-sm p-8 sm:p-10 text-center">
      <span className="w-16 h-16 rounded-2xl bg-[#FDF1F7] flex items-center justify-center mx-auto mb-5">
        <Ruler className="w-8 h-8 text-[#ED1280]" strokeWidth={2} />
      </span>
      <h2 className="text-xl font-semibold text-[#121212] mb-2">Start your measurement book</h2>
      <p className="text-sm text-[#65799A] max-w-md mx-auto mb-8">
        Record your first client's measurements. It takes about two minutes.
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-left mb-8">
        {steps.map((step, i) => (
          <div key={step.title} className="bg-[#F7F2F4] rounded-2xl p-4">
            <span className="w-7 h-7 rounded-full bg-[#ED1280] text-white text-[12px] font-bold flex items-center justify-center mb-3">
              {i + 1}
            </span>
            <p className="text-[14px] font-semibold text-[#121212] mb-1">{step.title}</p>
            <p className="text-[12px] text-[#65799A]">{step.body}</p>
          </div>
        ))}
      </div>
      <Link
        to="/seller/measurements/new"
        className="inline-flex items-center gap-2 bg-[#ED1280] hover:opacity-90 text-white font-semibold px-6 py-3 rounded-full text-sm transition-opacity"
      >
        <Plus className="w-4 h-4" strokeWidth={2.5} />
        Take first measurement
      </Link>
    </div>
  );
}
