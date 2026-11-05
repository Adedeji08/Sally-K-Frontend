import { useEffect, useRef, useState } from "react";
import type { DragEvent } from "react";
import { Pencil, UploadCloud } from "lucide-react";
import { ClipLoader } from "react-spinners";

interface ImageUploadFieldProps {
  label?: string;
  hint?: string;
  accept?: string;
  // Performs the actual upload (API call lives with the caller, who already
  // has the endpoint + auth + toast wiring) and resolves to the hosted URL,
  // or null if the upload failed.
  onUpload: (file: File) => Promise<string | null>;
  // Fires with the uploaded URL once an upload succeeds, or null once the
  // image is cleared / an upload fails — lets the parent track it in form state.
  onUploaded?: (url: string | null) => void;
  // An already-hosted image URL (e.g. an existing brand logo pulled from the
  // API). Shown as the preview until the user picks a new file.
  initialUrl?: string | null;
  error?: string;
}

export default function ImageUploadField({
  label,
  hint = "PNG, JPG, GIF up to 10MB",
  accept = "image/*",
  onUpload,
  onUploaded,
  initialUrl = null,
  error,
}: ImageUploadFieldProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(initialUrl);
  const [dragActive, setDragActive] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  useEffect(() => {
    return () => {
      // Only object URLs need revoking; a hosted https URL must be left alone.
      if (previewUrl && previewUrl.startsWith("blob:")) URL.revokeObjectURL(previewUrl);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [previewUrl]);

  // Adopt a hosted URL that arrives after mount (data loads async), but never
  // clobber a local preview the user just picked.
  useEffect(() => {
    setPreviewUrl((prev) => (prev && prev.startsWith("blob:") ? prev : initialUrl));
  }, [initialUrl]);

  const handleFile = async (file: File | null) => {
    if (!file) return;

    setUploadError(null);
    setFileName(file.name);
    setPreviewUrl((prev) => {
      if (prev && prev.startsWith("blob:")) URL.revokeObjectURL(prev);
      return URL.createObjectURL(file);
    });

    setUploading(true);
    const url = await onUpload(file);
    setUploading(false);

    if (!url) {
      setUploadError("Upload failed. Try again.");
      onUploaded?.(null);
      return;
    }

    onUploaded?.(url);
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragActive(false);
    handleFile(e.dataTransfer.files?.[0] ?? null);
  };

  const openPicker = () => inputRef.current?.click();

  return (
    <div className="flex flex-col gap-2">
      {label && <label className="text-[14px] font-bold text-[#121212]">{label}</label>}

      {previewUrl ? (
        <div className="flex items-center gap-3">
          <div className="relative w-20 h-20 shrink-0">
            <div className="w-20 h-20 rounded-xl overflow-hidden border border-[#E5E7EB] bg-[#F2E8ED]">
              <img src={previewUrl} alt="Brand logo preview" className="w-full h-full object-cover" />
              {uploading && (
                <div className="absolute inset-0 bg-white/70 flex items-center justify-center">
                  <ClipLoader size={18} color="#ED1280" />
                </div>
              )}
            </div>
            <button
              type="button"
              onClick={openPicker}
              aria-label="Replace logo"
              className="absolute -top-2 -right-2 w-7 h-7 rounded-full bg-white shadow-md border border-[#E5E7EB] flex items-center justify-center text-[#ED1280] hover:bg-[#FDF1F7] transition-colors"
            >
              <Pencil className="w-3.5 h-3.5" strokeWidth={2} />
            </button>
          </div>

          <div className="flex flex-col min-w-0">
            <span className="text-[13px] font-medium text-[#333333] truncate max-w-[220px]">
              {fileName ?? "Current logo"}
            </span>
            <span className={`text-[12px] ${uploadError ? "text-[#FF0101]" : "text-[#65799A]"}`}>
              {uploading
                ? "Uploading..."
                : uploadError
                  ? uploadError
                  : fileName
                    ? "Uploaded"
                    : "Tap the pencil to replace"}
            </span>
          </div>
        </div>
      ) : (
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setDragActive(true);
          }}
          onDragLeave={() => setDragActive(false)}
          onDrop={handleDrop}
          className={`border-2 border-dashed rounded-xl p-6 text-center transition-colors ${
            dragActive ? "border-[#ED1280] bg-[#FDF1F7]" : "border-[#E5E7EB] bg-[#F2E8ED]/40"
          }`}
        >
          <UploadCloud className="w-6 h-6 text-[#95959D] mx-auto mb-2" strokeWidth={2} />
          <button
            type="button"
            onClick={openPicker}
            className="text-[#ED1280] font-medium text-sm hover:opacity-80 transition-opacity"
          >
            Upload a file
          </button>
          <span className="text-sm text-[#65799A]"> or drag and drop</span>
          <p className="text-xs text-[#95959D] mt-1">{hint}</p>
        </div>
      )}

      <input
        ref={inputRef}
        type="file"
        accept={accept}
        className="hidden"
        onChange={(e) => handleFile(e.target.files?.[0] ?? null)}
      />

      {error && <span className="text-[#FF0101] text-[12px]">{error}</span>}
    </div>
  );
}
