import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Copy, MessageCircle, Pencil, Printer, RotateCcw, Trash2 } from "lucide-react";
import { ClipLoader } from "react-spinners";
import useRequest from "../../../hooks/use-req";
import { useMeasurementRecord, useMeasurementTemplates } from "../../../hooks/use-measurements";
import { useToast } from "../../../context/toast-context";
import type { MeasurementRecord, MeasurementTemplates, MeasurementUnit } from "../../../types/measurement";
import { apiErrorMessage, convertValue, formatNumber, garmentLabel, optionLabel, unitSymbol } from "../../../types/measurement";
import { ClientAvatar, ConfirmModal, DueChip, GenderPill } from "../../../components/seller/measurements/ui";

const longDate = (iso: string) =>
  new Date(iso).toLocaleDateString(undefined, { day: "numeric", month: "long", year: "numeric" });

// Plain-text version for WhatsApp / clipboard.
function shareText(r: MeasurementRecord, t: MeasurementTemplates, unit: MeasurementUnit) {
  const lines = [
    `${r.client?.name ?? "Client"}: ${garmentLabel(t, r.client?.gender, r.garmentType)}`,
    `${optionLabel(t.fits, r.fit)} · ${optionLabel(t.units, unit).toLowerCase()}`,
    "",
    ...Object.entries(r.values).map(
      ([k, v]) => `${t.fields[k]?.label ?? k}: ${formatNumber(convertValue(v, r.unit, unit))}${unitSymbol(t, unit)}`
    ),
  ];
  if (r.notes) lines.push("", `Notes: ${r.notes}`);
  lines.push("", `Recorded ${longDate(r.createdAt)}`);
  return lines.join("\n");
}

