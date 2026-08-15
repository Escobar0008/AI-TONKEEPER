"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  ShieldCheck,
  User,
  Mail,
  Phone,
  Calendar,
  MapPin,
  CreditCard,
  Camera,
  FileText,
  Upload,
  CheckCircle,
  Clock3,
  AlertTriangle,
  X,
  Loader2,
} from "lucide-react";

// ============================================================
// TYPES
// ============================================================

type DocumentType =
  | "ID_DOCUMENT"
  | "SELFIE"
  | "ADDRESS_PROOF";

type KYCStatus =
  | "PENDING"
  | "UNDER_REVIEW"
  | "VERIFIED"
  | "REJECTED";

type KYCDocument = {
  id: string;
  type: string;
  fileName: string;
  mimeType: string;
  fileSize: number;
  createdAt?: string;
  updatedAt?: string;
};

type KYCApplication = {
  id: string;
  fullName: string | null;
  email: string | null;
  phone: string | null;
  birthDate: string | null;
  country: string | null;
  status: KYCStatus;
  rejectionReason: string | null;
  reviewedAt: string | null;
  createdAt: string;
  updatedAt: string;
  documents: KYCDocument[];
};

// ============================================================
// CONSTANTS
// ============================================================

const MAX_FILE_SIZE = 10 * 1024 * 1024;

const ALLOWED_IMAGE_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
];

const ALLOWED_DOCUMENT_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "application/pdf",
];

// ============================================================
// DOCUMENT TYPE NORMALIZER
// ============================================================

function normalizeDocumentType(
  type: string
): DocumentType | null {
  const normalized = type
    .toUpperCase()
    .replace(/[-\s]/g, "_");

  if (
    normalized === "ID" ||
    normalized === "ID_DOCUMENT" ||
    normalized === "GOVERNMENT_ID" ||
    normalized === "IDENTITY_DOCUMENT"
  ) {
    return "ID_DOCUMENT";
  }

  if (
    normalized === "SELFIE" ||
    normalized === "SELFIE_DOCUMENT"
  ) {
    return "SELFIE";
  }

  if (
    normalized === "ADDRESS" ||
    normalized === "ADDRESS_PROOF" ||
    normalized === "PROOF_OF_ADDRESS"
  ) {
    return "ADDRESS_PROOF";
  }

  return null;
}

// ============================================================
// PAGE
// ============================================================

