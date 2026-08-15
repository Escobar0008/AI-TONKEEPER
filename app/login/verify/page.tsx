"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { signIn } from "next-auth/react";

function VerifyLoginContent() {
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

    const cleanCode = code.trim();

    if (!cleanCode) {
      alert("Veuillez saisir le code.");
      return;
    }

    if (cleanCode.length !== 6) {
      alert("Le code doit contenir 6 chiffres.");
      return;
    }

    setLoading(true);

    try {
      // ============================================================
      // 1. VÉRIFIER LE CODE EMAIL
      // ============================================================

      const response = await fetch("/api/verify-login-code", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          code: cleanCode,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        alert(data.message || "Code incorrect.");
        return;
      }

      // ============================================================
      // 2. LE CODE EST CORRECT
      // ============================================================

      // On crée maintenant réellement la session NextAuth.
      const loginResult = await signIn("credentials", {
        redirect: false,
        email,
        loginVerified: "true",
        callbackUrl: "/dashboard",
      });

      // ============================================================
      // 3. VÉRIFIER LA CRÉATION DE SESSION
      // ============================================================

      if (!loginResult || loginResult.error) {
        console.error("NextAuth login error:", loginResult);

        alert(
          loginResult?.error ||
            "Le code est correct, mais la session n'a pas pu être créée."
        );

        return;
      }

      // ============================================================
      // 4. SESSION CRÉÉE → DASHBOARD
      // ============================================================

      router.replace("/dashboard");
      router.refresh();
    } catch (error) {
      console.error("Verification error:", error);
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
      const response = await fetch("/api/login", {
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
        alert(data.message || "Impossible de renvoyer le code.");
        return;
      }

      alert(data.message || "Nouveau code envoyé.");
    } catch (error) {
      console.error("Resend error:", error);
      alert("Impossible de renvoyer le code.");
    } finally {
      setResending(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#050B18] px-5 text-white">
      <div className="w-full max-w-md rounded-3xl border border-slate-800 bg-[#101A2C] p-6">

        {/* Logo */}
        <img
          src="/logo.png"
          alt="AI TONKEEPER"
          className="mx-auto h-20 w-20 object-contain"
        />

        {/* Title */}
        <h1 className="mt-4 text-center text-3xl font-bold">
          Login Verification
        </h1>

        <p className="mt-2 text-center text-gray-400">
          Enter the code sent to your email.
        </p>

        {/* Email */}
        {email && (
          <p className="mt-3 break-all text-center text-sm text-cyan-400">
            {email}
          </p>
        )}

        {/* Code */}
        <input
          type="text"
          inputMode="numeric"
          autoComplete="one-time-code"
          maxLength={6}
          placeholder="6-digit code"
          value={code}
          onChange={(e) => {
            const value = e.target.value.replace(/\D/g, "");
            setCode(value);
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !loading) {
              verifyCode();
            }
          }}
          className="mt-6 w-full rounded-xl border border-slate-700 bg-[#0B1220] px-4 py-3 text-center tracking-[0.35em] outline-none focus:border-cyan-500"
        />

        {/* Verify */}
        <button
          type="button"
          onClick={verifyCode}
          disabled={loading || !email || code.length !== 6}
          className="mt-5 w-full rounded-xl bg-cyan-500 py-3 font-bold text-black transition hover:bg-cyan-600 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {loading ? "Signing in..." : "Verify Code"}
        </button>

        {/* Resend */}
        <button
          type="button"
          onClick={resendCode}
          disabled={resending || !email}
          className="mt-3 w-full rounded-xl border border-cyan-500 py-3 font-bold text-cyan-400 transition hover:bg-cyan-500 hover:text-black disabled:cursor-not-allowed disabled:opacity-50"
        >
          {resending ? "Sending..." : "Resend Code"}
        </button>

      </div>
    </main>
  );
}

function VerifyLoginFallback() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-[#050B18] px-5 text-white">
      <div className="w-full max-w-md rounded-3xl border border-slate-800 bg-[#101A2C] p-6 text-center">

        <img
          src="/logo.png"
          alt="AI TONKEEPER"
          className="mx-auto h-20 w-20 object-contain"
        />

        <h1 className="mt-4 text-2xl font-bold">
          Loading...
        </h1>

        <p className="mt-2 text-gray-400">
          Preparing login verification.
        </p>

      </div>
    </main>
  );
}

export default function VerifyLoginPage() {
  return (
    <Suspense fallback={<VerifyLoginFallback />}>
      <VerifyLoginContent />
    </Suspense>
  );
}