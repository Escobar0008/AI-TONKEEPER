"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ShieldCheck,
  Clock3,
  CheckCircle,
  XCircle,
  Eye,
  RefreshCw,
  Loader2,
  AlertTriangle,
} from "lucide-react";

type KYCStatus =
  | "PENDING"
  | "UNDER_REVIEW"
  | "VERIFIED"
  | "REJECTED";

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
};

const STATUS_LABELS: Record<KYCStatus, string> = {
  PENDING: "Pending",
  UNDER_REVIEW: "Under Review",
  VERIFIED: "Verified",
  REJECTED: "Rejected",
};

export default function AdminKYCPage() {
  const router = useRouter();

  const [applications, setApplications] = useState<
    KYCApplication[]
  >([]);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  const [filter, setFilter] = useState<
    "ALL" | KYCStatus
  >("ALL");

  async function loadApplications() {
    try {
      setError("");

      const response = await fetch("/api/admin/kyc", {
        method: "GET",
        cache: "no-store",
        headers: {
          Accept: "application/json",
        },
      });

      const data = await response.json();

      if (!response.ok || !data?.success) {
        throw new Error(
          data?.message ||
            "Unable to retrieve KYC applications."
        );
      }

      setApplications(
        Array.isArray(data?.applications)
          ? data.applications
          : []
      );
    } catch (error) {
      console.error(
        "ADMIN KYC LOAD ERROR:",
        error
      );

      setError(
        error instanceof Error
          ? error.message
          : "Unable to load KYC applications."
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  useEffect(() => {
    loadApplications();
  }, []);

  function handleRefresh() {
    setRefreshing(true);
    loadApplications();
  }

  function openKYC(applicationId: string) {
    if (!applicationId) {
      console.error(
        "KYC NAVIGATION ERROR: Missing application ID"
      );
      return;
    }

    const target = `/admin/kyc/${encodeURIComponent(
      applicationId
    )}`;

    console.log(
      "Opening KYC application:",
      target
    );

    router.push(target);
  }

  const pendingCount = applications.filter(
    (item) => item.status === "PENDING"
  ).length;

  const reviewCount = applications.filter(
    (item) => item.status === "UNDER_REVIEW"
  ).length;

  const verifiedCount = applications.filter(
    (item) => item.status === "VERIFIED"
  ).length;

  const rejectedCount = applications.filter(
    (item) => item.status === "REJECTED"
  ).length;

  const filteredApplications =
    filter === "ALL"
      ? applications
      : applications.filter(
          (item) => item.status === filter
        );

  function getStatusIcon(status: KYCStatus) {
    switch (status) {
      case "VERIFIED":
        return (
          <CheckCircle
            size={18}
            className="text-green-400"
          />
        );

      case "REJECTED":
        return (
          <XCircle
            size={18}
            className="text-red-400"
          />
        );

      case "UNDER_REVIEW":
        return (
          <ShieldCheck
            size={18}
            className="text-yellow-400"
          />
        );

      default:
        return (
          <Clock3
            size={18}
            className="text-cyan-400"
          />
        );
    }
  }

  function getStatusClass(status: KYCStatus) {
    switch (status) {
      case "VERIFIED":
        return "border-green-500/30 bg-green-500/10 text-green-400";

      case "REJECTED":
        return "border-red-500/30 bg-red-500/10 text-red-400";

      case "UNDER_REVIEW":
        return "border-yellow-500/30 bg-yellow-500/10 text-yellow-400";

      default:
        return "border-cyan-500/30 bg-cyan-500/10 text-cyan-400";
    }
  }

  function formatDate(value: string) {
    try {
      return new Date(value).toLocaleString(
        "fr-FR",
        {
          dateStyle: "medium",
          timeStyle: "short",
        }
      );
    } catch {
      return value;
    }
  }

  return (
    <main className="min-h-screen bg-[#050B18] px-4 py-6 text-white sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">

        {/* HEADER */}

        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">

            <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-cyan-500/30 bg-cyan-500/10">
              <ShieldCheck
                size={25}
                className="text-cyan-400"
              />
            </div>

            <div>
              <h1 className="text-2xl font-bold sm:text-3xl">
                KYC Verification
              </h1>

              <p className="mt-1 text-sm text-slate-400">
                Manage identity verification requests
              </p>
            </div>

          </div>

          <button
            type="button"
            onClick={handleRefresh}
            disabled={refreshing}
            className="flex items-center justify-center gap-2 rounded-xl border border-slate-700 bg-[#101A2C] px-4 py-3 text-sm font-semibold transition hover:border-cyan-500 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {refreshing ? (
              <Loader2
                size={18}
                className="animate-spin"
              />
            ) : (
              <RefreshCw size={18} />
            )}

            Refresh
          </button>
        </div>

        {/* ERROR */}

        {error && (
          <div className="mb-6 flex items-start gap-3 rounded-2xl border border-red-500/30 bg-red-500/10 p-4">

            <AlertTriangle
              size={22}
              className="mt-0.5 shrink-0 text-red-400"
            />

            <div>
              <p className="font-semibold text-red-300">
                Unable to load KYC
              </p>

              <p className="mt-1 text-sm text-red-400">
                {error}
              </p>
            </div>

          </div>
        )}

        {/* STATISTICS */}

        <div className="mb-8 grid grid-cols-2 gap-4 lg:grid-cols-4">

          <StatCard
            title="Pending"
            value={pendingCount}
            icon={
              <Clock3
                size={21}
                className="text-cyan-400"
              />
            }
          />

          <StatCard
            title="Under Review"
            value={reviewCount}
            icon={
              <ShieldCheck
                size={21}
                className="text-yellow-400"
              />
            }
          />

          <StatCard
            title="Verified"
            value={verifiedCount}
            icon={
              <CheckCircle
                size={21}
                className="text-green-400"
              />
            }
          />

          <StatCard
            title="Rejected"
            value={rejectedCount}
            icon={
              <XCircle
                size={21}
                className="text-red-400"
              />
            }
          />

        </div>

        {/* FILTERS */}

        <div className="mb-6 overflow-x-auto">
          <div className="flex min-w-max gap-2">

            <FilterButton
              active={filter === "ALL"}
              onClick={() => setFilter("ALL")}
              label={`All (${applications.length})`}
            />

            <FilterButton
              active={filter === "PENDING"}
              onClick={() => setFilter("PENDING")}
              label={`Pending (${pendingCount})`}
            />

            <FilterButton
              active={filter === "UNDER_REVIEW"}
              onClick={() =>
                setFilter("UNDER_REVIEW")
              }
              label={`Under Review (${reviewCount})`}
            />

            <FilterButton
              active={filter === "VERIFIED"}
              onClick={() =>
                setFilter("VERIFIED")
              }
              label={`Verified (${verifiedCount})`}
            />

            <FilterButton
              active={filter === "REJECTED"}
              onClick={() =>
                setFilter("REJECTED")
              }
              label={`Rejected (${rejectedCount})`}
            />

          </div>
        </div>

        {/* APPLICATION LIST */}

        <div className="overflow-hidden rounded-3xl border border-slate-800 bg-[#101A2C]">

          <div className="border-b border-slate-800 px-5 py-5">
            <h2 className="text-lg font-bold">
              KYC Applications
            </h2>

            <p className="mt-1 text-sm text-slate-400">
              {filteredApplications.length} application
              {filteredApplications.length !== 1
                ? "s"
                : ""}{" "}
              found
            </p>
          </div>

          {loading ? (
            <div className="flex min-h-[300px] items-center justify-center">
              <div className="flex items-center gap-3 text-cyan-400">

                <Loader2
                  size={25}
                  className="animate-spin"
                />

                <span>
                  Loading KYC applications...
                </span>

              </div>
            </div>
          ) : filteredApplications.length === 0 ? (
            <div className="flex min-h-[300px] flex-col items-center justify-center px-6 text-center">

              <ShieldCheck
                size={48}
                className="mb-4 text-slate-600"
              />

              <h3 className="text-lg font-semibold">
                No KYC applications
              </h3>

              <p className="mt-2 max-w-md text-sm text-slate-500">
                There are currently no applications
                matching this filter.
              </p>

            </div>
          ) : (
            <div className="divide-y divide-slate-800">

              {filteredApplications.map(
                (application) => (
                  <div
                    key={application.id}
                    className="p-5 transition hover:bg-[#0B1424]"
                  >

                    <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">

                      {/* USER */}

                      <div className="min-w-0 flex-1">

                        <div className="flex items-start gap-4">

                          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-cyan-500/10">
                            <ShieldCheck
                              size={22}
                              className="text-cyan-400"
                            />
                          </div>

                          <div className="min-w-0">

                            <h3 className="truncate text-lg font-bold">
                              {application.fullName ||
                                application.user?.name ||
                                "Unknown User"}
                            </h3>

                            <p className="mt-1 truncate text-sm text-slate-400">
                              {application.email ||
                                application.user?.email ||
                                "No email"}
                            </p>

                            <p className="mt-1 text-xs text-slate-500">
                              Submitted{" "}
                              {formatDate(
                                application.createdAt
                              )}
                            </p>

                          </div>

                        </div>

                      </div>

                      {/* STATUS */}

                      <div
                        className={`inline-flex items-center gap-2 self-start rounded-full border px-3 py-2 text-sm font-semibold lg:self-auto ${getStatusClass(
                          application.status
                        )}`}
                      >
                        {getStatusIcon(
                          application.status
                        )}

                        {
                          STATUS_LABELS[
                            application.status
                          ]
                        }
                      </div>

                      {/* VIEW */}

                      <button
                        type="button"
                        onClick={() =>
                          openKYC(
                            application.id
                          )
                        }
                        className="flex items-center justify-center gap-2 rounded-xl border border-slate-700 bg-[#050B18] px-5 py-3 text-sm font-semibold text-cyan-400 transition hover:border-cyan-500 hover:bg-cyan-500/5"
                      >
                        <Eye size={18} />

                        View KYC
                      </button>

                    </div>

                  </div>
                )
              )}

            </div>
          )}

        </div>
      </div>
    </main>
  );
}

/* ============================================================
   STAT CARD
============================================================ */

function StatCard({
  title,
  value,
  icon,
}: {
  title: string;
  value: number;
  icon: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-slate-800 bg-[#101A2C] p-5">

      <div className="mb-4 flex items-center justify-between">
        <span className="text-sm text-slate-400">
          {title}
        </span>

        {icon}
      </div>

      <p className="text-3xl font-bold">
        {value}
      </p>

    </div>
  );
}

/* ============================================================
   FILTER BUTTON
============================================================ */

function FilterButton({
  active,
  onClick,
  label,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-xl border px-4 py-2.5 text-sm font-semibold transition ${
        active
          ? "border-cyan-500 bg-cyan-500/10 text-cyan-400"
          : "border-slate-700 bg-[#101A2C] text-slate-400 hover:border-slate-500 hover:text-white"
      }`}
    >
      {label}
    </button>
  );
}