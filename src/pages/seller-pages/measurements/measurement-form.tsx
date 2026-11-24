import { useMemo, useState } from "react";
import { Link, useNavigate, useParams, useSearchParams } from "react-router-dom";
import { ArrowLeft, Check, ChevronRight, Info, Mars, Search, UserPlus, Users, Venus } from "lucide-react";
import { ClipLoader } from "react-spinners";
import useRequest from "../../../hooks/use-req";
import {
  useDebounced,
  useMeasurementClient,
  useMeasurementClients,
  useMeasurementRecord,
  useMeasurementTemplates,
} from "../../../hooks/use-measurements";
import { useToast } from "../../../context/toast-context";
import type {
  ClientRef,
  FitPreference,
  Gender,
  MeasurementRecord,
  MeasurementTemplates,
  MeasurementUnit,
} from "../../../types/measurement";
import { apiErrorMessage, convertValue, formatNumber, garmentLabel, optionLabel, unitSymbol } from "../../../types/measurement";
import { ClientAvatar, GenderPill } from "../../../components/seller/measurements/ui";
import { inputClass, selectClass } from "../../../components/seller/measurements/styles";

const STEPS = ["Client", "Outfit", "Measure", "Review"];

interface WizardInitial {
  mode: "create" | "edit";
  recordId?: string;
  client: ClientRef | null;
  garmentType: string;
  unit: MeasurementUnit;
  fit: FitPreference | "";
  occasion: string;
  dueDate: string;
  notes: string;
  values: Record<string, string>;
  // Last time's numbers for this client & outfit, shown as hints when re-measuring.
  previous: { values: Record<string, number>; unit: MeasurementUnit; date: string } | null;
}

const toInputDate = (iso: string | null) => (iso ? iso.slice(0, 10) : "");
const toInputValues = (values: Record<string, number>) =>
  Object.fromEntries(Object.entries(values).map(([k, v]) => [k, String(v)]));

// Loads everything the wizard needs (templates, the record being edited, a
// preselected client, or the record being re-measured), then mounts it.
export default function MeasurementForm() {
  const { id } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
  const clientParam = searchParams.get("client") ?? undefined;
  const fromParam = searchParams.get("from") ?? undefined;

  const { templates, error: templatesError } = useMeasurementTemplates();
  const editing = useMeasurementRecord(id);
  const presetClient = useMeasurementClient(id || fromParam ? undefined : clientParam);
  const from = useMeasurementRecord(id ? undefined : fromParam);

  const waiting =
    !templates || (id && !editing.loaded) || (clientParam && !id && !fromParam && !presetClient.loaded) || (fromParam && !id && !from.loaded);

  if (templatesError) return <Centered text={templatesError} />;
  if (waiting) return <Centered loading />;
  if (id && !editing.data) return <Centered text={editing.error || "Measurement not found."} />;

  let initial: WizardInitial;
  if (id && editing.data) {
    const r = editing.data;
    initial = {
      mode: "edit",
      recordId: r.id,
      client: r.client ?? null,
      garmentType: r.garmentType,
      unit: r.unit,
      fit: r.fit,
      occasion: r.occasion ?? "",
      dueDate: toInputDate(r.dueDate),
      notes: r.notes ?? "",
      values: toInputValues(r.values),
      previous: null,
    };
  } else {
    const prev: MeasurementRecord | null = from.data;
    const preset = presetClient.data;
    initial = {
      mode: "create",
      client: prev?.client ?? (preset ? { id: preset.id, name: preset.name, phone: preset.phone, gender: preset.gender } : null),
      garmentType: prev?.garmentType ?? "",
      unit: prev?.unit ?? templates.units[0].value,
      fit: prev?.fit ?? "",
      occasion: "",
      dueDate: "",
      notes: "",
      values: {},
      previous: prev ? { values: prev.values, unit: prev.unit, date: prev.createdAt } : null,
    };
  }

  return <Wizard templates={templates} initial={initial} />;
}

