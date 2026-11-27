import { useCallback, useEffect, useImperativeHandle, useRef, useState } from "react";
import type { RefObject } from "react";
import { Eraser, Grid3x3, Highlighter, ImagePlus, PenTool, Redo2, Trash2, Undo2 } from "lucide-react";

// Logical drawing size (3:4 portrait). The canvas is CSS-scaled to fit, so
// exports are always this resolution regardless of screen size.
export const SKETCH_WIDTH = 1200;
export const SKETCH_HEIGHT = 1600;

type Tool = "pen" | "marker" | "eraser";
type Paper = "blank" | "grid" | "dots";

interface Point {
  x: number;
  y: number;
  p: number; // pressure 0..1
}

type Action =
  | { type: "stroke"; tool: Tool; color: string; size: number; points: Point[] }
  | { type: "image"; img: HTMLImageElement; x: number; y: number; w: number; h: number }
  | { type: "clear" };

export interface SketchCanvasHandle {
  exportBlob: () => Promise<Blob | null>;
}

// Drawing aids only, not data: the ink swatches on the toolbar.
const SWATCHES = ["#121212", "#4B5563", "#ED1280", "#DC2626", "#EA580C", "#CA8A04", "#16A34A", "#2563EB", "#7C3AED", "#92400E"];

const PAPER_BG: Record<Paper, string> = {
  blank: "none",
  grid: "linear-gradient(#EEE6EA 1px, transparent 1px), linear-gradient(90deg, #EEE6EA 1px, transparent 1px)",
  dots: "radial-gradient(#E2D5DC 1.5px, transparent 1.5px)",
};