export default function MeasurementDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const toast = useToast();
  const { templates } = useMeasurementTemplates();
  const { data: record, loaded, error } = useMeasurementRecord(id);
  const { makeRequest: deleteReq } = useRequest("/measurements", "DELETE");
  const [viewUnit, setViewUnit] = useState<MeasurementUnit | null>(null);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);

  if (!loaded || !templates) {
    return (
      <div className="flex justify-center py-20">
        <ClipLoader size={28} color="#ED1280" />
      </div>
    );
  }

  if (!record) {
    return (
      <div className="max-w-xl mx-auto text-center py-16">
        <p className="text-lg font-semibold text-[#121212] mb-2">{error || "Measurement not found"}</p>
        <Link to="/seller/measurements" className="text-[#ED1280] font-medium hover:opacity-80">
          Back to measurements
        </Link>
      </div>
    );
  }

  const unit = viewUnit ?? record.unit;
  const client = record.client;
  const title = garmentLabel(templates, client?.gender, record.garmentType);

  // Group the recorded values using the API's field groups.
  const groups = templates.groups
    .map((g) => ({
      ...g,
      entries: Object.entries(record.values).filter(([k]) => (templates.fields[k]?.group ?? "") === g.value),
    }))
    .filter((g) => g.entries.length > 0);
  const ungrouped = Object.entries(record.values).filter(([k]) => !templates.fields[k]);
  if (ungrouped.length) groups.push({ value: "OTHER", label: "Other", entries: ungrouped });

  const text = shareText(record, templates, unit);
  const whatsappHref = `https://wa.me/?text=${encodeURIComponent(text)}`;

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success("Measurements copied.");
    } catch {
      toast.error("Couldn't copy. Please try again.");
    }
  };

  const remove = async () => {
    setDeleting(true);
    const [json, status] = await deleteReq(undefined, undefined, record.id);
    setDeleting(false);
    if (status >= 200 && status < 300) {
      toast.success("Measurement deleted.");
      navigate(client ? `/seller/measurements/clients/${client.id}` : "/seller/measurements", { replace: true });
    } else {
      setConfirmDelete(false);
      toast.error(apiErrorMessage(json, "Couldn't delete. Please try again."));
    }
  };

  const actionBtn =
    "inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full text-[13px] font-semibold border border-[#E7E1E4] text-[#4a4a4a] hover:bg-[#F7F2F4] transition-colors";

  return (
    <div className="max-w-3xl mx-auto">
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-1.5 text-sm text-[#65799A] hover:text-[#121212] mb-6 transition-colors print:hidden"
      >
        <ArrowLeft className="w-4 h-4" strokeWidth={2} />
        Back
      </button>

      {/* Header card */}
      <div className="bg-white rounded-3xl shadow-sm p-6 mb-6">
        <div className="flex flex-col sm:flex-row sm:items-start gap-4">
          {client && <ClientAvatar name={client.name} gender={client.gender} size="lg" />}
          <div className="flex-1 min-w-0">
            <p className="text-[12px] font-semibold uppercase tracking-[0.12em] text-[#ED1280] mb-1">{title}</p>
            {client ? (
              <Link
                to={`/seller/measurements/clients/${client.id}`}
                className="text-2xl font-semibold text-[#121212] hover:text-[#ED1280] transition-colors"
              >
                {client.name}
              </Link>
            ) : (
              <p className="text-2xl font-semibold text-[#121212]">Client</p>
            )}
            <div className="flex flex-wrap items-center gap-2 mt-2">
              {client && <GenderPill gender={client.gender} label={optionLabel(templates.genders, client.gender)} />}
              <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-[#F2E8ED] text-[#4a4a4a]">
                {optionLabel(templates.fits, record.fit)}
              </span>
              {record.occasion && (
                <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-[#F2E8ED] text-[#4a4a4a]">{record.occasion}</span>
              )}
              {record.dueDate && <DueChip date={record.dueDate} />}
            </div>
            <p className="text-[12px] text-[#95959D] mt-2">
              Recorded {longDate(record.createdAt)}
              {record.updatedAt !== record.createdAt && ` · edited ${longDate(record.updatedAt)}`}
              {record.dueDate && ` · due ${longDate(record.dueDate)}`}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap gap-2 mt-5 pt-5 border-t border-[#F2E8ED] print:hidden">
          <a href={whatsappHref} target="_blank" rel="noreferrer" className={`${actionBtn} !border-emerald-200 !text-emerald-700 hover:!bg-emerald-50`}>
            <MessageCircle className="w-4 h-4" strokeWidth={2} />
            WhatsApp
          </a>
          <button onClick={copy} className={actionBtn}>
            <Copy className="w-4 h-4" strokeWidth={2} />
            Copy
          </button>
          <button onClick={() => window.print()} className={actionBtn}>
            <Printer className="w-4 h-4" strokeWidth={2} />
            Print
          </button>
          <Link to={`/seller/measurements/new?from=${record.id}`} className={actionBtn}>
            <RotateCcw className="w-4 h-4" strokeWidth={2} />
            Re-measure
          </Link>
          <Link to={`/seller/measurements/${record.id}/edit`} className={actionBtn}>
            <Pencil className="w-4 h-4" strokeWidth={2} />
            Edit
          </Link>
          <button onClick={() => setConfirmDelete(true)} className={`${actionBtn} hover:!text-rose-500 hover:!border-rose-200`}>
            <Trash2 className="w-4 h-4" strokeWidth={2} />
            Delete
          </button>
        </div>
      </div>

      {/* Measurements */}
      <div className="bg-white rounded-3xl shadow-sm p-6 mb-6">
        <div className="flex items-center justify-between gap-3 mb-5">
          <h2 className="text-sm font-semibold text-[#121212]">
            Measurements <span className="font-normal text-[#95959D]">({Object.keys(record.values).length})</span>
          </h2>
          <div className="inline-flex gap-1 bg-[#F2E8ED] rounded-full p-1 print:hidden">
            {templates.units.map((u) => (
              <button
                key={u.value}
                onClick={() => setViewUnit(u.value)}
                className={`px-3 py-1 rounded-full text-[12px] font-semibold transition-colors ${
                  unit === u.value ? "bg-white text-[#ED1280] shadow-sm" : "text-[#4a4a4a]"
                }`}
              >
                {unitSymbol(templates, u.value)}
              </button>
            ))}
          </div>
        </div>
        {unit !== record.unit && (
          <p className="text-[11px] text-[#95959D] -mt-3 mb-4">
            Converted from {optionLabel(templates.units, record.unit).toLowerCase()} for viewing.
          </p>
        )}

        <div className="flex flex-col gap-6">
          {groups.map((g) => (
            <div key={g.value}>
              <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-[#95959D] mb-3">{g.label}</p>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {g.entries.map(([k, v]) => (
                  <div key={k} className="rounded-2xl bg-[#FCF8FA] border border-[#F2E8ED] p-3.5">
                    <p className="text-[12px] text-[#65799A] truncate">{templates.fields[k]?.label ?? k}</p>
                    <p className="text-xl font-bold text-[#121212]">
                      {formatNumber(convertValue(v, record.unit, unit))}
                      <span className="text-[12px] font-medium text-[#95959D] ml-0.5">{unitSymbol(templates, unit)}</span>
                    </p>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {record.notes && (
        <div className="bg-white rounded-3xl shadow-sm p-6">
          <h2 className="text-sm font-semibold text-[#121212] mb-2">Notes</h2>
          <p className="text-[14px] text-[#4a4a4a] whitespace-pre-line">{record.notes}</p>
        </div>
      )}

      {confirmDelete && (
        <ConfirmModal
          title="Delete this measurement?"
          body="It will be removed from this client's history. This can't be undone."
          confirmLabel="Delete"
          busy={deleting}
          onConfirm={remove}
          onClose={() => setConfirmDelete(false)}
        />
      )}
    </div>
  );
}
