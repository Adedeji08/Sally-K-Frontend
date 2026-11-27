import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  AlertCircle,
  ArrowLeft,
  Download,
  Loader2,
  Package,
  Pencil,
  RotateCcw,
  Sparkles,
  Trash2,
  Wand2,
} from "lucide-react";
import { ClipLoader } from "react-spinners";
import useRequest from "../../../hooks/use-req";
import { useSketch, useSketchConfig } from "../../../hooks/use-sketches";
import { useToast } from "../../../context/toast-context";
import { apiErrorMessage, optionLabel } from "../../../types/measurement";
import type { SketchConfig, SketchDetail as SketchDetailType, SketchRender } from "../../../types/sketch";
import { isRenderActive } from "../../../types/sketch";
import { ConfirmModal } from "../../../components/seller/measurements/ui";
import { inputClass } from "../../../components/seller/measurements/styles";

const POLL_MS = 4000;

// Cross-origin images ignore <a download>, so fetch the bytes first.
async function downloadImage(url: string, filename: string) {
  try {
    const res = await fetch(url);
    const blob = await res.blob();
    const href = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = href;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(href);
  } catch {
    window.open(url, "_blank", "noopener");
  }
}

const slug = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "sketch";

export default function SketchDetail() {
  const { id } = useParams<{ id: string }>();
  const { data: sketch, loaded, error, reload } = useSketch(id);
  const config = useSketchConfig();

  // While any render is still being generated, refresh until it settles.
  const rendering = Boolean(sketch?.renders.some(isRenderActive));
  useEffect(() => {
    if (!rendering) return;
    const t = setInterval(reload, POLL_MS);
    return () => clearInterval(t);
  }, [rendering, reload]);

  if (!loaded && !sketch) {
    return (
      <div className="flex justify-center py-20">
        <ClipLoader size={28} color="#ED1280" />
      </div>
    );
  }
  if (!sketch) {
    return (
      <div className="max-w-xl mx-auto text-center py-16">
        <p className="text-lg font-semibold text-[#121212] mb-2">{error || "Sketch not found"}</p>
        <Link to="/seller/sketches" className="text-[#ED1280] font-medium hover:opacity-80">
          Back to sketches
        </Link>
      </div>
    );
  }

  return <Detail sketch={sketch} config={config.data} configError={config.error} reload={reload} />;
}

