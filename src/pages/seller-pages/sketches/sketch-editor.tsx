import { useCallback, useEffect, useRef, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Lightbulb, Save } from "lucide-react";
import { ClipLoader } from "react-spinners";
import SketchCanvas from "../../../components/seller/sketch/sketch-canvas";
import type { SketchCanvasHandle } from "../../../components/seller/sketch/sketch-canvas";
import useRequest from "../../../hooks/use-req";
import { useSketch, useSketchConfig } from "../../../hooks/use-sketches";
import { useMeasurementClients, useMeasurementTemplates } from "../../../hooks/use-measurements";
import { useToast } from "../../../context/toast-context";
import { apiErrorMessage, optionLabel } from "../../../types/measurement";
import type { SketchConfig, SketchDetail } from "../../../types/sketch";
import { inputClass, selectClass } from "../../../components/seller/measurements/styles";

export default function SketchEditor() {
  const { id } = useParams<{ id: string }>();
  const existing = useSketch(id);
  const config = useSketchConfig();

  if (id && !existing.loaded) {
    return (
      <div className="flex justify-center py-20">
        <ClipLoader size={28} color="#ED1280" />
      </div>
    );
  }
  if (id && !existing.data) {
    return (
      <div className="max-w-xl mx-auto text-center py-16">
        <p className="text-lg font-semibold text-[#121212] mb-2">{existing.error || "Sketch not found"}</p>
        <Link to="/seller/sketches" className="text-[#ED1280] font-medium hover:opacity-80">
          Back to sketches
        </Link>
      </div>
    );
  }
  // Keyed so switching sketches starts with a fresh canvas and form.
  return <Editor key={id ?? "new"} sketch={existing.data} config={config.data} />;
}

