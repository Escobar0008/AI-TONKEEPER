"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense } from "react";

function VerificationContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const email = searchParams.get("email") || "";

  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);

  async function verifyCode() {
    if (!email) {
      alert("Adresse e-mail manquante.");
      return;
    }

    if (code.length !== 6) {
      alert("Veuillez entrer un code à 6 chiffres.");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("/api/verify-email", {
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
        alert(data.message || "Code incorrect.");
        return;
      }

      alert(
        data.message ||
          "Adresse e-mail vérifiée avec succès."
      );

      router.replace("/login");
    } catch (error) {
      console.error("EMAIL VERIFICATION ERROR:", error);
      alert("Une erreur serveur est survenue.");
    } finally {
      setLoading(false);
    }
  }

  async function resendCode() {
    if (!email) {
      alert("Adresse e-mail manquante.");
      return;
    }

    setResending(true);

    try {
      const response = await fetch("/api/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          resend: true,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        alert(
          data.message ||
            data.error ||
            "Impossible de renvoyer le code."
        );
        return;
      }

      alert(
        data.message ||
          "Nouveau code envoyé."
      );
    } catch (error) {
      console.error("RESEND VERIFICATION ERROR:", error);
      alert("Impossible de renvoyer le code.");
    } finally {
      setResending(false);
    }
  }

  return (
    <main className="min-h-screen bg-[#050B18] text-white flex items-center justify-center px-5">
      <div className="w-full max-w-md">

        <div className="bg-[#101A2C] border border-slate-800 rounded-3xl p-6">

          <div className="text-center">

            <img
              src="/logo.png"
              alt="AI TONKEEPER"
              className="w-20 h-20 mx-auto"
            />

            <h1 className="text-3xl font-bold mt-5">
              Verification
            </h1>

            <p className="text-gray-400 mt-2">
              Enter the verification code sent to your email.
            </p>

          </div>

          <div className="mt-6">

            <label className="text-sm text-gray-400">
              Email
            </label>

            <div className="w-full mt-2 bg-[#0B1220] border border-slate-700 rounded-xl px-4 py-3 text-gray-300 break-all">
              {email || "Email unavailable"}
            </div>

          </div>

          <div className="mt-5">

            <label className="text-sm text-gray-400">
              Verification Code
            </label>

            <input
              type="text"
              inputMode="numeric"
              autoComplete="one-time-code"
              maxLength={6}
              value={code}
              onChange={(e) => {
                const value =
                  e.target.value.replace(/\D/g, "");

                setCode(value);
              }}
              onKeyDown={(e) => {
                if (
                  e.key === "Enter" &&
                  !loading
                ) {
                  verifyCode();
                }
              }}
              placeholder="Enter 6-digit code"
              className="w-full mt-2 bg-[#0B1220] border border-slate-700 rounded-xl px-4 py-3 text-center text-xl tracking-[0.4em] outline-none focus:border-cyan-500"
            />

          </div>

          <button
            type="button"
            onClick={verifyCode}
            disabled={
              loading ||
              !email ||
              code.length !== 6
            }
            className="w-full mt-5 bg-cyan-500 hover:bg-cyan-600 rounded-xl py-3 font-bold text-black transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading
              ? "Verifying..."
              : "Verify Code"}
          </button>

          <button
            type="button"
            onClick={resendCode}
            disabled={
              resending ||
              !email
            }
            className="w-full mt-3 border border-cyan-500 text-cyan-400 hover:bg-cyan-500 hover:text-black rounded-xl py-3 font-bold transition disabled:opacity-50"
          >
            {resending
              ? "Sending..."
              : "Resend Code"}
          </button>

          <button
            type="button"
            onClick={() => router.push("/login")}
            className="w-full mt-3 text-gray-400 hover:text-white py-2 transition"
          >
            Back to Login
          </button>

        </div>

      </div>
    </main>
  );
}

function VerificationFallback() {
  return (
    <main className="min-h-screen bg-[#050B18] text-white flex items-center justify-center">
      <div className="text-gray-400">
        Loading...
      </div>
    </main>
  );
}

export default function VerificationPage() {
  return (
    <Suspense fallback={<VerificationFallback />}>
      <VerificationContent />
    </Suspense>
  );
}