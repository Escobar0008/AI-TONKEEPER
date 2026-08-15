"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

function VerifyResetCodeContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const email = searchParams.get("email") || "";

  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleVerify() {
    if (!email) {
      alert("Adresse e-mail introuvable.");
      return;
    }

    if (!code) {
      alert("Veuillez saisir le code.");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("/api/verify-reset-code", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          code,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        alert(data.message || "Code de vérification incorrect.");
        return;
      }

      router.push(
        `/forgot-password/reset?email=${encodeURIComponent(email)}`
      );
    } catch (error) {
      console.error(error);
      alert("Une erreur est survenue.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#050B18] px-5 text-white">
      <div className="w-full max-w-md">

        {/* Header */}

        <div className="mb-8 text-center">
          <img
            src="/logo.png"
            alt="AI TONKEEPER"
            className="mx-auto h-20 w-20"
          />

          <h1 className="mt-4 text-3xl font-bold">
            Verify Code
          </h1>

          <p className="mt-2 text-gray-400">
            Enter the verification code sent to your email.
          </p>
        </div>

        {/* Verification Card */}

        <div className="rounded-3xl border border-slate-800 bg-[#101A2C] p-6">
          <div className="space-y-5">

            <input
              type="text"
              inputMode="numeric"
              autoComplete="one-time-code"
              maxLength={6}
              placeholder="6-digit code"
              value={code}
              onChange={(e) =>
                setCode(e.target.value.replace(/\D/g, ""))
              }
              disabled={loading}
              className="w-full rounded-xl border border-slate-700 bg-[#0B1220] px-4 py-3 text-center tracking-[0.3em] outline-none focus:border-cyan-500 disabled:opacity-50"
            />

            <button
              type="button"
              onClick={handleVerify}
              disabled={loading}
              className="w-full rounded-xl bg-cyan-500 py-3 font-bold text-black transition hover:bg-cyan-600 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading ? "Verifying..." : "Verify Code"}
            </button>

          </div>
        </div>

      </div>
    </main>
  );
}

export default function VerifyResetCodePage() {
  return (
    <Suspense
      fallback={
        <main className="flex min-h-screen items-center justify-center bg-[#050B18] text-white">
          <div className="text-center">
            <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-slate-700 border-t-cyan-400" />

            <p className="mt-4 text-sm text-slate-400">
              Loading...
            </p>
          </div>
        </main>
      }
    >
      <VerifyResetCodeContent />
    </Suspense>
  );
}