function Wizard({ templates, initial }: { templates: MeasurementTemplates; initial: WizardInitial }) {
  const navigate = useNavigate();
  const toast = useToast();
  const isEdit = initial.mode === "edit";
  const { makeRequest: createReq } = useRequest("/measurements", "POST");
  const { makeRequest: updateReq } = useRequest("/measurements", "PATCH");

  // Edits and preselected clients skip straight to the outfit step.
  const [step, setStep] = useState(initial.client ? 1 : 0);
  const [clientMode, setClientMode] = useState<"existing" | "new">("existing");
  const [client, setClient] = useState<ClientRef | null>(initial.client);
  const [newClient, setNewClient] = useState<{ name: string; phone: string; gender: Gender | "" }>({
    name: "",
    phone: "",
    gender: "",
  });
  const [garmentType, setGarmentType] = useState(initial.garmentType);
  const [unit, setUnit] = useState<MeasurementUnit>(initial.unit);
  const [fit, setFit] = useState<FitPreference | "">(initial.fit);
  const [occasion, setOccasion] = useState(initial.occasion);
  const [dueDate, setDueDate] = useState(initial.dueDate);
  const [notes, setNotes] = useState(initial.notes);
  const [values, setValues] = useState<Record<string, string>>(initial.values);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const gender: Gender | "" = clientMode === "existing" || isEdit ? client?.gender ?? "" : newClient.gender;
  const garments = gender ? templates.garments[gender] : [];
  const garment = garments.find((g) => g.value === garmentType) ?? null;

  // Fields for the chosen outfit, grouped in the API's group order.
  const groupedFields = useMemo(() => {
    if (!garment) return [];
    return templates.groups
      .map((group) => ({
        ...group,
        fields: garment.fields.map((k) => templates.fields[k]).filter((f) => f && f.group === group.value),
      }))
      .filter((g) => g.fields.length > 0);
  }, [garment, templates]);

  const filled = garment ? garment.fields.filter((k) => Number(values[k]) > 0) : [];
  const clientName = clientMode === "existing" || isEdit ? client?.name : newClient.name.trim();

  const selectClient = (c: ClientRef) => {
    setClient(c);
    if (c.gender !== client?.gender) setGarmentType("");
  };

  const chooseGarment = (value: string) => {
    setGarmentType(value);
    const next = garments.find((g) => g.value === value);
    // Keep only numbers that still apply to the new outfit.
    if (next) setValues((v) => Object.fromEntries(Object.entries(v).filter(([k]) => next.fields.includes(k))));
  };

  const validate = (s: number): string => {
    if (s === 0) {
      if (clientMode === "existing" && !client) return "Pick a client, or add a new one.";
      if (clientMode === "new") {
        if (newClient.name.trim().length < 2) return "Enter the client's name.";
        if (!newClient.gender) return "Choose whether you're measuring a male or a female.";
      }
    }
    if (s === 1 && !garment) return "Choose what you're making.";
    if (s === 2 && filled.length === 0) return "Enter at least one measurement.";
    return "";
  };

  const next = () => {
    const message = validate(step);
    setError(message);
    if (!message) setStep((s) => Math.min(s + 1, STEPS.length - 1));
  };

  const back = () => {
    setError("");
    if (step === (isEdit ? 1 : 0)) navigate(-1);
    else setStep((s) => s - 1);
  };

  const save = async () => {
    for (const s of [0, 1, 2]) {
      const message = validate(s);
      if (message) {
        setError(message);
        setStep(s);
        return;
      }
    }
    const numericValues = Object.fromEntries(filled.map((k) => [k, Number(values[k])]));
    const body = {
      garmentType,
      unit,
      ...(fit && { fit }),
      values: numericValues,
      occasion: occasion || undefined,
      dueDate: dueDate || null,
      notes: notes.trim() || undefined,
    };
    setSaving(true);
    const [json, status] = isEdit
      ? await updateReq(body, undefined, initial.recordId)
      : await createReq({
          ...body,
          ...(clientMode === "existing"
            ? { clientId: client!.id }
            : {
                client: {
                  name: newClient.name.trim(),
                  gender: newClient.gender,
                  ...(newClient.phone.trim() && { phone: newClient.phone.trim() }),
                },
              }),
        });
    setSaving(false);
    if (status >= 200 && status < 300 && json?.data?.id) {
      toast.success(isEdit ? "Measurement updated." : "Measurement saved.");
      navigate(`/seller/measurements/${json.data.id}`, { replace: true });
    } else {
      setError(apiErrorMessage(json, "Couldn't save the measurement. Please try again."));
    }
  };

  const visibleSteps = isEdit ? STEPS.slice(1) : STEPS;
  const visibleIndex = isEdit ? step - 1 : step;

  return (
    <div className="max-w-3xl mx-auto">
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-1.5 text-sm text-[#65799A] hover:text-[#121212] mb-6 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" strokeWidth={2} />
        Back
      </button>

      <h1 className="text-2xl font-semibold text-[#121212] mb-1">{isEdit ? "Edit measurement" : "New measurement"}</h1>
      <p className="text-sm text-[#65799A] mb-6">
        {clientName ? `For ${clientName}` : "Four quick steps: who, what, measure, save."}
      </p>

      {/* Stepper */}
      <div className="flex items-center gap-2 mb-6">
        {visibleSteps.map((label, i) => {
          const done = i < visibleIndex;
          const active = i === visibleIndex;
          return (
            <div key={label} className="flex items-center gap-2 flex-1 min-w-0">
              <span
                className={`w-8 h-8 rounded-full flex items-center justify-center text-[12px] font-bold shrink-0 transition-colors ${
                  done ? "bg-[#ED1280] text-white" : active ? "bg-[#FDF1F7] text-[#ED1280] ring-2 ring-[#ED1280]" : "bg-[#F2E8ED] text-[#95959D]"
                }`}
              >
                {done ? <Check className="w-4 h-4" strokeWidth={3} /> : i + 1}
              </span>
              <span className={`text-[13px] font-medium truncate hidden sm:block ${active ? "text-[#121212]" : "text-[#95959D]"}`}>
                {label}
              </span>
              {i < visibleSteps.length - 1 && <span className={`flex-1 h-0.5 rounded-full ${done ? "bg-[#ED1280]" : "bg-[#F2E8ED]"}`} />}
            </div>
          );
        })}
      </div>

      <div className="bg-white rounded-3xl shadow-sm p-5 sm:p-7">
        {step === 0 && (
          <ClientStep
            templates={templates}
            mode={clientMode}
            setMode={(m) => {
              setClientMode(m);
              setError("");
            }}
            client={client}
            onSelect={selectClient}
            newClient={newClient}
            setNewClient={(c) => {
              if (c.gender !== newClient.gender) setGarmentType("");
              setNewClient(c);
            }}
          />
        )}

        {step === 1 && gender && (
          <div>
            <StepTitle title="What are you making?" subtitle="We'll show only the measurements this outfit needs." />
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-7">
              {garments.map((g) => {
                const selected = g.value === garmentType;
                return (
                  <button
                    key={g.value}
                    type="button"
                    onClick={() => chooseGarment(g.value)}
                    className={`relative text-left rounded-2xl border-2 p-4 transition-all ${
                      selected ? "border-[#ED1280] bg-[#FDF1F7]" : "border-[#F2E8ED] hover:border-[#F5B5D5]"
                    }`}
                  >
                    {selected && (
                      <span className="absolute top-2.5 right-2.5 w-5 h-5 rounded-full bg-[#ED1280] flex items-center justify-center">
                        <Check className="w-3 h-3 text-white" strokeWidth={3} />
                      </span>
                    )}
                    <p className="text-[14px] font-semibold text-[#121212] pr-5">{g.label}</p>
                    <p className="text-[11px] text-[#65799A] mt-0.5">{g.fields.length} measurements</p>
                  </button>
                );
              })}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field label="Unit">
                <div className="grid grid-cols-2 gap-1 bg-[#F2E8ED] rounded-xl p-1">
                  {templates.units.map((u) => (
                    <button
                      key={u.value}
                      type="button"
                      onClick={() => setUnit(u.value)}
                      className={`py-2 rounded-lg text-[13px] font-semibold transition-colors ${
                        unit === u.value ? "bg-white text-[#ED1280] shadow-sm" : "text-[#4a4a4a]"
                      }`}
                    >
                      {u.label}
                    </button>
                  ))}
                </div>
              </Field>
              <Field label="Fit preference">
                <select value={fit} onChange={(e) => setFit(e.target.value as FitPreference | "")} className={selectClass}>
                  <option value="">Select fit</option>
                  {templates.fits.map((f) => (
                    <option key={f.value} value={f.value}>
                      {f.label}
                    </option>
                  ))}
                </select>
              </Field>
              <Field label="Occasion" optional>
                <select value={occasion} onChange={(e) => setOccasion(e.target.value)} className={selectClass}>
                  <option value="">Select occasion</option>
                  {occasion && !templates.occasions.includes(occasion) && <option value={occasion}>{occasion}</option>}
                  {templates.occasions.map((o) => (
                    <option key={o} value={o}>
                      {o}
                    </option>
                  ))}
                </select>
              </Field>
              <Field label="Due date" optional>
                <input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} className={inputClass} />
              </Field>
            </div>
          </div>
        )}

        {step === 2 && garment && (
          <div>
            <StepTitle title={`Measure for ${garment.label}`} subtitle={`All values in ${optionLabel(templates.units, unit).toLowerCase()}. Skip anything you don't need.`} />
            <div className="flex items-center gap-3 mb-6">
              <div className="flex-1 h-2 rounded-full bg-[#F2E8ED] overflow-hidden">
                <div
                  className="h-full rounded-full bg-[#ED1280] transition-all duration-300"
                  style={{ width: `${(filled.length / garment.fields.length) * 100}%` }}
                />
              </div>
              <span className="text-[12px] font-semibold text-[#65799A] shrink-0">
                {filled.length} / {garment.fields.length}
              </span>
            </div>

            {initial.previous && (
              <p className="flex items-start gap-2 text-[12px] text-indigo-700 bg-indigo-50 rounded-xl px-3 py-2.5 mb-6">
                <Info className="w-4 h-4 shrink-0 mt-px" strokeWidth={2} />
                Re-measuring: last time's numbers (
                {new Date(initial.previous.date).toLocaleDateString(undefined, { day: "numeric", month: "short", year: "numeric" })}) are
                shown under each box.
              </p>
            )}

            <div className="flex flex-col gap-7">
              {groupedFields.map((group) => (
                <div key={group.value}>
                  <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-[#95959D] mb-3">{group.label}</p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-4">
                    {group.fields.map((f) => {
                      const prev = initial.previous?.values[f.key];
                      return (
                        <div key={f.key}>
                          <label className="block text-[13px] font-semibold text-[#121212]" htmlFor={`m-${f.key}`}>
                            {f.label}
                          </label>
                          <p className="text-[11px] text-[#95959D] mb-1.5">{f.hint}</p>
                          <div className="relative">
                            <input
                              id={`m-${f.key}`}
                              type="number"
                              inputMode="decimal"
                              min={0}
                              step={0.25}
                              value={values[f.key] ?? ""}
                              onChange={(e) => setValues((v) => ({ ...v, [f.key]: e.target.value }))}
                              placeholder="0"
                              className={`${inputClass} pr-12 ${Number(values[f.key]) > 0 ? "border-[#F5B5D5] bg-[#FFFBFD]" : ""}`}
                            />
                            <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[12px] font-semibold text-[#95959D]">
                              {unitSymbol(templates, unit)}
                            </span>
                          </div>
                          {prev !== undefined && initial.previous && (
                            <p className="text-[11px] text-indigo-600 mt-1">
                              Last time: {formatNumber(convertValue(prev, initial.previous.unit, unit))}
                              {unitSymbol(templates, unit)}
                            </p>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-7">
              <Field label="Notes" optional>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={3}
                  placeholder="Fabric, style details, preferences..."
                  className={`${inputClass} resize-none`}
                />
              </Field>
            </div>
          </div>
        )}

        {step === 3 && garment && (
          <div>
            <StepTitle title="Review and save" subtitle="Check everything looks right." />
            <div className="flex items-center gap-3 bg-[#F7F2F4] rounded-2xl p-4 mb-5">
              {gender && clientName && <ClientAvatar name={clientName} gender={gender} />}
              <div className="min-w-0">
                <p className="text-[15px] font-semibold text-[#121212] truncate">{clientName}</p>
                <p className="text-[12px] text-[#65799A]">
                  {garmentLabel(templates, gender || undefined, garmentType)}
                  {fit && ` · ${optionLabel(templates.fits, fit)}`} ·{" "}
                  {optionLabel(templates.units, unit)}
                  {occasion && ` · ${occasion}`}
                  {dueDate && ` · due ${new Date(dueDate).toLocaleDateString(undefined, { day: "numeric", month: "short" })}`}
                </p>
              </div>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {filled.map((k) => (
                <div key={k} className="rounded-xl border border-[#F2E8ED] p-3">
                  <p className="text-[11px] text-[#65799A] truncate">{templates.fields[k]?.label ?? k}</p>
                  <p className="text-lg font-bold text-[#121212]">
                    {formatNumber(Number(values[k]))}
                    <span className="text-[12px] font-medium text-[#95959D] ml-0.5">{unitSymbol(templates, unit)}</span>
                  </p>
                </div>
              ))}
            </div>
            {garment.fields.length > filled.length && (
              <p className="text-[12px] text-[#95959D] mt-3">
                {garment.fields.length - filled.length} measurement{garment.fields.length - filled.length === 1 ? "" : "s"} left
                blank. You can add them later.
              </p>
            )}
            {notes.trim() && <p className="text-[13px] text-[#4a4a4a] bg-[#F7F2F4] rounded-xl p-3 mt-4 whitespace-pre-line">{notes.trim()}</p>}
          </div>
        )}

        {error && <p className="text-[13px] text-rose-500 mt-5">{error}</p>}

        <div className="flex items-center justify-between gap-3 mt-7 pt-5 border-t border-[#F2E8ED]">
          <button
            type="button"
            onClick={back}
            className="px-5 py-2.5 rounded-full text-sm font-semibold text-[#4a4a4a] border border-[#E5E7EB] hover:bg-[#F7F2F4] transition-colors"
          >
            {step === (isEdit ? 1 : 0) ? "Cancel" : "Back"}
          </button>
          {step < STEPS.length - 1 ? (
            <button
              type="button"
              onClick={next}
              className="inline-flex items-center gap-1.5 bg-[#ED1280] hover:opacity-90 text-white font-semibold px-6 py-2.5 rounded-full text-sm transition-opacity"
            >
              Continue
              <ChevronRight className="w-4 h-4" strokeWidth={2.5} />
            </button>
          ) : (
            <button
              type="button"
              onClick={save}
              disabled={saving}
              className="inline-flex items-center gap-1.5 bg-[#ED1280] hover:opacity-90 text-white font-semibold px-6 py-2.5 rounded-full text-sm transition-opacity disabled:opacity-60"
            >
              {saving ? "Saving..." : isEdit ? "Save changes" : "Save measurement"}
              {!saving && <Check className="w-4 h-4" strokeWidth={2.5} />}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function ClientStep({
  templates,
  mode,
  setMode,
  client,
  onSelect,
  newClient,
  setNewClient,
}: {
  templates: MeasurementTemplates;
  mode: "existing" | "new";
  setMode: (m: "existing" | "new") => void;
  client: ClientRef | null;
  onSelect: (c: ClientRef) => void;
  newClient: { name: string; phone: string; gender: Gender | "" };
  setNewClient: (c: { name: string; phone: string; gender: Gender | "" }) => void;
}) {
  const [search, setSearch] = useState("");
  const debounced = useDebounced(search.trim());
  const { data, lastData, loaded } = useMeasurementClients(debounced, "");
  const clients = data ?? lastData ?? [];

  return (
    <div>
      <StepTitle title="Who are you measuring?" subtitle="Pick someone from your client book or add a new client." />
      <div className="grid grid-cols-2 gap-3 mb-6">
        {(
          [
            { value: "existing", label: "Existing client", icon: Users },
            { value: "new", label: "New client", icon: UserPlus },
          ] as const
        ).map(({ value, label, icon: Icon }) => (
          <button
            key={value}
            type="button"
            onClick={() => setMode(value)}
            className={`flex items-center justify-center gap-2 rounded-2xl border-2 py-3 text-[14px] font-semibold transition-colors ${
              mode === value ? "border-[#ED1280] bg-[#FDF1F7] text-[#ED1280]" : "border-[#F2E8ED] text-[#4a4a4a] hover:border-[#F5B5D5]"
            }`}
          >
            <Icon className="w-4 h-4" strokeWidth={2} />
            {label}
          </button>
        ))}
      </div>

      {mode === "existing" ? (
        <div>
          <div className="relative mb-3">
            <Search className="w-4 h-4 text-[#95959D] absolute left-3.5 top-1/2 -translate-y-1/2" strokeWidth={2} />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name or phone"
              className={`${inputClass} pl-10`}
              autoFocus
            />
          </div>
          {!loaded && clients.length === 0 ? (
            <div className="flex justify-center py-8">
              <ClipLoader size={20} color="#ED1280" />
            </div>
          ) : clients.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-[13px] text-[#65799A] mb-3">
                {debounced ? "No client matches that search." : "Your client book is empty."}
              </p>
              <button type="button" onClick={() => setMode("new")} className="text-[13px] font-semibold text-[#ED1280] hover:opacity-80">
                Add a new client →
              </button>
            </div>
          ) : (
            <div className="flex flex-col gap-2 max-h-80 overflow-y-auto -mx-1 px-1">
              {clients.map((c) => {
                const selected = client?.id === c.id;
                return (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => onSelect(c)}
                    className={`flex items-center gap-3 text-left rounded-2xl border-2 p-3 transition-colors ${
                      selected ? "border-[#ED1280] bg-[#FDF1F7]" : "border-[#F2E8ED] hover:border-[#F5B5D5]"
                    }`}
                  >
                    <ClientAvatar name={c.name} gender={c.gender} size="sm" />
                    <div className="flex-1 min-w-0">
                      <p className="text-[14px] font-semibold text-[#121212] truncate">{c.name}</p>
                      <p className="text-[12px] text-[#65799A] truncate">
                        {c.phone || "No phone"} · {c.measurementCount} measurement{c.measurementCount === 1 ? "" : "s"}
                      </p>
                    </div>
                    <GenderPill gender={c.gender} label={optionLabel(templates.genders, c.gender)} />
                    {selected && (
                      <span className="w-5 h-5 rounded-full bg-[#ED1280] flex items-center justify-center shrink-0">
                        <Check className="w-3 h-3 text-white" strokeWidth={3} />
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      ) : (
        <div className="flex flex-col gap-5">
          <div>
            <p className="text-[13px] font-semibold text-[#121212] mb-2">Are you measuring a male or a female?</p>
            <div className="grid grid-cols-2 gap-3">
              {templates.genders.map((g) => {
                const selected = newClient.gender === g.value;
                const Icon = g.value === "FEMALE" ? Venus : Mars;
                const tone = g.value === "FEMALE" ? "text-[#ED1280] bg-[#FDE6F1]" : "text-indigo-600 bg-indigo-50";
                return (
                  <button
                    key={g.value}
                    type="button"
                    onClick={() => setNewClient({ ...newClient, gender: g.value })}
                    className={`flex flex-col items-center gap-2 rounded-2xl border-2 py-5 transition-all ${
                      selected ? "border-[#ED1280] bg-[#FDF1F7] scale-[1.02]" : "border-[#F2E8ED] hover:border-[#F5B5D5]"
                    }`}
                  >
                    <span className={`w-12 h-12 rounded-full flex items-center justify-center ${tone}`}>
                      <Icon className="w-6 h-6" strokeWidth={2.5} />
                    </span>
                    <span className="text-[14px] font-semibold text-[#121212]">{g.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Client name">
              <input
                value={newClient.name}
                onChange={(e) => setNewClient({ ...newClient, name: e.target.value })}
                placeholder="e.g. Adaeze Okafor"
                className={inputClass}
              />
            </Field>
            <Field label="Phone number" optional>
              <input
                value={newClient.phone}
                onChange={(e) => setNewClient({ ...newClient, phone: e.target.value })}
                placeholder="e.g. 0803 123 4567"
                inputMode="tel"
                className={inputClass}
              />
            </Field>
          </div>
        </div>
      )}
    </div>
  );
}

function StepTitle({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <div className="mb-5">
      <h2 className="text-lg font-semibold text-[#121212]">{title}</h2>
      <p className="text-[13px] text-[#65799A]">{subtitle}</p>
    </div>
  );
}

function Field({ label, optional, children }: { label: string; optional?: boolean; children: React.ReactNode }) {
  return (
    <div>
      <p className="text-[13px] font-semibold text-[#121212] mb-1.5">
        {label} {optional && <span className="font-normal text-[#95959D]">(optional)</span>}
      </p>
      {children}
    </div>
  );
}

function Centered({ loading, text }: { loading?: boolean; text?: string }) {
  return (
    <div className="max-w-xl mx-auto text-center py-20">
      {loading ? (
        <ClipLoader size={28} color="#ED1280" />
      ) : (
        <>
          <p className="text-[15px] font-semibold text-[#121212] mb-2">{text}</p>
          <Link to="/seller/measurements" className="text-sm font-medium text-[#ED1280] hover:opacity-80">
            Back to measurements
          </Link>
        </>
      )}
    </div>
  );
}
