import { useState } from "react";
import { Link } from "react-router-dom";
import { Brush, Loader2, PenTool, Plus, Search, Sparkles, Trash2, Wand2 } from "lucide-react";
import { ClipLoader } from "react-spinners";
import useRequest from "../../../hooks/use-req";
import { useDebounced } from "../../../hooks/use-measurements";
import { useSketchList } from "../../../hooks/use-sketches";
import { useToast } from "../../../context/toast-context";
import { apiErrorMessage, relativeDate } from "../../../types/measurement";
import type { Sketch, SketchFilter } from "../../../types/sketch";
import { isRenderActive } from "../../../types/sketch";
import { ConfirmModal } from "../../../components/seller/measurements/ui";
import { selectClass } from "../../../components/seller/measurements/styles";

// Values are the API's `filter` param; labels are UI copy.
const FILTERS: { value: SketchFilter; label: string }[] = [
  { value: "all", label: "All" },
  { value: "brought_to_life", label: "Brought to life" },
  { value: "sketch_only", label: "Sketch only" },
];

export default function SketchesGallery() {
  const toast = useToast();
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<SketchFilter>("all");
  const debounced = useDebounced(search.trim());
  const { data, lastData, loaded, error, reload } = useSketchList(debounced, filter);
  const sketches = data ?? lastData;
  const { makeRequest: deleteReq } = useRequest("/sketches", "DELETE");
  const [toDelete, setToDelete] = useState<Sketch | null>(null);
  const [deleting, setDeleting] = useState(false);

  const visible = sketches ?? [];
  const isEmpty = loaded && !debounced && filter === "all" && sketches?.length === 0;

  const remove = async () => {
    if (!toDelete) return;
    setDeleting(true);
    const [json, status] = await deleteReq(undefined, undefined, toDelete.id);
    setDeleting(false);
    setToDelete(null);
    if (status >= 200 && status < 300) {
      toast.success("Sketch deleted.");
      reload();
    } else {
      toast.error(apiErrorMessage(json, "Couldn't delete the sketch. Please try again."));
    }
  };

  return (
    <div>
      {/* Hero */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#4C1D95] via-[#9D174D] to-[#ED1280] text-white p-6 sm:p-8 mb-6">
        <Sparkles className="absolute right-6 top-6 w-16 h-16 text-white/15" strokeWidth={1.5} />
        <Brush className="absolute -right-8 -bottom-10 w-48 h-48 text-white/10 rotate-[25deg]" strokeWidth={1.5} />
        <div className="relative flex flex-col sm:flex-row sm:items-end sm:justify-between gap-5">
          <div>
            <p className="text-[12px] font-semibold uppercase tracking-[0.15em] text-white/70 mb-2">AI Sketch</p>
            <h1 className="text-2xl sm:text-3xl font-semibold leading-tight mb-2">
              Sketch it. Save it.
              <br className="hidden sm:block" /> Watch it come to life.
            </h1>
            <p className="text-sm text-white/80 max-w-md">
              Draw your designs right here, or import a photo of your paper sketch. Then let AI show you the finished outfit.
            </p>
          </div>
          <Link
            to="/seller/sketches/new"
            className="inline-flex items-center justify-center gap-2 bg-white text-[#9D174D] font-semibold px-5 py-3 rounded-full text-sm hover:bg-white/90 transition-colors shrink-0 shadow-lg shadow-black/10"
          >
            <Plus className="w-4 h-4" strokeWidth={2.5} />
            New sketch
          </Link>
        </div>
      </div>

      {isEmpty ? (
        <EmptyGallery />
      ) : (
        <>
          <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-5">
            <div className="inline-flex items-center gap-1 bg-[#F2E8ED] rounded-full p-1 self-start">
              {FILTERS.map((f) => (
                <button
                  key={f.value}
                  onClick={() => setFilter(f.value)}
                  className={`px-4 py-2 rounded-full text-[13px] font-semibold transition-colors ${
                    filter === f.value ? "bg-[#ED1280] text-white" : "text-[#4a4a4a] hover:text-[#121212]"
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>
            <div className="relative flex-1 sm:max-w-xs sm:ml-auto">
              <Search className="w-4 h-4 text-[#95959D] absolute left-3.5 top-1/2 -translate-y-1/2" strokeWidth={2} />
              <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search sketches" className={`${selectClass} pl-10`} />
            </div>
          </div>

          {sketches && (
            <p className="text-[12px] text-[#65799A] mb-4">
              {sketches.length} sketch{sketches.length === 1 ? "" : "es"}
            </p>
          )}

          {!sketches && !loaded ? (
            <div className="flex justify-center py-16">
              <ClipLoader size={26} color="#ED1280" />
            </div>
          ) : error ? (
            <div className="bg-white rounded-2xl shadow-sm py-14 px-6 text-center text-sm text-[#65799A]">{error}</div>
          ) : visible.length === 0 ? (
            <div className="bg-white rounded-2xl shadow-sm py-14 px-6 text-center text-sm text-[#65799A]">
              {debounced ? "No sketches match your search." : "Nothing in this view yet."}
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
              {visible.map((s) => (
                <SketchCard key={s.id} sketch={s} onDelete={() => setToDelete(s)} />
              ))}
            </div>
          )}
        </>
      )}

      {toDelete && (
        <ConfirmModal
          title={`Delete "${toDelete.name}"?`}
          body={toDelete.latestRender ? "Its AI looks will be deleted too. This can't be undone." : "This can't be undone."}
          confirmLabel="Delete"
          busy={deleting}
          onConfirm={remove}
          onClose={() => setToDelete(null)}
        />
      )}
    </div>
  );
}

function SketchCard({ sketch, onDelete }: { sketch: Sketch; onDelete: () => void }) {
  const render = sketch.latestRender;
  return (
    <div className="group relative bg-white rounded-2xl shadow-sm overflow-hidden hover:shadow-md transition-shadow">
      <Link to={`/seller/sketches/${sketch.id}`} className="block">
        <div className="relative aspect-[3/4] bg-[#FCF8FA]">
          <img src={sketch.imageUrl} alt={sketch.name} loading="lazy" className="w-full h-full object-contain" />
          {render?.status === "COMPLETED" && render.resultImageUrl && (
            <img
              src={render.resultImageUrl}
              alt=""
              loading="lazy"
              className="absolute bottom-2 right-2 w-16 h-20 object-cover rounded-xl border-2 border-white shadow-md"
            />
          )}
          {render && isRenderActive(render) && (
            <span className="absolute bottom-2 right-2 inline-flex items-center gap-1 text-[10px] font-semibold bg-white/95 text-[#7C3AED] px-2 py-1 rounded-full shadow">
              <Loader2 className="w-3 h-3 animate-spin" strokeWidth={2.5} />
              Rendering
            </span>
          )}
        </div>
        <div className="p-3">
          <p className="text-[14px] font-semibold text-[#121212] truncate">{sketch.name}</p>
          <p className="text-[11px] text-[#65799A] truncate">
            {sketch.client ? `${sketch.client.name} · ` : ""}
            {relativeDate(sketch.updatedAt)}
          </p>
          {render?.status === "COMPLETED" && (
            <span className="inline-flex items-center gap-1 mt-1.5 text-[10px] font-semibold bg-violet-50 text-violet-700 px-2 py-0.5 rounded-full">
              <Wand2 className="w-3 h-3" strokeWidth={2.5} />
              Brought to life
            </span>
          )}
          {render?.status === "FAILED" && (
            <span className="inline-flex items-center gap-1 mt-1.5 text-[10px] font-semibold bg-red-50 text-red-600 px-2 py-0.5 rounded-full">
              Last render failed
            </span>
          )}
        </div>
      </Link>
      <button
        onClick={onDelete}
        aria-label={`Delete ${sketch.name}`}
        className="absolute top-2 right-2 w-8 h-8 rounded-full bg-white/95 shadow flex items-center justify-center text-[#4a4a4a] hover:text-rose-500 sm:opacity-0 sm:group-hover:opacity-100 focus:opacity-100 transition-opacity"
      >
        <Trash2 className="w-4 h-4" strokeWidth={2} />
      </button>
    </div>
  );
}

function EmptyGallery() {
  const steps = [
    { icon: PenTool, title: "Sketch", body: "Draw with your mouse, finger or iPad pencil, or import a photo of a paper sketch." },
    { icon: Brush, title: "Save", body: "Name it, link it to a client from your Measurement Book and keep it forever." },
    { icon: Wand2, title: "Bring it to life", body: "Describe fabric and colours, and AI renders the finished outfit." },
  ];
  return (
    <div className="bg-white rounded-3xl shadow-sm p-8 sm:p-10 text-center">
      <span className="w-16 h-16 rounded-2xl bg-violet-50 flex items-center justify-center mx-auto mb-5">
        <Sparkles className="w-8 h-8 text-violet-600" strokeWidth={2} />
      </span>
      <h2 className="text-xl font-semibold text-[#121212] mb-2">Your sketchbook is empty</h2>
      <p className="text-sm text-[#65799A] max-w-md mx-auto mb-8">Start your first design. Every idea you save stays here.</p>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-left mb-8">
        {steps.map(({ icon: Icon, title, body }) => (
          <div key={title} className="bg-[#F7F2F4] rounded-2xl p-4">
            <span className="w-9 h-9 rounded-xl bg-white flex items-center justify-center mb-3">
              <Icon className="w-4 h-4 text-[#ED1280]" strokeWidth={2} />
            </span>
            <p className="text-[14px] font-semibold text-[#121212] mb-1">{title}</p>
            <p className="text-[12px] text-[#65799A]">{body}</p>
          </div>
        ))}
      </div>
      <Link
        to="/seller/sketches/new"
        className="inline-flex items-center gap-2 bg-[#ED1280] hover:opacity-90 text-white font-semibold px-6 py-3 rounded-full text-sm transition-opacity"
      >
        <Plus className="w-4 h-4" strokeWidth={2.5} />
        Start sketching
      </Link>
    </div>
  );
}
