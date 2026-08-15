"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  CheckCircle2,
  XCircle,
  FileText,
  User,
  Mail,
  Phone,
  Calendar,
  MapPin,
  ShieldCheck,
  Loader2,
  ExternalLink,
  AlertCircle,
  Clock3,
} from "lucide-react";
type KYCStatus =
  | "PENDING"
  | "UNDER_REVIEW"
  | "VERIFIED"
  | "REJECTED";
type KYCFileType =
  | "ID_DOCUMENT"
  | "SELFIE"
  | "ADDRESS_PROOF";
type KYCDocument = {
  id: string;
  type: KYCFileType;
  fileName: string;
  mimeType: string;
  fileSize: number;
  createdAt: string;
  updatedAt: string;
};
type KYCApplication = {
  id: string;
  userId: string;
  fullName: string | null;
  email: string | null;
  phone: string | null;
  birthDate: string | null;
  country: string | null;
  status: KYCStatus;
  rejectionReason: string | null;
  reviewedAt: string | null;
  reviewedBy: string | null;
  createdAt: string;
  updatedAt: string;
  user?: {
    id: string;
    name: string | null;
    email: string | null;
    createdAt: string;
  };
  documents: KYCDocument[];
};
export default function AdminKYCApplicationPage() {
  const params = useParams();
  const router = useRouter();
  const applicationId =
    typeof params?.applicationId === "string"
      ? params.applicationId
      : "";
  const [application, setApplication] =
    useState<KYCApplication | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] =
    useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [rejectMode, setRejectMode] =
    useState(false);
  const [rejectionReason, setRejectionReason] =
    useState("");
  useEffect(() => {
    if (!applicationId) {
      setError("Identifiant KYC invalide.");
      setLoading(false);
      return;
    }
    let cancelled = false;
    async function loadApplication() {
      try {
        setLoading(true);
        setError("");
        setMessage("");
        const response = await fetch(
          `/api/admin/kyc?applicationId=${encodeURIComponent(
            applicationId
          )}`,
          {
            method: "GET",
            cache: "no-store",
            headers: {
              Accept: "application/json",
            },
          }
        );
        const text = await response.text();
        let data: any = null;
        try {
          data = text ? JSON.parse(text) : null;
        } catch {
          throw new Error(
            "Le serveur a retourné une réponse invalide."
          );
        }
        if (!response.ok) {
          throw new Error(
            data?.message ||
              "Impossible de récupérer la demande KYC."
          );
        }
        if (!data?.success) {
          throw new Error(
            data?.message ||
              "Impossible de récupérer la demande KYC."
          );
        }
        if (!data?.application) {
          throw new Error(
            "La demande KYC est introuvable."
          );
        }
        if (!cancelled) {
          setApplication(data.application);
        }
      } catch (err) {
        console.error(
          "KYC APPLICATION LOAD ERROR:",
          err
        );
        if (!cancelled) {
          setError(
            err instanceof Error
              ? err.message
              : "Une erreur est survenue."
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }
    loadApplication();
    return () => {
      cancelled = true;
    };
  }, [applicationId]);
  async function updateStatus(
    status:
      | "UNDER_REVIEW"
      | "VERIFIED"
      | "REJECTED"
  ) {
    if (!application) return;
    if (
      status === "REJECTED" &&
      !rejectionReason.trim()
    ) {
      setError(
        "Veuillez saisir une raison pour le rejet."
      );
      return;
    }
    try {
      setActionLoading(true);
      setError("");
      setMessage("");
      const response = await fetch(
        "/api/admin/kyc",
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          body: JSON.stringify({
            id: application.id,
            status,
            rejectionReason:
              status === "REJECTED"
                ? rejectionReason.trim()
                : "",
          }),
        }
      );
      const text = await response.text();
      let data: any = null;
      try {
        data = text ? JSON.parse(text) : null;
      } catch {
        throw new Error(
          "Le serveur a retourné une réponse invalide."
        );
      }
      if (!response.ok || !data?.success) {
        throw new Error(
          data?.message ||
            "Impossible de mettre à jour le statut KYC."
        );
      }
      if (data.application) {
        setApplication(data.application);
      }
      setRejectMode(false);
      setRejectionReason("");
      if (status === "UNDER_REVIEW") {
        setMessage(
          "La demande KYC est maintenant en cours de vérification."
        );
      }
      if (status === "VERIFIED") {
        setMessage(
          "La demande KYC a été approuvée avec succès."
        );
      }
      if (status === "REJECTED") {
        setMessage(
          "La demande KYC a été rejetée."
        );
      }
    } catch (err) {
      console.error(
        "KYC STATUS UPDATE ERROR:",
        err
      );
      setError(
        err instanceof Error
          ? err.message
          : "Une erreur est survenue."
      );
    } finally {
      setActionLoading(false);
    }
  }
  function goBack() {
    router.replace("/admin/kyc");
  }
  /*
   * IMPORTANT:
   * Documents are stored in KYCDocument.fileData.
   *
   * The binary file is served by:
   * /api/admin/kyc/[id]/document/[type]
   *
   * The API route also expects the type query parameter.
   */
  function getDocumentUrl(
    type: KYCFileType
  ) {
    return `/api/admin/kyc/${encodeURIComponent(
      applicationId
    )}/document/${encodeURIComponent(
      type
    )}?type=${encodeURIComponent(type)}`;
  }
  function getDocumentLabel(
    type: KYCFileType
  ) {
    switch (type) {
      case "ID_DOCUMENT":
        return "Identity Document";
      case "SELFIE":
        return "Selfie";
      case "ADDRESS_PROOF":
        return "Proof of Address";
      default:
        return "Document";
    }
  }
  function getStatusLabel(
    status: KYCStatus
  ) {
    switch (status) {
      case "PENDING":
        return "Pending";
      case "UNDER_REVIEW":
        return "Under Review";
      case "VERIFIED":
        return "Verified";
      case "REJECTED":
        return "Rejected";
      default:
        return status;
    }
  }
  function getStatusClass(
    status: KYCStatus
  ) {
    switch (status) {
      case "VERIFIED":
        return "border-green-500/30 bg-green-500/10 text-green-400";
      case "REJECTED":
        return "border-red-500/30 bg-red-500/10 text-red-400";
      case "UNDER_REVIEW":
        return "border-blue-500/30 bg-blue-500/10 text-blue-400";
      default:
        return "border-yellow-500/30 bg-yellow-500/10 text-yellow-400";
    }
  }
  function StatusIcon({
    status,
    size = 18,
  }: {
    status: KYCStatus;
    size?: number;
  }) {
    if (status === "VERIFIED") {
      return <CheckCircle2 size={size} />;
    }
    if (status === "REJECTED") {
      return <XCircle size={size} />;
    }
    if (status === "UNDER_REVIEW") {
      return <Clock3 size={size} />;
    }
    return <ShieldCheck size={size} />;
  }
  function formatFileSize(size: number) {
    if (!Number.isFinite(size)) {
      return "Unknown";
    }
    if (size < 1024) {
      return `${size} B`;
    }
    if (size < 1024 * 1024) {
      return `${(size / 1024).toFixed(1)} KB`;
    }
    return `${(
      size /
      (1024 * 1024)
    ).toFixed(1)} MB`;
  }
  function formatDate(
    value: string | null
  ) {
    if (!value) {
      return "—";
    }
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) {
      return "—";
    }
    return date.toLocaleString("fr-FR", {
      dateStyle: "medium",
      timeStyle: "short",
    });
  }
  function DocumentCard({
    document,
  }: {
    document: KYCDocument;
  }) {
    /*
     * IMPORTANT:
     * Use the document TYPE, not document ID.
     */
    const url = getDocumentUrl(
      document.type
    );
    const isImage =
      document.mimeType?.startsWith("image/");
    return (
      <div className="overflow-hidden rounded-2xl border border-slate-800 bg-[#101A2C]">
        <div className="flex flex-col gap-4 border-b border-slate-800 p-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex min-w-0 items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-cyan-500/10 text-cyan-400">
              <FileText size={20} />
            </div>
            <div className="min-w-0">
              <h3 className="font-semibold text-white">
                {getDocumentLabel(
                  document.type
                )}
              </h3>
              <p className="truncate text-xs text-slate-400">
                {document.fileName}
              </p>
            </div>
          </div>
          <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex w-full items-center justify-center gap-2 rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-sm font-medium text-white transition hover:border-cyan-500/50 hover:bg-slate-800 sm:w-auto"
          >
            <ExternalLink size={16} />
            Open
          </a>
        </div>
        <div className="bg-[#080F1D] p-4">
          {isImage ? (
            <a
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              className="block overflow-hidden rounded-xl border border-slate-800 bg-black"
            >
              <img
                src={url}
                alt={getDocumentLabel(
                  document.type
                )}
                className="max-h-[420px] w-full object-contain"
              />
            </a>
          ) : (
            <div className="flex min-h-[180px] items-center justify-center rounded-xl border border-slate-800 bg-slate-950">
              <div className="text-center">
                <FileText
                  size={40}
                  className="mx-auto mb-3 text-slate-500"
                />
                <p className="text-sm font-medium text-white">
                  Document
                </p>
                <p className="mt-1 text-xs text-slate-500">
                  {document.mimeType}
                </p>
                <p className="mt-1 text-xs text-slate-500">
                  {formatFileSize(
                    document.fileSize
                  )}
                </p>
                <a
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-4 inline-flex items-center gap-2 rounded-lg bg-cyan-500/10 px-3 py-2 text-xs font-medium text-cyan-400 hover:bg-cyan-500/20"
                >
                  <ExternalLink size={14} />
                  Open document
                </a>
              </div>
            </div>
          )}
          <div className="mt-3 flex flex-wrap gap-x-5 gap-y-1 text-xs text-slate-500">
            <span>
              Type: {document.mimeType}
            </span>
            <span>
              Size:{" "}
              {formatFileSize(
                document.fileSize
              )}
            </span>
            <span>
              Uploaded:{" "}
              {formatDate(
                document.createdAt
              )}
            </span>
          </div>
        </div>
      </div>
    );
  }
  if (loading) {
    return (
      <main className="min-h-screen bg-[#050B18] text-white">
        <div className="mx-auto flex min-h-screen max-w-6xl items-center justify-center px-5">
          <div className="text-center">
            <Loader2
              size={40}
              className="mx-auto animate-spin text-cyan-400"
            />
            <p className="mt-4 text-sm text-slate-400">
              Loading KYC application...
            </p>
          </div>
        </div>
      </main>
    );
  }
  if (error && !application) {
    return (
      <main className="min-h-screen bg-[#050B18] text-white">
        <div className="mx-auto max-w-6xl px-5 py-8">
          <button
            type="button"
            onClick={goBack}
            className="mb-6 flex items-center gap-2 text-sm text-slate-400 transition hover:text-white"
          >
            <ArrowLeft size={18} />
            Back to KYC
          </button>
          <div className="rounded-2xl border border-red-500/20 bg-red-500/10 p-6">
            <div className="flex items-start gap-3">
              <AlertCircle
                className="mt-0.5 shrink-0 text-red-400"
                size={22}
              />
              <div>
                <h2 className="font-semibold text-red-300">
                  Unable to load KYC application
                </h2>
                <p className="mt-1 break-words text-sm text-red-300/80">
                  {error}
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() =>
                window.location.reload()
              }
              className="mt-5 rounded-xl border border-red-500/30 px-4 py-2 text-sm font-semibold text-red-300 hover:bg-red-500/10"
            >
              Try again
            </button>
          </div>
        </div>
      </main>
    );
  }
  if (!application) {
    return null;
  }
  return (
    <main className="min-h-screen bg-[#050B18] text-white">
      <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 lg:px-8">
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <button
              type="button"
              onClick={goBack}
              className="mb-3 flex items-center gap-2 text-sm text-slate-400 transition hover:text-white"
            >
              <ArrowLeft size={18} />
              Back to KYC applications
            </button>
            <h1 className="text-2xl font-bold sm:text-3xl">
              KYC Application
            </h1>
            <p className="mt-1 break-all text-xs text-slate-500">
              Application ID: {application.id}
            </p>
          </div>
          <div
            className={`inline-flex w-fit items-center gap-2 rounded-full border px-4 py-2 text-sm font-semibold ${getStatusClass(
              application.status
            )}`}
          >
            <StatusIcon
              status={application.status}
              size={17}
            />
            {getStatusLabel(
              application.status
            )}
          </div>
        </div>
        {error && (
          <div className="mb-5 rounded-2xl border border-red-500/20 bg-red-500/10 p-4">
            <div className="flex items-start gap-3">
              <AlertCircle
                size={19}
                className="mt-0.5 shrink-0 text-red-400"
              />
              <p className="text-sm text-red-300">
                {error}
              </p>
            </div>
          </div>
        )}
        {message && (
          <div className="mb-5 rounded-2xl border border-green-500/20 bg-green-500/10 p-4">
            <div className="flex items-start gap-3">
              <CheckCircle2
                size={19}
                className="mt-0.5 shrink-0 text-green-400"
              />
              <p className="text-sm text-green-300">
                {message}
              </p>
            </div>
          </div>
        )}
        <section className="mb-6 rounded-2xl border border-slate-800 bg-[#101A2C] p-5">
          <h2 className="mb-4 font-semibold">
            Verification Status
          </h2>
          <div className="grid gap-3 sm:grid-cols-4">
            {[
              {
                status: "PENDING" as KYCStatus,
                title: "Pending",
                description: "Awaiting review",
                icon: (
                  <ShieldCheck
                    size={17}
                    className="text-yellow-400"
                  />
                ),
              },
              {
                status: "UNDER_REVIEW" as KYCStatus,
                title: "Under Review",
                description:
                  "Administrator is reviewing",
                icon: (
                  <Clock3
                    size={17}
                    className="text-blue-400"
                  />
                ),
              },
              {
                status: "VERIFIED" as KYCStatus,
                title: "Verified",
                description:
                  "Identity approved",
                icon: (
                  <CheckCircle2
                    size={17}
                    className="text-green-400"
                  />
                ),
              },
              {
                status: "REJECTED" as KYCStatus,
                title: "Rejected",
                description:
                  "Application rejected",
                icon: (
                  <XCircle
                    size={17}
                    className="text-red-400"
                  />
                ),
              },
            ].map((item) => (
              <div
                key={item.status}
                className={`rounded-xl border p-4 ${
                  application.status === item.status
                    ? getStatusClass(item.status)
                    : "border-slate-800 bg-[#080F1D]"
                }`}
              >
                <div className="flex items-center gap-2">
                  {item.icon}
                  <span className="text-sm font-medium">
                    {item.title}
                  </span>
                </div>
                <p className="mt-1 text-xs text-slate-500">
                  {item.description}
                </p>
              </div>
            ))}
          </div>
        </section>
        <section className="mb-6 rounded-2xl border border-slate-800 bg-[#101A2C]">
          <div className="border-b border-slate-800 p-5">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-500/10 text-cyan-400">
                <User size={20} />
              </div>
              <div>
                <h2 className="font-semibold">
                  Applicant Information
                </h2>
                <p className="text-xs text-slate-500">
                  Personal information submitted for verification
                </p>
              </div>
            </div>
          </div>
          <div className="grid gap-4 p-5 sm:grid-cols-2 lg:grid-cols-3">
            <InfoCard
              icon={<User size={15} />}
              label="Full Name"
              value={
                application.fullName ||
                application.user?.name ||
                "—"
              }
            />
            <InfoCard
              icon={<Mail size={15} />}
              label="Email"
              value={
                application.email ||
                application.user?.email ||
                "—"
              }
              breakAll
            />
            <InfoCard
              icon={<Phone size={15} />}
              label="Phone"
              value={
                application.phone || "—"
              }
            />
            <InfoCard
              icon={<Calendar size={15} />}
              label="Date of Birth"
              value={formatDate(
                application.birthDate
              )}
            />
            <InfoCard
              icon={<MapPin size={15} />}
              label="Country"
              value={
                application.country || "—"
              }
            />
            <InfoCard
              icon={<ShieldCheck size={15} />}
              label="Submitted"
              value={formatDate(
                application.createdAt
              )}
            />
          </div>
        </section>
        {application.status === "REJECTED" &&
          application.rejectionReason && (
            <section className="mb-6 rounded-2xl border border-red-500/20 bg-red-500/5 p-5">
              <div className="flex items-start gap-3">
                <XCircle
                  size={21}
                  className="mt-0.5 shrink-0 text-red-400"
                />
                <div>
                  <h2 className="font-semibold text-red-300">
                    Rejection Reason
                  </h2>
                  <p className="mt-2 text-sm leading-6 text-red-200/80">
                    {application.rejectionReason}
                  </p>
                </div>
              </div>
            </section>
          )}
        <section className="mb-6">
          <div className="mb-4">
            <h2 className="text-xl font-bold">
              KYC Documents
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Review the documents submitted by the applicant.
            </p>
          </div>
          <div className="grid gap-5">
            {application.documents.length === 0 ? (
              <div className="rounded-2xl border border-slate-800 bg-[#101A2C] p-8 text-center">
                <FileText
                  size={40}
                  className="mx-auto mb-3 text-slate-600"
                />
                <p className="font-medium text-slate-300">
                  No documents uploaded
                </p>
              </div>
            ) : (
              application.documents.map(
                (document) => (
                  <DocumentCard
                    key={document.id}
                    document={document}
                  />
                )
              )
            )}
          </div>
        </section>
        {application.status !== "VERIFIED" && (
          <section className="sticky bottom-4 z-20 rounded-2xl border border-slate-800 bg-[#101A2C]/95 p-5 shadow-2xl backdrop-blur-xl">
            {!rejectMode ? (
              <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
                {application.status !==
                  "UNDER_REVIEW" && (
                  <button
                    type="button"
                    onClick={() =>
                      updateStatus(
                        "UNDER_REVIEW"
                      )
                    }
                    disabled={actionLoading}
                    className="flex items-center justify-center gap-2 rounded-xl border border-blue-500/30 bg-blue-500/10 px-5 py-3 font-semibold text-blue-400 transition hover:bg-blue-500/20 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {actionLoading ? (
                      <Loader2
                        size={19}
                        className="animate-spin"
                      />
                    ) : (
                      <Clock3 size={19} />
                    )}
                    Under Review
                  </button>
                )}
                <button
                  type="button"
                  onClick={() =>
                    setRejectMode(true)
                  }
                  disabled={actionLoading}
                  className="flex items-center justify-center gap-2 rounded-xl border border-red-500/30 bg-red-500/10 px-5 py-3 font-semibold text-red-400 transition hover:bg-red-500/20 disabled:opacity-50"
                >
                  <XCircle size={19} />
                  Reject KYC
                </button>
                <button
                  type="button"
                  onClick={() =>
                    updateStatus("VERIFIED")
                  }
                  disabled={actionLoading}
                  className="flex items-center justify-center gap-2 rounded-xl bg-green-600 px-5 py-3 font-semibold text-white transition hover:bg-green-500 disabled:opacity-50"
                >
                  {actionLoading ? (
                    <Loader2
                      size={19}
                      className="animate-spin"
                    />
                  ) : (
                    <CheckCircle2
                      size={19}
                    />
                  )}
                  Verify KYC
                </button>
              </div>
            ) : (
              <div>
                <h3 className="font-semibold">
                  Reject KYC Application
                </h3>
                <p className="mt-1 text-sm text-slate-500">
                  Please provide a reason for rejecting this application.
                </p>
                <textarea
                  value={rejectionReason}
                  onChange={(event) =>
                    setRejectionReason(
                      event.target.value
                    )
                  }
                  placeholder="Example: The identity document is unclear or expired."
                  rows={4}
                  className="mt-4 w-full resize-none rounded-xl border border-slate-700 bg-[#080F1D] px-4 py-3 text-sm text-white outline-none placeholder:text-slate-600 focus:border-red-500/50"
                />
                <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:justify-end">
                  <button
                    type="button"
                    onClick={() => {
                      setRejectMode(false);
                      setRejectionReason("");
                      setError("");
                    }}
                    disabled={actionLoading}
                    className="rounded-xl border border-slate-700 px-5 py-3 font-medium text-slate-300 hover:bg-slate-800 disabled:opacity-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      updateStatus("REJECTED")
                    }
                    disabled={
                      actionLoading ||
                      !rejectionReason.trim()
                    }
                    className="flex items-center justify-center gap-2 rounded-xl bg-red-600 px-5 py-3 font-semibold text-white hover:bg-red-500 disabled:opacity-50"
                  >
                    {actionLoading ? (
                      <Loader2
                        size={19}
                        className="animate-spin"
                      />
                    ) : (
                      <XCircle size={19} />
                    )}
                    Confirm Rejection
                  </button>
                </div>
              </div>
            )}
          </section>
        )}
        {application.reviewedAt && (
          <section className="mt-6 rounded-2xl border border-slate-800 bg-[#101A2C] p-5">
            <h2 className="mb-4 font-semibold">
              Review Information
            </h2>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <p className="text-xs text-slate-500">
                  Reviewed At
                </p>
                <p className="mt-1 text-sm text-slate-300">
                  {formatDate(
                    application.reviewedAt
                  )}
                </p>
              </div>
              <div>
                <p className="text-xs text-slate-500">
                  Reviewed By
                </p>
                <p className="mt-1 break-all text-sm text-slate-300">
                  {application.reviewedBy ||
                    "Administrator"}
                </p>
              </div>
            </div>
          </section>
        )}
      </div>
    </main>
  );
}
function InfoCard({
  icon,
  label,
  value,
  breakAll = false,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  breakAll?: boolean;
}) {
  return (
    <div className="rounded-xl border border-slate-800 bg-[#080F1D] p-4">
      <div className="mb-2 flex items-center gap-2 text-xs text-slate-500">
        {icon}
        {label}
      </div>
      <p
        className={`font-medium text-white ${
          breakAll ? "break-all" : ""
        }`}
      >
        {value}
      </p>
    </div>
  );
}