function Editor({ sketch, config }: { sketch: SketchDetail | null; config: SketchConfig | null }) {
  const navigate = useNavigate();
  const toast = useToast();
  const canvasRef = useRef<SketchCanvasHandle>(null);
  const { makeRequest: uploadReq } = useRequest("/uploads/sketch", "POST");
  const { makeRequest: createReq } = useRequest("/sketches", "POST");
  const { makeRequest: updateReq } = useRequest("/sketches", "PATCH");
  const clients = useMeasurementClients("", "");
  const { templates } = useMeasurementTemplates();

  const [name, setName] = useState(sketch?.name ?? "");
  const [notes, setNotes] = useState(sketch?.notes ?? "");
  const [clientId, setClientId] = useState(sketch?.clientId ?? "");
  // A drawing aid only: the API doesn't store which guide was used.
  const [guideGender, setGuideGender] = useState("");
  const [canvasState, setCanvasState] = useState({ dirty: false, empty: !sketch });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const metaChanged =
    name !== (sketch?.name ?? "") ||
    notes !== (sketch?.notes ?? "") ||
    clientId !== (sketch?.clientId ?? "");
  const unsaved = canvasState.dirty || (Boolean(sketch) && metaChanged);

  // Warn before closing the tab with unsaved work.
  useEffect(() => {
    if (!unsaved) return;
    const onBeforeUnload = (e: BeforeUnloadEvent) => e.preventDefault();
    window.addEventListener("beforeunload", onBeforeUnload);
    return () => window.removeEventListener("beforeunload", onBeforeUnload);
  }, [unsaved]);

  const onCanvasChange = useCallback((s: { dirty: boolean; empty: boolean }) => setCanvasState(s), []);
  const guide = config?.figureGuides.find((g) => g.gender === guideGender) ?? null;

  const save = async () => {
    if (!name.trim()) return setError("Give your sketch a name.");
    if (canvasState.empty) return setError("Draw something first, or import a photo of your sketch.");
    setError("");
    setSaving(true);

    // 1) Upload the drawing (only when it changed), via POST /uploads/sketch.
    let imageUrl: string | undefined;
    if (!sketch || canvasState.dirty) {
      const blob = await canvasRef.current?.exportBlob();
      if (!blob) {
        setSaving(false);
        return setError("Couldn't export the drawing. Please try again.");
      }
      const form = new FormData();
      form.append("file", blob, "sketch.png");
      const [upJson, upStatus] = await uploadReq(form);
      imageUrl = upJson?.data?.url;
      if (upStatus < 200 || upStatus >= 300 || !imageUrl) {
        setSaving(false);
        return setError(apiErrorMessage(upJson, "Couldn't upload your drawing. Please try again."));
      }
    }

    // 2) Save the sketch record with that URL.
    const [json, status] = sketch
      ? await updateReq(
          {
            name: name.trim(),
            notes: notes.trim(),
            clientId: clientId || null,
            ...(imageUrl && { imageUrl }),
          },
          undefined,
          sketch.id
        )
      : await createReq({
          name: name.trim(),
          imageUrl,
          ...(clientId && { clientId }),
          ...(notes.trim() && { notes: notes.trim() }),
        });
    setSaving(false);
    if (status >= 200 && status < 300 && json?.data?.id) {
      toast.success(sketch ? "Sketch updated." : "Sketch saved.");
      navigate(`/seller/sketches/${json.data.id}`, { replace: true });
    } else {
      setError(apiErrorMessage(json, "Couldn't save your sketch. Please try again."));
    }
  };

  return (
    <div className="max-w-6xl mx-auto">
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-1.5 text-sm text-[#65799A] hover:text-[#121212] mb-4 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" strokeWidth={2} />
        Back
      </button>

      <div className="flex flex-wrap items-end justify-between gap-3 mb-5">
        <div>
          <h1 className="text-2xl font-semibold text-[#121212]">{sketch ? "Edit sketch" : "New sketch"}</h1>
          <p className="text-sm text-[#65799A]">
            {unsaved ? "Unsaved changes" : sketch ? "All changes saved" : "Draw with your mouse, finger or stylus."}
          </p>
        </div>
        <button
          onClick={save}
          disabled={saving}
          className="lg:hidden inline-flex items-center gap-2 bg-[#ED1280] hover:opacity-90 text-white font-semibold px-5 py-2.5 rounded-full text-sm transition-opacity disabled:opacity-60"
        >
          <Save className="w-4 h-4" strokeWidth={2} />
          {saving ? "Saving..." : "Save"}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_320px] gap-6 items-start">
        <div className="w-full max-w-[640px] mx-auto">
          <SketchCanvas apiRef={canvasRef} baseImageUrl={sketch?.imageUrl} guideUrl={guide?.imageUrl} onChange={onCanvasChange} />
        </div>

        <div className="flex flex-col gap-4 lg:sticky lg:top-6">
          <div className="bg-white rounded-2xl shadow-sm p-5 flex flex-col gap-4">
            <label className="block">
              <span className="block text-[13px] font-semibold text-[#121212] mb-1.5">Name</span>
              <input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Mermaid gown with cape" className={inputClass} />
            </label>

            {config && config.figureGuides.length > 0 && (
              <label className="block">
                <span className="block text-[13px] font-semibold text-[#121212] mb-1.5">
                  Figure guide <span className="font-normal text-[#95959D]">(optional)</span>
                </span>
                <select value={guideGender} onChange={(e) => setGuideGender(e.target.value)} className={selectClass}>
                  <option value="">No guide</option>
                  {config.figureGuides.map((g) => (
                    <option key={g.gender} value={g.gender}>
                      {optionLabel(templates?.genders, g.gender)}
                    </option>
                  ))}
                </select>
              </label>
            )}

            <label className="block">
              <span className="block text-[13px] font-semibold text-[#121212] mb-1.5">
                For a client <span className="font-normal text-[#95959D]">(optional)</span>
              </span>
              <select value={clientId} onChange={(e) => setClientId(e.target.value)} className={selectClass}>
                <option value="">Not for a specific client</option>
                {(clients.data ?? []).map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
              <span className="block text-[11px] text-[#95959D] mt-1">Clients come from your Measurement Book.</span>
            </label>

            <label className="block">
              <span className="block text-[13px] font-semibold text-[#121212] mb-1.5">
                Notes <span className="font-normal text-[#95959D]">(optional)</span>
              </span>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={3}
                placeholder="Fabric, colours, details to remember..."
                className={`${inputClass} resize-none`}
              />
            </label>

            {error && <p className="text-[13px] text-rose-500">{error}</p>}

            <button
              onClick={save}
              disabled={saving}
              className="hidden lg:inline-flex items-center justify-center gap-2 bg-[#ED1280] hover:opacity-90 text-white font-semibold py-3 rounded-full text-sm transition-opacity disabled:opacity-60"
            >
              <Save className="w-4 h-4" strokeWidth={2} />
              {saving ? "Saving..." : sketch ? "Save changes" : "Save sketch"}
            </button>
          </div>

          <div className="bg-[#FDF1F7] rounded-2xl p-4">
            <p className="flex items-center gap-1.5 text-[13px] font-semibold text-[#ED1280] mb-2">
              <Lightbulb className="w-4 h-4" strokeWidth={2} />
              Tips
            </p>
            <ul className="text-[12px] text-[#4a4a4a] flex flex-col gap-1.5 list-disc pl-4">
              <li>Sketched on paper? Use the photo button to import it, then refine.</li>
              <li>Clean, closed outlines give the best AI results.</li>
              <li>Shortcuts: B pen, M marker, E eraser, ⌘Z undo.</li>
              <li>On an iPad, the pencil draws and your palm is ignored.</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