function loadImage(src: string, crossOrigin = false) {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const img = new Image();
    if (crossOrigin) img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

// Fit an image inside the sketch area, centred.
function containRect(img: HTMLImageElement) {
  const scale = Math.min(SKETCH_WIDTH / img.width, SKETCH_HEIGHT / img.height);
  const w = img.width * scale;
  const h = img.height * scale;
  return { x: (SKETCH_WIDTH - w) / 2, y: (SKETCH_HEIGHT - h) / 2, w, h };
}

function strokeWidth(size: number, p: number, tool: Tool) {
  if (tool === "marker") return size * 2.2;
  if (tool === "eraser") return size * 2.5;
  return Math.max(0.6, size * (0.35 + p * 0.9));
}

function drawStroke(ctx: CanvasRenderingContext2D, s: Extract<Action, { type: "stroke" }>) {
  const pts = s.points;
  if (pts.length === 0) return;
  ctx.save();
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  ctx.strokeStyle = s.color;
  ctx.fillStyle = s.color;
  ctx.globalCompositeOperation = s.tool === "eraser" ? "destination-out" : "source-over";
  ctx.globalAlpha = s.tool === "marker" ? 0.35 : 1;

  if (pts.length === 1) {
    ctx.beginPath();
    ctx.arc(pts[0].x, pts[0].y, strokeWidth(s.size, pts[0].p, s.tool) / 2, 0, Math.PI * 2);
    ctx.fill();
  } else if (s.tool === "pen") {
    // Variable width: one smoothed segment per point, width from pressure.
    for (let i = 1; i < pts.length; i++) {
      const a = pts[i - 1];
      const b = pts[i];
      const prev = pts[i - 2] ?? a;
      ctx.beginPath();
      ctx.lineWidth = strokeWidth(s.size, b.p, "pen");
      ctx.moveTo((prev.x + a.x) / 2, (prev.y + a.y) / 2);
      ctx.quadraticCurveTo(a.x, a.y, (a.x + b.x) / 2, (a.y + b.y) / 2);
      ctx.stroke();
    }
  } else {
    // Marker / eraser: one continuous path so translucent ink doesn't stack.
    ctx.beginPath();
    ctx.lineWidth = strokeWidth(s.size, 0.5, s.tool);
    ctx.moveTo(pts[0].x, pts[0].y);
    for (let i = 1; i < pts.length - 1; i++) {
      const mx = (pts[i].x + pts[i + 1].x) / 2;
      const my = (pts[i].y + pts[i + 1].y) / 2;
      ctx.quadraticCurveTo(pts[i].x, pts[i].y, mx, my);
    }
    const last = pts[pts.length - 1];
    ctx.lineTo(last.x, last.y);
    ctx.stroke();
  }
  ctx.restore();
}

export default function SketchCanvas({
  apiRef,
  baseImageUrl,
  guideUrl,
  onChange,
}: {
  apiRef: RefObject<SketchCanvasHandle | null>;
  // Existing sketch being edited — drawn as the starting layer.
  baseImageUrl?: string;
  // Figure guide shown faintly under the drawing; never exported.
  guideUrl?: string | null;
  onChange?: (state: { dirty: boolean; empty: boolean }) => void;
}) {
  const mainRef = useRef<HTMLCanvasElement>(null);
  const liveRef = useRef<HTMLCanvasElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const baseRef = useRef<HTMLImageElement | null>(null);
  const actionsRef = useRef<Action[]>([]);
  const redoRef = useRef<Action[]>([]);
  const currentRef = useRef<Extract<Action, { type: "stroke" }> | null>(null);
  const penSeenRef = useRef(false);

  const [tool, setTool] = useState<Tool>("pen");
  const [color, setColor] = useState(SWATCHES[0]);
  const [size, setSize] = useState(4);
  const [paper, setPaper] = useState<Paper>("blank");
  const [guideOpacity, setGuideOpacity] = useState(0.35);
  const [history, setHistory] = useState({ undo: 0, redo: 0 });
  const [baseError, setBaseError] = useState(false);

  const isEmpty = useCallback(() => {
    const acts = actionsRef.current;
    const lastClear = acts.map((a) => a.type).lastIndexOf("clear");
    const after = acts.slice(lastClear + 1);
    const hasBase = Boolean(baseRef.current) && lastClear === -1;
    return !hasBase && !after.some((a) => a.type !== "clear");
  }, []);

  const redraw = useCallback(() => {
    const ctx = mainRef.current?.getContext("2d");
    if (!ctx) return;
    ctx.clearRect(0, 0, SKETCH_WIDTH, SKETCH_HEIGHT);
    if (baseRef.current) {
      const r = containRect(baseRef.current);
      ctx.drawImage(baseRef.current, r.x, r.y, r.w, r.h);
    }
    for (const a of actionsRef.current) {
      if (a.type === "clear") ctx.clearRect(0, 0, SKETCH_WIDTH, SKETCH_HEIGHT);
      else if (a.type === "image") ctx.drawImage(a.img, a.x, a.y, a.w, a.h);
      else drawStroke(ctx, a);
    }
  }, []);

  const sync = useCallback(() => {
    setHistory({ undo: actionsRef.current.length, redo: redoRef.current.length });
    onChange?.({ dirty: actionsRef.current.length > 0, empty: isEmpty() });
  }, [onChange, isEmpty]);

  const commit = useCallback(
    (action: Action) => {
      actionsRef.current.push(action);
      redoRef.current = [];
      sync();
    },
    [sync]
  );

  // Load the saved sketch when editing.
  useEffect(() => {
    if (!baseImageUrl) return;
    let cancelled = false;
    loadImage(baseImageUrl, true)
      .then((img) => {
        if (cancelled) return;
        baseRef.current = img;
        redraw();
        onChange?.({ dirty: actionsRef.current.length > 0, empty: isEmpty() });
      })
      .catch(() => !cancelled && setBaseError(true));
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [baseImageUrl]);

  const undo = useCallback(() => {
    const a = actionsRef.current.pop();
    if (!a) return;
    redoRef.current.push(a);
    redraw();
    sync();
  }, [redraw, sync]);

  const redo = useCallback(() => {
    const a = redoRef.current.pop();
    if (!a) return;
    actionsRef.current.push(a);
    redraw();
    sync();
  }, [redraw, sync]);

  const clear = () => {
    if (isEmpty()) return;
    commit({ type: "clear" });
    redraw();
  };

  useImperativeHandle(
    apiRef,
    () => ({
      exportBlob: () =>
        new Promise((resolve) => {
          const out = document.createElement("canvas");
          out.width = SKETCH_WIDTH;
          out.height = SKETCH_HEIGHT;
          const ctx = out.getContext("2d");
          if (!ctx || !mainRef.current) return resolve(null);
          ctx.fillStyle = "#FFFFFF";
          ctx.fillRect(0, 0, SKETCH_WIDTH, SKETCH_HEIGHT);
          ctx.drawImage(mainRef.current, 0, 0);
          out.toBlob((blob) => resolve(blob), "image/png");
        }),
    }),
    []
  );

  // Keyboard shortcuts: ⌘/Ctrl+Z, ⌘/Ctrl+Shift+Z, B / M / E for tools.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      if (["INPUT", "TEXTAREA", "SELECT"].includes(target.tagName)) return;
      const mod = e.metaKey || e.ctrlKey;
      if (mod && e.key.toLowerCase() === "z") {
        e.preventDefault();
        if (e.shiftKey) redo();
        else undo();
      } else if (!mod && e.key === "b") setTool("pen");
      else if (!mod && e.key === "m") setTool("marker");
      else if (!mod && e.key === "e") setTool("eraser");
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [undo, redo]);

  const toPoint = (e: React.PointerEvent<HTMLCanvasElement>): Point => {
    const rect = e.currentTarget.getBoundingClientRect();
    return {
      x: ((e.clientX - rect.left) / rect.width) * SKETCH_WIDTH,
      y: ((e.clientY - rect.top) / rect.height) * SKETCH_HEIGHT,
      p: e.pointerType === "pen" ? e.pressure || 0.5 : 0.5,
    };
  };

  const renderLive = () => {
    const ctx = liveRef.current?.getContext("2d");
    const s = currentRef.current;
    if (!ctx) return;
    ctx.clearRect(0, 0, SKETCH_WIDTH, SKETCH_HEIGHT);
    if (s && s.tool !== "eraser") drawStroke(ctx, s);
  };

  const onPointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (e.pointerType === "mouse" && e.button !== 0) return;
    if (e.pointerType === "pen") penSeenRef.current = true;
    // Palm rejection: once a stylus is used, ignore touches.
    if (e.pointerType === "touch" && penSeenRef.current) return;
    e.currentTarget.setPointerCapture(e.pointerId);
    currentRef.current = { type: "stroke", tool, color, size, points: [toPoint(e)] };
    renderLive();
  };

  const onPointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const s = currentRef.current;
    if (!s) return;
    const events = e.nativeEvent.getCoalescedEvents?.() ?? [e.nativeEvent];
    for (const ev of events) {
      const rect = e.currentTarget.getBoundingClientRect();
      s.points.push({
        x: ((ev.clientX - rect.left) / rect.width) * SKETCH_WIDTH,
        y: ((ev.clientY - rect.top) / rect.height) * SKETCH_HEIGHT,
        p: ev.pointerType === "pen" ? ev.pressure || 0.5 : 0.5,
      });
    }
    if (s.tool === "eraser") {
      // Erase straight onto the main layer so the effect is visible live.
      redraw();
      const ctx = mainRef.current?.getContext("2d");
      if (ctx) drawStroke(ctx, s);
    } else {
      renderLive();
    }
  };

  const onPointerUp = () => {
    const s = currentRef.current;
    if (!s) return;
    currentRef.current = null;
    renderLive();
    commit(s);
    redraw();
  };

  const importPhoto = async (file: File) => {
    const url = URL.createObjectURL(file);
    try {
      const img = await loadImage(url);
      commit({ type: "image", img, ...containRect(img) });
      redraw();
    } finally {
      // The decoded image stays usable after the URL is revoked.
      URL.revokeObjectURL(url);
    }
  };

  const toolBtn = (active: boolean) =>
    `w-10 h-10 rounded-xl flex items-center justify-center transition-colors ${
      active ? "bg-[#ED1280] text-white shadow-sm" : "text-[#4a4a4a] hover:bg-[#F7F2F4]"
    }`;

  const TOOLS: { value: Tool; label: string; icon: typeof PenTool; key: string }[] = [
    { value: "pen", label: "Pen", icon: PenTool, key: "B" },
    { value: "marker", label: "Marker", icon: Highlighter, key: "M" },
    { value: "eraser", label: "Eraser", icon: Eraser, key: "E" },
  ];

  return (
    <div className="flex flex-col gap-3">
      {/* Toolbar */}
      <div className="bg-white rounded-2xl shadow-sm p-2 flex flex-wrap items-center gap-1.5">
        {TOOLS.map(({ value, label, icon: Icon, key }) => (
          <button key={value} type="button" title={`${label} (${key})`} aria-label={label} onClick={() => setTool(value)} className={toolBtn(tool === value)}>
            <Icon className="w-[18px] h-[18px]" strokeWidth={2} />
          </button>
        ))}

        <span className="w-px h-7 bg-[#F2E8ED] mx-1" />

        <div className="flex items-center gap-1">
          {SWATCHES.map((c) => (
            <button
              key={c}
              type="button"
              aria-label={`Colour ${c}`}
              onClick={() => {
                setColor(c);
                if (tool === "eraser") setTool("pen");
              }}
              className={`w-6 h-6 rounded-full border-2 transition-transform ${color === c && tool !== "eraser" ? "border-[#121212] scale-110" : "border-white shadow"}`}
              style={{ backgroundColor: c }}
            />
          ))}
          <label className="w-6 h-6 rounded-full border-2 border-white shadow overflow-hidden cursor-pointer relative" title="Custom colour">
            <span className="absolute inset-0 bg-[conic-gradient(red,yellow,lime,cyan,blue,magenta,red)]" />
            <input
              type="color"
              value={color}
              onChange={(e) => {
                setColor(e.target.value);
                if (tool === "eraser") setTool("pen");
              }}
              className="opacity-0 w-full h-full cursor-pointer"
            />
          </label>
        </div>

        <span className="w-px h-7 bg-[#F2E8ED] mx-1" />

        <label className="flex items-center gap-2 px-1" title="Brush size">
          <span className="rounded-full bg-[#121212] shrink-0" style={{ width: Math.max(3, size * 1.2), height: Math.max(3, size * 1.2), maxWidth: 18, maxHeight: 18 }} />
          <input type="range" min={1} max={20} value={size} onChange={(e) => setSize(Number(e.target.value))} className="w-24 accent-[#ED1280]" />
        </label>

        <div className="flex items-center gap-1 ml-auto">
          <button type="button" title="Undo (⌘Z)" aria-label="Undo" onClick={undo} disabled={history.undo === 0} className={`${toolBtn(false)} disabled:opacity-30`}>
            <Undo2 className="w-[18px] h-[18px]" strokeWidth={2} />
          </button>
          <button type="button" title="Redo (⇧⌘Z)" aria-label="Redo" onClick={redo} disabled={history.redo === 0} className={`${toolBtn(false)} disabled:opacity-30`}>
            <Redo2 className="w-[18px] h-[18px]" strokeWidth={2} />
          </button>
          <button
            type="button"
            title="Paper"
            aria-label="Change paper"
            onClick={() => setPaper((p) => (p === "blank" ? "grid" : p === "grid" ? "dots" : "blank"))}
            className={toolBtn(paper !== "blank")}
          >
            <Grid3x3 className="w-[18px] h-[18px]" strokeWidth={2} />
          </button>
          <button type="button" title="Import a photo of a paper sketch" aria-label="Import photo" onClick={() => fileRef.current?.click()} className={toolBtn(false)}>
            <ImagePlus className="w-[18px] h-[18px]" strokeWidth={2} />
          </button>
          <button type="button" title="Clear canvas (undoable)" aria-label="Clear" onClick={clear} className={`${toolBtn(false)} hover:!text-rose-500`}>
            <Trash2 className="w-[18px] h-[18px]" strokeWidth={2} />
          </button>
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) importPhoto(file);
              e.target.value = "";
            }}
          />
        </div>
      </div>

      {/* Paper */}
      <div
        className="relative w-full rounded-2xl overflow-hidden shadow-sm bg-white select-none"
        style={{
          aspectRatio: `${SKETCH_WIDTH} / ${SKETCH_HEIGHT}`,
          backgroundImage: PAPER_BG[paper],
          backgroundSize: paper === "blank" ? undefined : "24px 24px",
        }}
      >
        {guideUrl && (
          <img
            src={guideUrl}
            alt=""
            draggable={false}
            className="absolute inset-0 w-full h-full object-contain pointer-events-none"
            style={{ opacity: guideOpacity }}
          />
        )}
        <canvas ref={mainRef} width={SKETCH_WIDTH} height={SKETCH_HEIGHT} className="absolute inset-0 w-full h-full pointer-events-none" />
        <canvas
          ref={liveRef}
          width={SKETCH_WIDTH}
          height={SKETCH_HEIGHT}
          className={`absolute inset-0 w-full h-full touch-none ${tool === "eraser" ? "cursor-cell" : "cursor-crosshair"}`}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerCancel={onPointerUp}
        />
        {baseError && (
          <p className="absolute top-3 left-3 right-3 text-[12px] text-rose-600 bg-white/90 rounded-lg px-3 py-2">
            Couldn't load the saved sketch. Drawing on a blank page.
          </p>
        )}
      </div>

      {guideUrl && (
        <label className="flex items-center gap-3 text-[12px] text-[#65799A] px-1">
          Figure guide
          <input
            type="range"
            min={0.1}
            max={0.8}
            step={0.05}
            value={guideOpacity}
            onChange={(e) => setGuideOpacity(Number(e.target.value))}
            className="w-32 accent-[#ED1280]"
          />
          <span className="text-[11px]">The guide isn't saved with your sketch.</span>
        </label>
      )}
    </div>
  );
}
