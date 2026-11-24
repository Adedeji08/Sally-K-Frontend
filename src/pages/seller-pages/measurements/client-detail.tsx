import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, ChevronRight, MessageCircle, Pencil, Phone, Plus, Trash2, X } from "lucide-react";
import { ClipLoader } from "react-spinners";
import useRequest from "../../../hooks/use-req";
import { useMeasurementClient, useMeasurementTemplates } from "../../../hooks/use-measurements";
import { useToast } from "../../../context/toast-context";
import type { ClientDetail as ClientDetailType, MeasurementTemplates } from "../../../types/measurement";
import { apiErrorMessage, formatNumber, garmentLabel, optionLabel, relativeDate, unitSymbol } from "../../../types/measurement";
import { ClientAvatar, ConfirmModal, DueChip, GenderPill } from "../../../components/seller/measurements/ui";
import { inputClass } from "../../../components/seller/measurements/styles";

// Nigerian local numbers (0803...) -> international (234803...) for wa.me.
const waNumber = (phone: string) => {
  const digits = phone.replace(/\D/g, "");
  return digits.startsWith("0") ? `234${digits.slice(1)}` : digits;
};

export default function ClientDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const toast = useToast();
  const { templates } = useMeasurementTemplates();
  const { data: client, loaded, error, reload } = useMeasurementClient(id);
  const { makeRequest: deleteReq } = useRequest("/measurements/clients", "DELETE");
  const [editing, setEditing] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);

  if (!loaded || !templates) {
    return (
      <div className="flex justify-center py-20">
        <ClipLoader size={28} color="#ED1280" />
      </div>
    );
  }

  if (!client) {
    return (
      <div className="max-w-xl mx-auto text-center py-16">
        <p className="text-lg font-semibold text-[#121212] mb-2">{error || "Client not found"}</p>
        <Link to="/seller/measurements" className="text-[#ED1280] font-medium hover:opacity-80">
          Back to measurements
        </Link>
      </div>
    );
  }

  const remove = async () => {
    setDeleting(true);
    const [json, status] = await deleteReq(undefined, undefined, client.id);
    setDeleting(false);
    if (status >= 200 && status < 300) {
      toast.success("Client deleted.");
      navigate("/seller/measurements", { replace: true });
    } else {
      setConfirmDelete(false);
      toast.error(apiErrorMessage(json, "Couldn't delete. Please try again."));
    }
  };

  const count = client.measurements.length;

  return (
    <div className="max-w-3xl mx-auto">
      <button
        onClick={() => navigate("/seller/measurements")}
        className="flex items-center gap-1.5 text-sm text-[#65799A] hover:text-[#121212] mb-6 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" strokeWidth={2} />
        Back to measurements
      </button>

      {/* Profile */}
      <div className="bg-white rounded-3xl shadow-sm p-6 mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center gap-4">
          <ClientAvatar name={client.name} gender={client.gender} size="lg" />
          <div className="flex-1 min-w-0">
            <h1 className="text-2xl font-semibold text-[#121212] truncate">{client.name}</h1>
            <div className="flex flex-wrap items-center gap-2 mt-1.5">
              <GenderPill gender={client.gender} label={optionLabel(templates.genders, client.gender)} />
              <span className="text-[12px] text-[#65799A]">
                {count} measurement{count === 1 ? "" : "s"} · client since{" "}
                {new Date(client.createdAt).toLocaleDateString(undefined, { month: "short", year: "numeric" })}
              </span>
            </div>
          </div>
          <Link
            to={`/seller/measurements/new?client=${client.id}`}
            className="inline-flex items-center justify-center gap-2 bg-[#ED1280] hover:opacity-90 text-white font-semibold px-5 py-2.5 rounded-full text-sm transition-opacity shrink-0"
          >
            <Plus className="w-4 h-4" strokeWidth={2.5} />
            New measurement
          </Link>
        </div>

        {client.notes && <p className="text-[13px] text-[#4a4a4a] bg-[#F7F2F4] rounded-xl p-3 mt-5 whitespace-pre-line">{client.notes}</p>}

        <div className="flex flex-wrap gap-2 mt-5 pt-5 border-t border-[#F2E8ED]">
          {client.phone && (
            <>
              <a
                href={`tel:${client.phone}`}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full text-[13px] font-semibold border border-[#E7E1E4] text-[#4a4a4a] hover:bg-[#F7F2F4] transition-colors"
              >
                <Phone className="w-4 h-4" strokeWidth={2} />
                {client.phone}
              </a>
              <a
                href={`https://wa.me/${waNumber(client.phone)}`}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full text-[13px] font-semibold border border-emerald-200 text-emerald-700 hover:bg-emerald-50 transition-colors"
              >
                <MessageCircle className="w-4 h-4" strokeWidth={2} />
                WhatsApp
              </a>
            </>
          )}
          <button
            onClick={() => setEditing(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full text-[13px] font-semibold border border-[#E7E1E4] text-[#4a4a4a] hover:bg-[#F7F2F4] transition-colors"
          >
            <Pencil className="w-4 h-4" strokeWidth={2} />
            Edit client
          </button>
          <button
            onClick={() => setConfirmDelete(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full text-[13px] font-semibold border border-[#E7E1E4] text-[#4a4a4a] hover:text-rose-500 hover:border-rose-200 transition-colors"
          >
            <Trash2 className="w-4 h-4" strokeWidth={2} />
            Delete
          </button>
        </div>
      </div>

      {/* History timeline */}
      <h2 className="text-lg font-semibold text-[#121212] mb-4">Measurement history</h2>
      {count === 0 ? (
        <div className="bg-white rounded-2xl shadow-sm py-12 text-center">
          <p className="text-sm text-[#65799A] mb-3">No measurements for {client.name.split(" ")[0]} yet.</p>
          <Link to={`/seller/measurements/new?client=${client.id}`} className="text-sm font-semibold text-[#ED1280] hover:opacity-80">
            Take the first one →
          </Link>
        </div>
      ) : (
        <div className="relative pl-6">
          <span className="absolute left-[7px] top-2 bottom-2 w-0.5 bg-[#F2E8ED]" />
          <div className="flex flex-col gap-4">
            {client.measurements.map((m, i) => (
              <div key={m.id} className="relative">
                <span
                  className={`absolute -left-6 top-5 w-4 h-4 rounded-full border-4 border-[#F7F2F4] ${i === 0 ? "bg-[#ED1280]" : "bg-[#E7C3D6]"}`}
                />
                <Link
                  to={`/seller/measurements/${m.id}`}
                  className="block bg-white rounded-2xl shadow-sm p-4 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="min-w-0">
                      <p className="text-[15px] font-semibold text-[#121212] truncate">
                        {garmentLabel(templates, client.gender, m.garmentType)}
                        {i === 0 && <span className="ml-2 text-[10px] font-bold uppercase text-[#ED1280]">Latest</span>}
                      </p>
                      <p className="text-[12px] text-[#65799A]">
                        {relativeDate(m.createdAt)} · {optionLabel(templates.fits, m.fit)}
                        {m.occasion && ` · ${m.occasion}`}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      {m.dueDate && <DueChip date={m.dueDate} />}
                      <ChevronRight className="w-4 h-4 text-[#95959D]" strokeWidth={2} />
                    </div>
                  </div>
                  <ValuePreview values={m.values} unit={m.unit} templates={templates} />
                </Link>
              </div>
            ))}
          </div>
        </div>
      )}

      {editing && (
        <EditClientModal
          client={client}
          templates={templates}
          onClose={() => setEditing(false)}
          onSaved={() => {
            setEditing(false);
            reload();
          }}
        />
      )}

      {confirmDelete && (
        <ConfirmModal
          title={`Delete ${client.name}?`}
          body={`This also deletes all ${count} of their measurement${count === 1 ? "" : "s"}. This can't be undone.`}
          confirmLabel="Delete client"
          busy={deleting}
          onConfirm={remove}
          onClose={() => setConfirmDelete(false)}
        />
      )}
    </div>
  );
}

function ValuePreview({
  values,
  unit,
  templates,
}: {
  values: Record<string, number>;
  unit: ClientDetailType["measurements"][number]["unit"];
  templates: MeasurementTemplates;
}) {
  const entries = Object.entries(values);
  const shown = entries.slice(0, 4);
  return (
    <div className="flex flex-wrap gap-2">
      {shown.map(([k, v]) => (
        <span key={k} className="text-[12px] bg-[#FCF8FA] border border-[#F2E8ED] rounded-lg px-2.5 py-1 text-[#4a4a4a]">
          {templates.fields[k]?.label ?? k}{" "}
          <span className="font-semibold text-[#121212]">
            {formatNumber(v)}
            {unitSymbol(templates, unit)}
          </span>
        </span>
      ))}
      {entries.length > shown.length && (
        <span className="text-[12px] text-[#95959D] px-1 py-1">+{entries.length - shown.length} more</span>
      )}
    </div>
  );
}

function EditClientModal({
  client,
  templates,
  onClose,
  onSaved,
}: {
  client: ClientDetailType;
  templates: MeasurementTemplates;
  onClose: () => void;
  onSaved: () => void;
}) {
  const genderLocked = client.measurements.length > 0;
  const [gender, setGender] = useState(client.gender);
  const toast = useToast();
  const { makeRequest } = useRequest("/measurements/clients", "PATCH");
  const [name, setName] = useState(client.name);
  const [phone, setPhone] = useState(client.phone ?? "");
  const [notes, setNotes] = useState(client.notes ?? "");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const save = async () => {
    if (name.trim().length < 2) {
      setError("Enter the client's name.");
      return;
    }
    setSaving(true);
    const [json, status] = await makeRequest(
      { name: name.trim(), phone: phone.trim(), notes: notes.trim(), ...(!genderLocked && { gender }) },
      undefined,
      client.id
    );
    setSaving(false);
    if (status >= 200 && status < 300) {
      toast.success("Client updated.");
      onSaved();
    } else {
      setError(apiErrorMessage(json, "Couldn't save. Please try again."));
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 px-4" onClick={onClose}>
      <div className="w-full max-w-[420px] bg-white rounded-3xl shadow-xl p-6" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-[16px] font-semibold text-[#121212]">Edit client</h2>
          <button onClick={onClose} className="text-[#95959D] hover:text-[#121212]" aria-label="Close">
            <X className="w-5 h-5" strokeWidth={2} />
          </button>
        </div>
        <div className="flex flex-col gap-4">
          <label className="block">
            <span className="block text-[13px] font-semibold text-[#121212] mb-1.5">Name</span>
            <input value={name} onChange={(e) => setName(e.target.value)} className={inputClass} />
          </label>
          <label className="block">
            <span className="block text-[13px] font-semibold text-[#121212] mb-1.5">Phone number</span>
            <input value={phone} onChange={(e) => setPhone(e.target.value)} inputMode="tel" className={inputClass} />
          </label>
          <label className="block">
            <span className="block text-[13px] font-semibold text-[#121212] mb-1.5">Gender</span>
            <select
              value={gender}
              onChange={(e) => setGender(e.target.value as typeof gender)}
              disabled={genderLocked}
              className={`${inputClass} disabled:bg-[#F7F2F4] disabled:text-[#95959D]`}
            >
              {templates.genders.map((g) => (
                <option key={g.value} value={g.value}>
                  {g.label}
                </option>
              ))}
            </select>
            {genderLocked && (
              <span className="block text-[11px] text-[#95959D] mt-1">
                Locked because this client already has measurements.
              </span>
            )}
          </label>
          <label className="block">
            <span className="block text-[13px] font-semibold text-[#121212] mb-1.5">Notes</span>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              placeholder="Preferences, body notes, favourite styles..."
              className={`${inputClass} resize-none`}
            />
          </label>
        </div>
        {error && <p className="text-[13px] text-rose-500 mt-3">{error}</p>}
        <button
          onClick={save}
          disabled={saving}
          className="w-full mt-6 bg-[#ED1280] hover:opacity-90 text-white font-semibold py-3 rounded-full text-sm transition-opacity disabled:opacity-60"
        >
          {saving ? "Saving..." : "Save changes"}
        </button>
      </div>
    </div>
  );
}