export default function KYCPage() {
  const router = useRouter();

  const idInputRef =
    useRef<HTMLInputElement>(null);

  const selfieInputRef =
    useRef<HTMLInputElement>(null);

  const addressInputRef =
    useRef<HTMLInputElement>(null);

  // ==========================================================
  // PERSONAL INFORMATION
  // ==========================================================

  const [fullName, setFullName] =
    useState("");

  const [email, setEmail] =
    useState("");

  const [phone, setPhone] =
    useState("");

  const [birthDate, setBirthDate] =
    useState("");

  const [country, setCountry] =
    useState("");

  // ==========================================================
  // LOCAL FILES
  // ==========================================================

  const [idFile, setIdFile] =
    useState<File | null>(null);

  const [selfieFile, setSelfieFile] =
    useState<File | null>(null);

  const [addressFile, setAddressFile] =
    useState<File | null>(null);

  // ==========================================================
  // SERVER KYC
  // ==========================================================

  const [kycApplication, setKycApplication] =
    useState<KYCApplication | null>(null);

  const [loadingStatus, setLoadingStatus] =
    useState(true);

  // ==========================================================
  // UI
  // ==========================================================

  const [error, setError] =
    useState("");

  const [success, setSuccess] =
    useState("");

  const [submitting, setSubmitting] =
    useState(false);

  // ==========================================================
  // LOAD KYC STATUS
  // ==========================================================

  async function loadLatestStatus() {
    try {
      setLoadingStatus(true);
      setError("");

      const response = await fetch(
        "/api/kyc/status",
        {
          method: "GET",
          cache: "no-store",
          headers: {
            "Cache-Control": "no-cache",
          },
        }
      );

      const data =
        await response.json();

      if (!response.ok) {
        throw new Error(
          data?.message ||
            "Unable to load KYC status."
        );
      }

      if (!data?.application) {
        setKycApplication(null);
        setFullName("");
        setEmail("");
        setPhone("");
        setBirthDate("");
        setCountry("");
        return;
      }

      const application =
        data.application as KYCApplication;

      setKycApplication(application);

      setFullName(
        application.fullName || ""
      );

      setEmail(
        application.email || ""
      );

      setPhone(
        application.phone || ""
      );

      setBirthDate(
        application.birthDate
          ? application.birthDate.substring(
              0,
              10
            )
          : ""
      );

      setCountry(
        application.country || ""
      );
    } catch (statusError) {
      console.error(
        "KYC STATUS ERROR:",
        statusError
      );

      setError(
        statusError instanceof Error
          ? statusError.message
          : "Unable to load KYC status."
      );
    } finally {
      setLoadingStatus(false);
    }
  }

  // ==========================================================
  // INITIAL LOAD
  // ==========================================================

  useEffect(() => {
    loadLatestStatus();
  }, []);

  // ==========================================================
  // STATUS
  // ==========================================================

  const status =
    kycApplication?.status || null;

  const isVerified =
    status === "VERIFIED";

  const isPending =
    status === "PENDING";

  const isUnderReview =
    status === "UNDER_REVIEW";

  const isRejected =
    status === "REJECTED";

  const isBeingProcessed =
    isPending || isUnderReview;

  // ==========================================================
  // SERVER DOCUMENT CHECK
  // ==========================================================

  function hasServerDocument(
    type: DocumentType
  ) {
    if (!kycApplication?.documents) {
      return false;
    }

    return kycApplication.documents.some(
      (document) =>
        normalizeDocumentType(
          document.type
        ) === type
    );
  }

  // ==========================================================
  // DOCUMENT STATUS
  // ==========================================================

  const idUploaded =
    !!idFile ||
    hasServerDocument("ID_DOCUMENT");

  const selfieUploaded =
    !!selfieFile ||
    hasServerDocument("SELFIE");

  const addressUploaded =
    !!addressFile ||
    hasServerDocument("ADDRESS_PROOF");

  // ==========================================================
  // PERSONAL INFORMATION
  // ==========================================================

  const personalInformationComplete =
    fullName.trim() !== "" &&
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
      email.trim()
    ) &&
    phone.trim() !== "" &&
    birthDate !== "" &&
    country.trim() !== "";

  // ==========================================================
  // DOCUMENTS
  // ==========================================================

  const documentsComplete =
    idUploaded &&
    selfieUploaded &&
    addressUploaded;

  // ==========================================================
  // COMPLETE
  // ==========================================================

  const isComplete =
    personalInformationComplete &&
    documentsComplete;

  // ==========================================================
  // PROGRESS
  // ==========================================================

  function getProgressStep() {
    if (
      isVerified ||
      isBeingProcessed
    ) {
      return 3;
    }

    if (
      personalInformationComplete &&
      documentsComplete
    ) {
      return 3;
    }

    if (
      personalInformationComplete
    ) {
      return 2;
    }

    return 1;
  }

  const progressStep =
    getProgressStep();

  // ==========================================================
  // STATUS LABEL
  // ==========================================================

  function formatStatus(
    currentStatus: KYCStatus
  ) {
    switch (currentStatus) {
      case "PENDING":
        return "Pending Review";

      case "UNDER_REVIEW":
        return "Under Review";

      case "VERIFIED":
        return "Verified";

      case "REJECTED":
        return "Rejected";

      default:
        return currentStatus;
    }
  }

  // ==========================================================
  // FILE VALIDATION
  // ==========================================================

  function validateFile(
    file: File,
    type: DocumentType
  ): string | null {
    if (file.size <= 0) {
      return "The selected file is empty.";
    }

    if (file.size > MAX_FILE_SIZE) {
      return (
        "File is too large. Maximum size is 10 MB."
      );
    }

    if (type === "SELFIE") {
      if (
        !ALLOWED_IMAGE_TYPES.includes(
          file.type
        )
      ) {
        return (
          "Selfie must be JPG, PNG or WEBP."
        );
      }

      return null;
    }

    if (
      !ALLOWED_DOCUMENT_TYPES.includes(
        file.type
      )
    ) {
      return (
        "File must be JPG, PNG, WEBP or PDF."
      );
    }

    return null;
  }

  // ==========================================================
  // SELECT FILE
  // ==========================================================

  function handleFileSelect(
    event: React.ChangeEvent<HTMLInputElement>,
    type: DocumentType
  ) {
    const file =
      event.target.files?.[0];

    if (!file) {
      return;
    }

    setError("");
    setSuccess("");

    const validationError =
      validateFile(
        file,
        type
      );

    if (validationError) {
      setError(validationError);
      event.target.value = "";
      return;
    }

    if (type === "ID_DOCUMENT") {
      setIdFile(file);
    }

    if (type === "SELFIE") {
      setSelfieFile(file);
    }

    if (type === "ADDRESS_PROOF") {
      setAddressFile(file);
    }

    event.target.value = "";
  }

  // ==========================================================
  // REMOVE LOCAL FILE
  // ==========================================================

  function removeFile(
    type: DocumentType
  ) {
    setError("");
    setSuccess("");

    if (type === "ID_DOCUMENT") {
      setIdFile(null);
    }

    if (type === "SELFIE") {
      setSelfieFile(null);
    }

    if (type === "ADDRESS_PROOF") {
      setAddressFile(null);
    }
  }

  // ==========================================================
  // PERSONAL INFORMATION VALIDATION
  // ==========================================================

  function validatePersonalInformation():
    | string
    | null {
    if (!fullName.trim()) {
      return (
        "Please enter your full name."
      );
    }

    if (!email.trim()) {
      return (
        "Please enter your email address."
      );
    }

    if (
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
        email.trim()
      )
    ) {
      return (
        "Please enter a valid email address."
      );
    }

    if (!phone.trim()) {
      return (
        "Please enter your phone number."
      );
    }

    if (!birthDate) {
      return (
        "Please enter your date of birth."
      );
    }

    if (!country.trim()) {
      return (
        "Please enter your country or region."
      );
    }

    return null;
  }

  // ==========================================================
  // UPLOAD DOCUMENT
  // IMPORTANT:
  // Prisma enum values are sent to the API.
  // ==========================================================

  async function uploadDocument(
    type: DocumentType,
    file: File
  ) {
    const formData =
      new FormData();

    formData.append(
      "type",
      type
    );

    formData.append(
      "file",
      file
    );

    const response =
      await fetch(
        "/api/kyc/upload",
        {
          method: "POST",
          body: formData,
        }
      );

    const data =
      await response.json();

    if (!response.ok) {
      throw new Error(
        data?.message ||
          `Unable to upload ${type} document.`
      );
    }

    return data;
  }

  // ==========================================================
  // SUBMIT KYC
  // ==========================================================

  async function handleSubmit() {
    if (submitting) {
      return;
    }

    setError("");
    setSuccess("");

    if (isVerified) {
      setError(
        "Your identity has already been verified."
      );
      return;
    }

    if (isBeingProcessed) {
      setError(
        "Your KYC application is already being processed."
      );
      return;
    }

    const personalError =
      validatePersonalInformation();

    if (personalError) {
      setError(personalError);
      return;
    }

    if (!idUploaded) {
      setError(
        "Please upload your ID card or passport."
      );
      return;
    }

    if (!selfieUploaded) {
      setError(
        "Please upload your selfie."
      );
      return;
    }

    if (!addressUploaded) {
      setError(
        "Please upload your proof of address."
      );
      return;
    }

    try {
      setSubmitting(true);

      // ======================================================
      // 1. SAVE APPLICATION
      // ======================================================

      const applicationResponse =
        await fetch(
          "/api/kyc/application",
          {
            method: "POST",
            headers: {
              "Content-Type":
                "application/json",
            },
            body: JSON.stringify({
              fullName:
                fullName.trim(),

              email:
                email.trim(),

              phone:
                phone.trim(),

              birthDate,

              country:
                country.trim(),
            }),
          }
        );

      const applicationData =
        await applicationResponse.json();

      if (!applicationResponse.ok) {
        throw new Error(
          applicationData?.message ||
            "Unable to save your KYC information."
        );
      }

      // ======================================================
      // 2. UPLOAD ID
      // ======================================================

      if (idFile) {
        await uploadDocument(
          "ID_DOCUMENT",
          idFile
        );
      }

      // ======================================================
      // 3. UPLOAD SELFIE
      // ======================================================

      if (selfieFile) {
        await uploadDocument(
          "SELFIE",
          selfieFile
        );
      }

      // ======================================================
      // 4. UPLOAD ADDRESS
      // ======================================================

      if (addressFile) {
        await uploadDocument(
          "ADDRESS_PROOF",
          addressFile
        );
      }

      // ======================================================
      // 5. SUBMIT
      // ======================================================

      const submitResponse =
        await fetch(
          "/api/kyc/submit",
          {
            method: "POST",
          }
        );

      const submitData =
        await submitResponse.json();

      if (!submitResponse.ok) {
        throw new Error(
          submitData?.message ||
            "Unable to submit your KYC application."
        );
      }

      // ======================================================
      // SUCCESS
      // ======================================================

      setSuccess(
        "Your KYC application has been submitted successfully and is now under review."
      );

      setIdFile(null);
      setSelfieFile(null);
      setAddressFile(null);

      await loadLatestStatus();
    } catch (submitError) {
      console.error(
        "KYC SUBMISSION ERROR:",
        submitError
      );

      setError(
        submitError instanceof Error
          ? submitError.message
          : "An unexpected error occurred while submitting your KYC."
      );
    } finally {
      setSubmitting(false);
    }
  }

  // ==========================================================
  // FILE HELPERS
  // ==========================================================

  function formatFileName(
    file: File | null
  ) {
    if (!file) {
      return "";
    }

    if (file.name.length <= 32) {
      return file.name;
    }

    return `${file.name.substring(
      0,
      27
    )}...`;
  }

  function formatFileSize(
    file: File | null
  ) {
    if (!file) {
      return "";
    }

    return `${(
      file.size /
      1024 /
      1024
    ).toFixed(2)} MB`;
  }

  // ==========================================================
  // DOCUMENT CARD
  // ==========================================================

  function DocumentCard({
    type,
    title,
    description,
    file,
    serverUploaded,
    icon,
    color,
    inputRef,
    accept,
  }: {
    type: DocumentType;
    title: string;
    description: string;
    file: File | null;
    serverUploaded: boolean;
    icon: React.ReactNode;
    color: string;
    inputRef: React.RefObject<
      HTMLInputElement | null
    >;
    accept: string;
  }) {
    const disabled =
      isVerified ||
      isPending ||
      isUnderReview ||
      submitting;

    // --------------------------------------------------------
    // SERVER DOCUMENT
    // --------------------------------------------------------

    if (
      serverUploaded &&
      !file
    ) {
      return (
        <div
          className={`mb-4 w-full rounded-2xl border ${color} bg-[#050B18] p-5`}
        >
          <div className="flex items-center gap-3">
            <CheckCircle
              size={30}
              className="shrink-0 text-green-400"
            />

            <div className="min-w-0 flex-1">
              <p className="font-semibold text-green-400">
                {title}
              </p>

              <p className="mt-1 text-sm text-slate-400">
                Document already uploaded.
              </p>
            </div>
          </div>

          {isRejected && (
            <>
              <input
                ref={inputRef}
                type="file"
                accept={accept}
                className="hidden"
                onChange={(event) =>
                  handleFileSelect(
                    event,
                    type
                  )
                }
              />

              <button
                type="button"
                disabled={submitting}
                onClick={() =>
                  inputRef.current?.click()
                }
                className="mt-4 w-full rounded-xl border border-slate-700 py-2 text-sm font-medium text-cyan-400 hover:border-cyan-500 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Replace File
              </button>
            </>
          )}
        </div>
      );
    }

    // --------------------------------------------------------
    // LOCAL FILE
    // --------------------------------------------------------

    return (
      <div
        className={`mb-4 w-full rounded-2xl border border-dashed ${color} bg-[#050B18] p-5`}
      >
        <input
          ref={inputRef}
          type="file"
          accept={accept}
          className="hidden"
          onChange={(event) =>
            handleFileSelect(
              event,
              type
            )
          }
        />

        {!file ? (
          <button
            type="button"
            disabled={disabled}
            onClick={() =>
              inputRef.current?.click()
            }
            className="flex w-full flex-col items-center disabled:cursor-not-allowed disabled:opacity-50"
          >
            <div className="mb-3">
              {icon}
            </div>

            <p className="text-center font-semibold">
              {title}
            </p>

            <p className="mt-2 text-center text-sm text-slate-400">
              {description}
            </p>

            <div className="mt-4 flex items-center gap-2 text-cyan-400">
              <Upload size={18} />

              <span>
                Select File
              </span>
            </div>
          </button>
        ) : (
          <div>
            <div className="flex items-center gap-3">
              <CheckCircle
                size={28}
                className="shrink-0 text-green-400"
              />

              <div className="min-w-0 flex-1">
                <p className="font-semibold text-green-400">
                  File Selected
                </p>

                <p className="truncate text-sm text-white">
                  {formatFileName(file)}
                </p>

                <p className="text-xs text-slate-500">
                  {formatFileSize(file)}
                </p>
              </div>

              <button
                type="button"
                disabled={disabled}
                onClick={() =>
                  removeFile(type)
                }
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-slate-700 bg-[#101A2C] text-slate-300 hover:border-red-500 hover:text-red-400 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <X size={18} />
              </button>
            </div>

            <button
              type="button"
              disabled={disabled}
              onClick={() =>
                inputRef.current?.click()
              }
              className="mt-4 w-full rounded-xl border border-slate-700 py-2 text-sm font-medium text-cyan-400 hover:border-cyan-500 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Replace File
            </button>
          </div>
        )}
      </div>
    );
  }

  // ==========================================================
  // LOADING
  // ==========================================================

  if (loadingStatus) {
    return (
      <main className="min-h-screen bg-[#050B18] text-white">
        <div className="mx-auto flex min-h-screen max-w-md items-center justify-center px-5">
          <div className="flex items-center gap-3 text-cyan-400">
            <Loader2
              size={25}
              className="animate-spin"
            />

            <span>
              Loading KYC status...
            </span>
          </div>
        </div>
      </main>
    );
  }

  // ==========================================================
  // PAGE
  // ==========================================================

  return (
    <main className="min-h-screen bg-[#050B18] pb-24 text-white">
      <div className="mx-auto max-w-md px-5 py-6">

        {/* HEADER */}

        <div className="mb-8 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={() =>
              router.back()
            }
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-slate-800 bg-[#101A2C] transition hover:border-cyan-500"
          >
            <ArrowLeft size={22} />
          </button>

          <h1 className="text-center text-xl font-bold">
            Identity Verification
          </h1>

          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-cyan-500 bg-cyan-500/10">
            <ShieldCheck
              size={22}
              className="text-cyan-400"
            />
          </div>
        </div>

        {/* TOP CARD */}

        <div className="mb-6 rounded-3xl border border-slate-800 bg-[#101A2C] p-6">
          <div className="flex items-center gap-4">
            <Image
              src="/logo.png"
              alt="AI TONKEEPER"
              width={70}
              height={70}
              className="h-[70px] w-[70px] shrink-0 rounded-full object-contain"
            />

            <div className="min-w-0 flex-1">
              <h2 className="text-xl font-bold">
                AI TONKEEPER
              </h2>

              <p className="mt-1 text-sm text-slate-400">
                Secure Identity Verification
              </p>

              <div
                className={`mt-3 inline-flex items-center gap-2 rounded-full border px-3 py-1 ${
                  isVerified
                    ? "border-green-500 bg-green-500/10"
                    : isRejected
                    ? "border-red-500 bg-red-500/10"
                    : isBeingProcessed
                    ? "border-yellow-500 bg-yellow-500/10"
                    : "border-cyan-500 bg-cyan-500/10"
                }`}
              >
                {isVerified ? (
                  <CheckCircle
                    size={15}
                    className="text-green-400"
                  />
                ) : isRejected ? (
                  <AlertTriangle
                    size={15}
                    className="text-red-400"
                  />
                ) : isBeingProcessed ? (
                  <Clock3
                    size={15}
                    className="text-yellow-400"
                  />
                ) : (
                  <ShieldCheck
                    size={15}
                    className="text-cyan-400"
                  />
                )}

                <span
                  className={`text-sm font-medium ${
                    isVerified
                      ? "text-green-400"
                      : isRejected
                      ? "text-red-400"
                      : isBeingProcessed
                      ? "text-yellow-400"
                      : "text-cyan-400"
                  }`}
                >
                  {kycApplication
                    ? formatStatus(
                        kycApplication.status
                      )
                    : "Verification Required"}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* CURRENT STATUS */}

        {kycApplication && (
          <div className="mb-6 rounded-3xl border border-slate-800 bg-[#101A2C] p-6">
            <h2 className="mb-4 text-lg font-bold">
              Current KYC Status
            </h2>

            <div
              className={`rounded-2xl border p-4 ${
                isVerified
                  ? "border-green-500 bg-green-500/10"
                  : isRejected
                  ? "border-red-500 bg-red-500/10"
                  : "border-yellow-500 bg-yellow-500/10"
              }`}
            >
              <div className="flex items-start gap-3">
                {isVerified ? (
                  <CheckCircle
                    size={24}
                    className="mt-0.5 shrink-0 text-green-400"
                  />
                ) : isRejected ? (
                  <AlertTriangle
                    size={24}
                    className="mt-0.5 shrink-0 text-red-400"
                  />
                ) : (
                  <Clock3
                    size={24}
                    className="mt-0.5 shrink-0 text-yellow-400"
                  />
                )}

                <div>
                  <p
                    className={`font-semibold ${
                      isVerified
                        ? "text-green-300"
                        : isRejected
                        ? "text-red-300"
                        : "text-yellow-300"
                    }`}
                  >
                    {formatStatus(
                      kycApplication.status
                    )}
                  </p>

                  <p className="mt-1 text-sm leading-6 text-slate-400">
                    {isVerified
                      ? "Your identity has been successfully verified."
                      : isUnderReview
                      ? "Our administrator is currently reviewing your documents."
                      : isPending
                      ? "Your KYC application has been received and is waiting for review."
                      : "Your KYC application was rejected. Please review the reason below and submit your documents again."}
                  </p>

                  {isRejected &&
                    kycApplication.rejectionReason && (
                      <div className="mt-4 rounded-xl border border-red-500/30 bg-red-500/5 p-3">
                        <p className="text-xs font-semibold uppercase text-red-400">
                          Rejection Reason
                        </p>

                        <p className="mt-1 text-sm text-red-200">
                          {
                            kycApplication.rejectionReason
                          }
                        </p>
                      </div>
                    )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* SUCCESS */}

        {success && (
          <div className="mb-6 flex items-start gap-3 rounded-2xl border border-green-500 bg-green-500/10 p-4">
            <CheckCircle
              size={22}
              className="mt-0.5 shrink-0 text-green-400"
            />

            <p className="text-sm text-green-300">
              {success}
            </p>
          </div>
        )}

        {/* ERROR */}

        {error && (
          <div className="mb-6 flex items-start gap-3 rounded-2xl border border-red-500 bg-red-500/10 p-4">
            <AlertTriangle
              size={22}
              className="mt-0.5 shrink-0 text-red-400"
            />

            <p className="text-sm leading-6 text-red-300">
              {error}
            </p>
          </div>
        )}

        {/* VERIFIED */}

        {isVerified ? (
          <div className="rounded-3xl border border-green-500/30 bg-green-500/5 p-6 text-center">
            <CheckCircle
              size={48}
              className="mx-auto mb-4 text-green-400"
            />

            <h2 className="text-xl font-bold text-green-300">
              Identity Verified
            </h2>

            <p className="mt-2 text-sm leading-6 text-slate-400">
              Your identity verification is complete.
              No further action is required.
            </p>
          </div>
        ) : (
          <>
            {/* PROGRESS */}

            <div className="mb-6 rounded-3xl border border-slate-800 bg-[#101A2C] p-5">
              <div className="mb-3 flex items-center justify-between">
                <span className="font-semibold">
                  Verification Progress
                </span>

                <span className="font-bold text-cyan-400">
                  Step {progressStep} / 3
                </span>
              </div>

              <div className="h-2 w-full overflow-hidden rounded-full bg-[#050B18]">
                <div
                  className={`h-full rounded-full bg-cyan-500 transition-all duration-500 ${
                    progressStep === 3
                      ? "w-full"
                      : progressStep === 2
                      ? "w-2/3"
                      : "w-1/3"
                  }`}
                />
              </div>

              <p className="mt-3 text-sm text-slate-400">
                {isBeingProcessed
                  ? "Your KYC information and documents have been submitted. Please wait for administrator review."
                  : isRejected
                  ? "You can correct your information or replace your documents and submit the verification again."
                  : isComplete
                  ? "Everything is ready for KYC submission."
                  : personalInformationComplete
                  ? "Personal information is complete. Upload all required documents."
                  : "Complete your personal information first."}
              </p>
            </div>

            {/* PERSONAL INFORMATION */}

            <div className="mb-6 rounded-3xl border border-slate-800 bg-[#101A2C] p-6">
              <h2 className="mb-5 text-lg font-bold">
                Personal Information
              </h2>

              <div className="space-y-4">

                <div className="flex items-center gap-3 rounded-2xl border border-slate-800 bg-[#050B18] px-4 py-3">
                  <User
                    size={20}
                    className="shrink-0 text-cyan-400"
                  />

                  <input
                    type="text"
                    placeholder="Full Name"
                    value={fullName}
                    disabled={
                      isBeingProcessed ||
                      submitting
                    }
                    onChange={(event) =>
                      setFullName(
                        event.target.value
                      )
                    }
                    className="min-w-0 flex-1 bg-transparent outline-none placeholder:text-slate-500 disabled:opacity-50"
                  />
                </div>

                <div className="flex items-center gap-3 rounded-2xl border border-slate-800 bg-[#050B18] px-4 py-3">
                  <Mail
                    size={20}
                    className="shrink-0 text-cyan-400"
                  />

                  <input
                    type="email"
                    placeholder="Email Address"
                    value={email}
                    disabled={
                      isBeingProcessed ||
                      submitting
                    }
                    onChange={(event) =>
                      setEmail(
                        event.target.value
                      )
                    }
                    className="min-w-0 flex-1 bg-transparent outline-none placeholder:text-slate-500 disabled:opacity-50"
                  />
                </div>

                <div className="flex items-center gap-3 rounded-2xl border border-slate-800 bg-[#050B18] px-4 py-3">
                  <Phone
                    size={20}
                    className="shrink-0 text-cyan-400"
                  />

                  <input
                    type="tel"
                    placeholder="Phone Number"
                    value={phone}
                    disabled={
                      isBeingProcessed ||
                      submitting
                    }
                    onChange={(event) =>
                      setPhone(
                        event.target.value
                      )
                    }
                    className="min-w-0 flex-1 bg-transparent outline-none placeholder:text-slate-500 disabled:opacity-50"
                  />
                </div>

                <div className="flex items-center gap-3 rounded-2xl border border-slate-800 bg-[#050B18] px-4 py-3">
                  <Calendar
                    size={20}
                    className="shrink-0 text-cyan-400"
                  />

                  <input
                    type="date"
                    value={birthDate}
                    disabled={
                      isBeingProcessed ||
                      submitting
                    }
                    onChange={(event) =>
                      setBirthDate(
                        event.target.value
                      )
                    }
                    className="min-w-0 flex-1 bg-transparent outline-none disabled:opacity-50"
                  />
                </div>

                <div className="flex items-center gap-3 rounded-2xl border border-slate-800 bg-[#050B18] px-4 py-3">
                  <MapPin
                    size={20}
                    className="shrink-0 text-cyan-400"
                  />

                  <input
                    type="text"
                    placeholder="Country / Region"
                    value={country}
                    disabled={
                      isBeingProcessed ||
                      submitting
                    }
                    onChange={(event) =>
                      setCountry(
                        event.target.value
                      )
                    }
                    className="min-w-0 flex-1 bg-transparent outline-none placeholder:text-slate-500 disabled:opacity-50"
                  />
                </div>

              </div>
            </div>

            {/* DOCUMENTS */}

            <div className="mb-6 rounded-3xl border border-slate-800 bg-[#101A2C] p-6">
              <h2 className="mb-5 text-lg font-bold">
                Identity Documents
              </h2>

              <DocumentCard
                type="ID_DOCUMENT"
                title="Upload ID Card / Passport"
                description="PNG, JPG, WEBP or PDF (Max 10 MB)"
                file={idFile}
                serverUploaded={
                  hasServerDocument(
                    "ID_DOCUMENT"
                  )
                }
                icon={
                  <CreditCard
                    size={34}
                    className="text-cyan-400"
                  />
                }
                color="border-cyan-500"
                inputRef={idInputRef}
                accept="image/jpeg,image/png,image/webp,application/pdf"
              />

              <DocumentCard
                type="SELFIE"
                title="Upload Selfie"
                description="Use a clear photo of your face."
                file={selfieFile}
                serverUploaded={
                  hasServerDocument(
                    "SELFIE"
                  )
                }
                icon={
                  <Camera
                    size={34}
                    className="text-purple-400"
                  />
                }
                color="border-purple-500"
                inputRef={selfieInputRef}
                accept="image/jpeg,image/png,image/webp"
              />

              <DocumentCard
                type="ADDRESS_PROOF"
                title="Proof of Address"
                description="Utility bill or bank statement less than 3 months old."
                file={addressFile}
                serverUploaded={
                  hasServerDocument(
                    "ADDRESS_PROOF"
                  )
                }
                icon={
                  <FileText
                    size={34}
                    className="text-green-400"
                  />
                }
                color="border-green-500"
                inputRef={addressInputRef}
                accept="image/jpeg,image/png,image/webp,application/pdf"
              />
            </div>

            {/* VERIFICATION STATUS */}

            <div className="mb-6 rounded-3xl border border-slate-800 bg-[#101A2C] p-6">
              <h2 className="mb-5 text-lg font-bold">
                Verification Status
              </h2>

              <div
                className={`rounded-2xl border p-4 ${
                  isBeingProcessed
                    ? "border-yellow-500 bg-yellow-500/10"
                    : isRejected
                    ? "border-red-500 bg-red-500/10"
                    : isComplete
                    ? "border-green-500 bg-green-500/10"
                    : "border-yellow-500 bg-yellow-500/10"
                }`}
              >
                <div className="flex items-start gap-3">
                  {isBeingProcessed ? (
                    <Clock3
                      size={24}
                      className="mt-0.5 shrink-0 text-yellow-400"
                    />
                  ) : isRejected ? (
                    <AlertTriangle
                      size={24}
                      className="mt-0.5 shrink-0 text-red-400"
                    />
                  ) : isComplete ? (
                    <CheckCircle
                      size={24}
                      className="mt-0.5 shrink-0 text-green-400"
                    />
                  ) : (
                    <AlertTriangle
                      size={24}
                      className="mt-0.5 shrink-0 text-yellow-400"
                    />
                  )}

                  <div>
                    <p
                      className={`font-semibold ${
                        isBeingProcessed
                          ? "text-yellow-300"
                          : isRejected
                          ? "text-red-300"
                          : isComplete
                          ? "text-green-300"
                          : "text-yellow-300"
                      }`}
                    >
                      {isBeingProcessed
                        ? "KYC Under Review"
                        : isRejected
                        ? "Verification Rejected"
                        : isComplete
                        ? "Ready for Submission"
                        : "Waiting for Submission"}
                    </p>

                    <p className="mt-1 text-sm leading-6 text-slate-400">
                      {isBeingProcessed
                        ? "Your documents are stored securely and are currently being reviewed by the administrator."
                        : isRejected
                        ? "You can correct the information or replace the required documents before submitting again."
                        : isComplete
                        ? "All required information and documents have been provided."
                        : "Complete all required information and documents."}
                    </p>
                  </div>
                </div>
              </div>

              <StatusRow
                checked={
                  personalInformationComplete
                }
                text="Personal information completed"
              />

              <StatusRow
                checked={idUploaded}
                text="Government ID uploaded"
              />

              <StatusRow
                checked={selfieUploaded}
                text="Selfie uploaded"
              />

              <StatusRow
                checked={addressUploaded}
                text="Proof of address uploaded"
              />
            </div>

            {/* INFORMATION */}

            <div className="mb-8 rounded-3xl border border-slate-800 bg-[#101A2C] p-6">
              <h2 className="mb-4 text-lg font-bold">
                Before You Submit
              </h2>

              <ul className="space-y-3 text-sm text-slate-300">
                <li>
                  • Your document must be valid and not expired.
                </li>

                <li>
                  • Your selfie must clearly show your face.
                </li>

                <li>
                  • All uploaded files must be readable.
                </li>

                <li>
                  • Maximum file size is 10 MB per document.
                </li>

                <li>
                  • Accepted formats are JPG, PNG, WEBP and PDF where applicable.
                </li>
              </ul>
            </div>

            {/* SUBMIT */}

            <button
              type="button"
              onClick={handleSubmit}
              disabled={
                !isComplete ||
                submitting ||
                isBeingProcessed
              }
              className={`w-full rounded-3xl py-5 text-lg font-bold transition ${
                isComplete &&
                !submitting &&
                !isBeingProcessed
                  ? "bg-cyan-500 text-black hover:bg-cyan-400"
                  : "cursor-not-allowed bg-cyan-500/30 text-slate-500"
              }`}
            >
              {submitting ? (
                <span className="flex items-center justify-center gap-2">
                  <Loader2
                    size={21}
                    className="animate-spin"
                  />

                  Submitting KYC...
                </span>
              ) : isPending ? (
                "KYC Under Review"
              ) : isUnderReview ? (
                "KYC Being Reviewed"
              ) : isRejected ? (
                "Resubmit Verification"
              ) : isComplete ? (
                "Submit Verification"
              ) : (
                "Complete KYC Requirements"
              )}
            </button>
          </>
        )}
      </div>
    </main>
  );
}

// ============================================================
// STATUS ROW
// ============================================================

function StatusRow({
  checked,
  text,
}: {
  checked: boolean;
  text: string;
}) {
  return (
    <div className="mt-4 flex items-center gap-3">
      <CheckCircle
        size={20}
        className={
          checked
            ? "text-green-400"
            : "text-slate-600"
        }
      />

      <span
        className={
          checked
            ? "text-white"
            : "text-slate-400"
        }
      >
        {text}
      </span>
    </div>
  );
}