function Detail({
  sketch,
  config,
  configError,
  reload,
}: {
  sketch: SketchDetailType;
  config: SketchConfig | null;
  configError: string;
  reload: () => void;
}) {
  const navigate = useNavigate();
  const toast = useToast();
  // POST /sketches/:id/renders, and POST /sketches/:id/renders/:renderId/retry
  const { makeRequest: renderReq } = useRequest(`/sketches/${sketch.id}/renders`, "POST");
  const { makeRequest: deleteSketchReq } = useRequest("/sketches", "DELETE");

  const [style, setStyle] = useState("");
  const [description, setDescription] = useState("");
  const [generating, setGenerating] = useState(false);
  const [genError, setGenError] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const completed = sketch.renders.filter((r) => r.status === "COMPLETED" && r.resultImageUrl);
  // Default to the newest finished look; fall back if the selection vanished.
  const selected = completed.find((r) => r.id === selectedId) ?? completed[0] ?? null;
  const chosenStyle = style || config?.styles[0]?.value || "";
  // The newest attempt's failure (e.g. AI not configured) is shown in the panel.
  const latest = sketch.renders[0];
  const latestFailure = latest?.status === "FAILED" ? latest.errorMessage : null;

  // The API answers 201 even when a render fails to start; the failure is on the render.
  const handleRenderResponse = (json: { data?: SketchRender; message?: string }, status: number) => {
    if (status >= 200 && status < 300 && json?.data) {
      if (json.data.status === "FAILED") setGenError(json.data.errorMessage || "The AI render couldn't start.");
      else toast.success("Bringing your sketch to life. This takes a moment.");
      reload();
    } else {
      setGenError(apiErrorMessage(json, "Couldn't start the AI render. Please try again."));
    }
  };

  const generate = async () => {
    setGenError("");
    setGenerating(true);
    const [json, status] = await renderReq({ style: chosenStyle, ...(description.trim() && { description: description.trim() }) });
    setGenerating(false);
    handleRenderResponse(json, status);
  };

  const retry = async (render: SketchRender) => {
    setGenError("");
    const [json, status] = await renderReq(undefined, undefined, `${render.id}/retry`);
    handleRenderResponse(json, status);
  };

  const deleteSketch = async () => {
    setDeleting(true);
    const [json, status] = await deleteSketchReq(undefined, undefined, sketch.id);
    setDeleting(false);
    if (status >= 200 && status < 300) {
      toast.success("Sketch deleted.");
      navigate("/seller/sketches", { replace: true });
    } else {
      setConfirmDelete(false);
      toast.error(apiErrorMessage(json, "Couldn't delete the sketch."));
    }
  };

  const actionBtn =
    "inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full text-[13px] font-semibold border border-[#E7E1E4] text-[#4a4a4a] hover:bg-[#F7F2F4] transition-colors";

  return (
    <div className="max-w-6xl mx-auto">
      <button
        onClick={() => navigate("/seller/sketches")}
        className="flex items-center gap-1.5 text-sm text-[#65799A] hover:text-[#121212] mb-4 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" strokeWidth={2} />
        All sketches
      </button>

      <div className="flex flex-wrap items-start justify-between gap-4 mb-6">
        <div className="min-w-0">
          <h1 className="text-2xl font-semibold text-[#121212] truncate">{sketch.name}</h1>
          <p className="text-sm text-[#65799A]">
            {sketch.client && (
              <>
                For{" "}
                <Link to={`/seller/measurements/clients/${sketch.client.id}`} className="text-[#ED1280] hover:opacity-80 font-medium">
                  {sketch.client.name}
                </Link>{" "}
                ·{" "}
              </>
            )}
            Updated {new Date(sketch.updatedAt).toLocaleDateString(undefined, { day: "numeric", month: "short", year: "numeric" })}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link to={`/seller/sketches/${sketch.id}/edit`} className={actionBtn}>
            <Pencil className="w-4 h-4" strokeWidth={2} />
            Edit sketch
          </Link>
          <button onClick={() => downloadImage(sketch.imageUrl, `${slug(sketch.name)}.png`)} className={actionBtn}>
            <Download className="w-4 h-4" strokeWidth={2} />
            Download
          </button>
          <button onClick={() => setConfirmDelete(true)} className={`${actionBtn} hover:!text-rose-500 hover:!border-rose-200`}>
            <Trash2 className="w-4 h-4" strokeWidth={2} />
            Delete
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_360px] gap-6 items-start">
        {/* Viewer */}
        <div className="flex flex-col gap-4 min-w-0">
          <div className="bg-white rounded-3xl shadow-sm p-3 sm:p-4">
            {selected?.resultImageUrl ? (
              <CompareSlider key={selected.id} before={sketch.imageUrl} after={selected.resultImageUrl} />
            ) : (
              <div className="aspect-[3/4] max-h-[75vh] mx-auto rounded-2xl bg-[#FCF8FA] overflow-hidden">
                <img src={sketch.imageUrl} alt={sketch.name} className="w-full h-full object-contain" />
              </div>
            )}
          </div>

          {selected?.resultImageUrl && (
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-[12px] font-semibold text-violet-700 bg-violet-50 px-2.5 py-1 rounded-full">
                {optionLabel(config?.styles, selected.style)}
              </span>
              {selected.description && <span className="text-[12px] text-[#65799A] truncate max-w-xs">"{selected.description}"</span>}
              <div className="flex gap-2 ml-auto">
                <button
                  onClick={() => navigate("/seller/products/new", { state: { images: [selected.resultImageUrl], name: sketch.name } })}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full text-[13px] font-semibold bg-[#ED1280] text-white hover:opacity-90 transition-opacity"
                >
                  <Package className="w-4 h-4" strokeWidth={2} />
                  List as product
                </button>
                <button
                  onClick={() => downloadImage(selected.resultImageUrl!, `${slug(sketch.name)}-ai.jpg`)}
                  className={actionBtn}
                  aria-label="Download AI look"
                >
                  <Download className="w-4 h-4" strokeWidth={2} />
                </button>
              </div>
            </div>
          )}

          {sketch.notes && (
            <div className="bg-white rounded-2xl shadow-sm p-5">
              <h2 className="text-sm font-semibold text-[#121212] mb-1.5">Notes</h2>
              <p className="text-[14px] text-[#4a4a4a] whitespace-pre-line">{sketch.notes}</p>
            </div>
          )}
        </div>

        {/* AI panel */}
        <div className="flex flex-col gap-4 lg:sticky lg:top-6">
          <div className="bg-white rounded-3xl shadow-sm p-5">
            <div className="flex items-center gap-2 mb-1">
              <span className="w-8 h-8 rounded-xl bg-gradient-to-br from-violet-600 to-[#ED1280] flex items-center justify-center">
                <Wand2 className="w-4 h-4 text-white" strokeWidth={2} />
              </span>
              <h2 className="text-[16px] font-semibold text-[#121212]">Bring it to life</h2>
            </div>
            <p className="text-[12px] text-[#65799A] mb-4">
              AI turns your sketch into a realistic picture of the finished outfit.
              {config && ` Up to ${config.dailyRenderLimit} AI looks a day.`}
            </p>

            {!config ? (
              configError ? (
                <p className="text-[13px] text-rose-500">{configError}</p>
              ) : (
                <div className="flex justify-center py-6">
                  <ClipLoader size={20} color="#ED1280" />
                </div>
              )
            ) : (
              <>
                <p className="text-[13px] font-semibold text-[#121212] mb-2">Style</p>
                <div className="grid grid-cols-2 gap-2 mb-4">
                  {config.styles.map((s) => (
                    <button
                      key={s.value}
                      type="button"
                      onClick={() => setStyle(s.value)}
                      className={`text-left rounded-xl border-2 p-2.5 transition-colors ${
                        chosenStyle === s.value ? "border-[#ED1280] bg-[#FDF1F7]" : "border-[#F2E8ED] hover:border-[#F5B5D5]"
                      }`}
                    >
                      <p className="text-[13px] font-semibold text-[#121212]">{s.label}</p>
                    </button>
                  ))}
                </div>

                <label className="block mb-4">
                  <span className="block text-[13px] font-semibold text-[#121212] mb-1.5">
                    Describe it <span className="font-normal text-[#95959D]">(optional)</span>
                  </span>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    maxLength={config.descriptionMaxLength}
                    rows={3}
                    placeholder="e.g. Emerald green satin, gold embroidery on the bodice, flowing cape"
                    className={`${inputClass} resize-none`}
                  />
                  <span className="block text-right text-[11px] text-[#95959D] mt-1">
                    {description.length}/{config.descriptionMaxLength}
                  </span>
                </label>

                {(genError || latestFailure) && (
                  <p className="flex items-start gap-1.5 text-[12px] text-red-700 bg-red-50 rounded-xl px-3 py-2 mb-3">
                    <AlertCircle className="w-3.5 h-3.5 shrink-0 mt-px" strokeWidth={2} />
                    {genError || `Last attempt failed: ${latestFailure}`}
                  </p>
                )}

                <button
                  onClick={generate}
                  disabled={generating || !chosenStyle}
                  className="w-full inline-flex items-center justify-center gap-2 bg-gradient-to-r from-violet-600 to-[#ED1280] hover:opacity-90 text-white font-semibold py-3 rounded-full text-sm transition-opacity disabled:opacity-60"
                >
                  <Sparkles className="w-4 h-4" strokeWidth={2} />
                  {generating ? "Starting..." : "Generate look"}
                </button>
              </>
            )}
          </div>

          {sketch.renders.length > 0 && (
            <div className="bg-white rounded-3xl shadow-sm p-5">
              <h2 className="text-sm font-semibold text-[#121212] mb-3">
                AI looks <span className="font-normal text-[#95959D]">({sketch.renders.length})</span>
              </h2>
              <div className="grid grid-cols-3 gap-2">
                {sketch.renders.map((r) => (
                  <RenderThumb
                    key={r.id}
                    render={r}
                    selected={selected?.id === r.id}
                    styleLabel={optionLabel(config?.styles, r.style)}
                    onSelect={() => setSelectedId(r.id)}
                    onRetry={() => retry(r)}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {confirmDelete && (
        <ConfirmModal
          title={`Delete "${sketch.name}"?`}
          body={
            sketch.renders.length > 0
              ? `Its ${sketch.renders.length} AI look${sketch.renders.length === 1 ? "" : "s"} will be deleted too. This can't be undone.`
              : "This can't be undone."
          }
          confirmLabel="Delete"
          busy={deleting}
          onConfirm={deleteSketch}
          onClose={() => setConfirmDelete(false)}
        />
      )}
    </div>
  );
}

function RenderThumb({
  render,
  selected,
  styleLabel,
  onSelect,
  onRetry,
}: {
  render: SketchRender;
  selected: boolean;
  styleLabel: string;
  onSelect: () => void;
  onRetry: () => void;
}) {
  if (isRenderActive(render)) {
    return (
      <div className="aspect-[3/4] rounded-xl bg-gradient-to-br from-violet-50 to-[#FDF1F7] flex flex-col items-center justify-center gap-1.5 text-center p-1">
        <Loader2 className="w-5 h-5 text-violet-600 animate-spin" strokeWidth={2} />
        <span className="text-[10px] font-semibold text-violet-700">Rendering</span>
      </div>
    );
  }
  if (render.status === "FAILED" || !render.resultImageUrl) {
    return (
      <div
        className="aspect-[3/4] rounded-xl bg-red-50 flex flex-col items-center justify-center gap-1 text-center p-1.5"
        title={render.errorMessage ?? undefined}
      >
        <AlertCircle className="w-4 h-4 text-red-500" strokeWidth={2} />
        <span className="text-[10px] font-semibold text-red-600">Failed</span>
        <button
          onClick={onRetry}
          className="inline-flex items-center gap-1 text-[10px] font-semibold text-red-600 hover:text-red-800 mt-0.5"
        >
          <RotateCcw className="w-3 h-3" strokeWidth={2.5} />
          Retry
        </button>
      </div>
    );
  }
  return (
    <button
      onClick={onSelect}
      title={styleLabel}
      className={`aspect-[3/4] rounded-xl overflow-hidden border-2 transition-all ${selected ? "border-[#ED1280] ring-2 ring-[#ED1280]/20" : "border-transparent hover:border-[#F5B5D5]"}`}
    >
      <img src={render.resultImageUrl} alt={styleLabel} loading="lazy" className="w-full h-full object-cover" />
    </button>
  );
}

// Drag to compare: sketch on the left, AI render on the right.
function CompareSlider({ before, after }: { before: string; after: string }) {
  const [pos, setPos] = useState(50);
  return (
    <div className="relative aspect-[3/4] max-h-[75vh] mx-auto rounded-2xl overflow-hidden bg-[#FCF8FA] select-none">
      <img src={before} alt="Sketch" draggable={false} className="absolute inset-0 w-full h-full object-contain" />
      <img
        src={after}
        alt="AI render"
        draggable={false}
        className="absolute inset-0 w-full h-full object-cover"
        style={{ clipPath: `inset(0 0 0 ${pos}%)` }}
      />
      <div className="absolute inset-y-0 w-0.5 bg-white shadow-[0_0_8px_rgba(0,0,0,0.3)] pointer-events-none" style={{ left: `${pos}%` }}>
        <span className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 left-1/2 w-9 h-9 rounded-full bg-white shadow-lg flex items-center justify-center text-[#ED1280] text-[13px] font-bold">
          ⇆
        </span>
      </div>
      <span className="absolute top-3 left-3 text-[10px] font-bold uppercase tracking-wider bg-white/90 text-[#4a4a4a] px-2 py-1 rounded-full pointer-events-none">
        Sketch
      </span>
      <span className="absolute top-3 right-3 text-[10px] font-bold uppercase tracking-wider bg-violet-600 text-white px-2 py-1 rounded-full pointer-events-none">
        AI look
      </span>
      <input
        type="range"
        min={0}
        max={100}
        value={pos}
        onChange={(e) => setPos(Number(e.target.value))}
        aria-label="Compare sketch and AI look"
        className="absolute inset-0 w-full h-full opacity-0 cursor-ew-resize"
      />
    </div>
  );
}
