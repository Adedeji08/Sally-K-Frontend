import { useState } from "react";
import { ShieldCheck } from "lucide-react";
import { Controller, useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import AuthShell from "../../layouts/auth-shell";
import Input from "../../components/reusables/input";
import Select from "../../components/reusables/select";
import Button from "../../components/reusables/button";
import FileDropzone from "../../components/reusables/file-dropzone";
import { useSeller } from "../../context/seller-context";

interface VerificationFormValues {
  documentType: string;
  documentNumber: string;
  businessType: string;
  businessRegNumber: string;
}

const DOCUMENT_TYPE_OPTIONS = [
  { value: "nin", label: "National ID (NIN)" },
  { value: "passport", label: "International Passport" },
  { value: "license", label: "Driver's License" },
  { value: "voter_card", label: "Voter's Card" },
];

const BUSINESS_TYPE_OPTIONS = [
  { value: "sole_proprietorship", label: "Sole Proprietorship" },
  { value: "llc", label: "Limited Liability Company (LLC)" },
  { value: "partnership", label: "Partnership" },
  { value: "corporation", label: "Corporation" },
];

const Verification = () => {
  const navigate = useNavigate();
  const { markVerified } = useSeller();
  const { control, handleSubmit } = useForm<VerificationFormValues>();

  const [documentFile, setDocumentFile] = useState<File | null>(null);
  const [documentFileError, setDocumentFileError] = useState("");
  const [, setBusinessDocumentFile] = useState<File | null>(null);
  const [confirmed, setConfirmed] = useState(false);
  const [confirmError, setConfirmError] = useState("");

  const onSubmit = () => {
    let hasError = false;

    if (!documentFile) {
      setDocumentFileError("Please upload your identification document");
      hasError = true;
    } else {
      setDocumentFileError("");
    }

    if (!confirmed) {
      setConfirmError("Please confirm the information provided is accurate");
      hasError = true;
    } else {
      setConfirmError("");
    }

    if (hasError) return;

    markVerified();
    navigate("/onboarding/bank-account");
  };

  return (
    <AuthShell
      title="KYC & Document Upload"
      step={{ current: 3, total: 3, labels: ["Account", "Store", "Verify"] }}
    >
      <div className="flex items-start gap-3 bg-[#F2E8ED] rounded-xl p-3 mb-6">
        <ShieldCheck className="w-5 h-5 text-[#ED1280] shrink-0 mt-0.5" strokeWidth={2} />
        <p className="text-[12px] text-[#4a4a4a]">
          To ensure the safety and security of our marketplace, please upload the required
          documents to verify your identity. This usually takes less than 2 minutes, and your
          storefront stays live while we review it.
        </p>
      </div>

      <form className="flex flex-col gap-6" onSubmit={handleSubmit(onSubmit)}>
        <div className="flex flex-col gap-4">
          <h2 className="text-[14px] font-bold text-[#121212] border-b border-[#12121215] pb-2">
            Personal Identification
          </h2>

          <Controller
            name="documentType"
            control={control}
            rules={{ required: "Select a document type" }}
            render={({ field, fieldState }) => (
              <Select
                label="Document type"
                options={DOCUMENT_TYPE_OPTIONS}
                value={field.value}
                onChange={field.onChange}
                error={fieldState.error?.message}
              />
            )}
          />

          <Controller
            name="documentNumber"
            control={control}
            rules={{ required: "Document number is required" }}
            render={({ field, fieldState }) => (
              <Input
                label="Document number"
                placeholder="Enter document number"
                value={field.value}
                onChange={field.onChange}
                error={fieldState.error?.message}
                autoComplete="off"
              />
            )}
          />

          <FileDropzone
            label="Upload document"
            hint="PDF, PNG, JPG, GIF up to 10MB"
            accept="application/pdf,image/*"
            onFileSelect={setDocumentFile}
            error={documentFileError}
          />
        </div>

        <div className="flex flex-col gap-4">
          <h2 className="text-[14px] font-bold text-[#121212] border-b border-[#12121215] pb-2">
            Business Verification (Optional)
          </h2>

          <Controller
            name="businessType"
            control={control}
            render={({ field }) => (
              <Select
                label="Business type"
                options={BUSINESS_TYPE_OPTIONS}
                value={field.value}
                onChange={field.onChange}
              />
            )}
          />

          <Controller
            name="businessRegNumber"
            control={control}
            render={({ field }) => (
              <Input
                label="Business registration number"
                placeholder="Enter registration number"
                value={field.value}
                onChange={field.onChange}
                autoComplete="off"
              />
            )}
          />

          <FileDropzone
            label="Upload business document"
            hint="PDF, PNG, JPG, GIF up to 10MB"
            accept="application/pdf,image/*"
            onFileSelect={setBusinessDocumentFile}
          />
        </div>

        <div>
          <label className="flex items-start gap-2.5 text-[13px] text-[#4a4a4a] cursor-pointer">
            <input
              type="checkbox"
              checked={confirmed}
              onChange={(e) => {
                setConfirmed(e.target.checked);
                if (e.target.checked) setConfirmError("");
              }}
              className="mt-0.5 accent-[#ED1280]"
            />
            I confirm that the information provided is accurate and complete.
          </label>
          {confirmError && <p className="text-[#FF0101] text-[12px] mt-1">{confirmError}</p>}
        </div>

        <Button size="lg" variant="primary" type="submit" className="font-normal">
          Submit for Verification
        </Button>

        <button
          type="button"
          onClick={() => navigate("/")}
          className="text-[#0867AC] hover:text-[#35D081] font-normal text-sm text-center -mt-2"
        >
          I'll do this later
        </button>
      </form>
    </AuthShell>
  );
};

export default Verification;
