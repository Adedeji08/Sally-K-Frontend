import { useEffect, useRef, useState } from "react";
import { ClipLoader } from "react-spinners";
import { UploadCloud } from "lucide-react";
import Input from "../reusables/input";

interface ProductImageInputProps {
  index: number;
  value: string;
  onChange: (url: string) => void;
  // Uploads the picked file and resolves to the hosted URL (or null on failure).
  onUpload: (file: File) => Promise<string | null>;
  error?: string;
}

/**
 * A single product-image slot that accepts EITHER a pasted image URL (used as-is,
 * no upload) OR a file picked from the computer (uploaded on select, and the
 * returned hosted URL is what lands in form state).
 */
export default function ProductImageInput({
  index,
  value,
  onChange,
  onUpload,
  error,
}: ProductImageInputProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [localPreview, setLocalPreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  useEffect(() => {
    return () => {
      if (localPreview) URL.revokeObjectURL(localPreview);
    };
  }, [localPreview]);

  const clearLocalPreview = () => {
    setLocalPreview((prev) => {
      if (prev) URL.revokeObjectURL(prev);
      return null;
    });
  };

  const handleFile = async (file: File | null) => {
    if (!file) return;
    setUploadError(null);

    const preview = URL.createObjectURL(file);
    setLocalPreview((prev) => {
      if (prev) URL.revokeObjectURL(prev);
      return preview;
    });

    setUploading(true);
    const url = await onUpload(file);
    setUploading(false);

    if (!url) {
      setUploadError("Upload failed. Try again.");
      return;
    }

    onChange(url);
  };

  const preview = localPreview ?? (value.trim() ? value : null);

  return (
    <div className="flex items-start gap-3">
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        aria-label={`Upload image ${index + 1} from your computer`}
        className="relative w-12 h-12 rounded-lg bg-[#F2E8ED] overflow-hidden shrink-0 flex items-center justify-center border border-[#E5E7EB] hover:border-[#ED1280] transition-colors"
      >
        {preview ? (
          <img
            src={preview}
            alt=""
            className="w-full h-full object-cover"
            onError={(e) => {
              (e.target as HTMLImageElement).style.visibility = "hidden";
            }}
          />
        ) : (
          <span className="text-[10px] text-[#95959D]">{index + 1}</span>
        )}
        {uploading && (
          <span className="absolute inset-0 bg-white/70 flex items-center justify-center">
            <ClipLoader size={14} color="#ED1280" />
          </span>
        )}
      </button>

      <div className="flex-1">
        <Input
          placeholder={`Paste image ${index + 1} URL${index === 0 ? "" : " (optional)"}`}
          value={value}
          onChange={(e) => {
            // A pasted / typed URL goes straight to form state — no upload call.
            clearLocalPreview();
            setUploadError(null);
            onChange(e.target.value);
          }}
          error={error ?? uploadError ?? undefined}
          autoComplete="off"
        />
      </div>

      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        disabled={uploading}
        className="flex items-center gap-1 text-[#ED1280] text-xs font-semibold hover:opacity-80 transition-opacity shrink-0 mt-4 disabled:opacity-50"
      >
        <UploadCloud className="w-3.5 h-3.5" strokeWidth={2} />
        {uploading ? "Uploading" : "Upload"}
      </button>

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          handleFile(e.target.files?.[0] ?? null);
          e.target.value = "";
        }}
      />
    </div>
  );
}
