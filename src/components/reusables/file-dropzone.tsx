import { useRef, useState } from "react";
import type { DragEvent } from "react";
import { UploadCloud, X } from "lucide-react";

interface FileDropzoneProps {
  label?: string;
  hint?: string;
  accept?: string;
  onFileSelect?: (file: File | null) => void;
  error?: string;
}

export default function FileDropzone({
  label,
  hint = "PDF, PNG, JPG, GIF up to 10MB",
  accept,
  onFileSelect,
  error,
}: FileDropzoneProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [dragActive, setDragActive] = useState(false);

  const handleFile = (file: File | null) => {
    setFileName(file?.name ?? null);
    onFileSelect?.(file);
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragActive(false);
    handleFile(e.dataTransfer.files?.[0] ?? null);
  };

  return (
    <div className="flex flex-col gap-2">
      {label && <label className="text-[14px] font-bold text-[#121212]">{label}</label>}

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
        {fileName ? (
          <div className="flex items-center justify-center gap-2 text-sm">
            <span className="text-[#333333] font-medium truncate max-w-[220px]">{fileName}</span>
            <button
              type="button"
              onClick={() => handleFile(null)}
              className="text-[#95959D] hover:text-[#ED1280] transition-colors"
              aria-label="Remove file"
            >
              <X className="w-4 h-4" strokeWidth={2} />
            </button>
          </div>
        ) : (
          <>
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              className="text-[#ED1280] font-medium text-sm hover:opacity-80 transition-opacity"
            >
              Upload a file
            </button>
            <span className="text-sm text-[#65799A]"> or drag and drop</span>
            <p className="text-xs text-[#95959D] mt-1">{hint}</p>
          </>
        )}
        <input
          ref={inputRef}
          type="file"
          accept={accept}
          className="hidden"
          onChange={(e) => handleFile(e.target.files?.[0] ?? null)}
        />
      </div>

      {error && <span className="text-[#FF0101] text-[12px]">{error}</span>}
    </div>
  );
}
