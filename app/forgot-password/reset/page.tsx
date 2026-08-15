"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

function ResetPasswordContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const email = searchParams.get("email") || "";

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleResetPassword() {
    if (!password || !confirmPassword) {
      alert("Veuillez remplir tous les champs.");
      return;
    }

    if (password !== confirmPassword) {
      alert("Les mots de passe ne correspondent pas.");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("/api/reset-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        alert(data.message || "Impossible de modifier le mot de passe.");
        return;
      }

      alert("Mot de passe modifié avec succès.");

      router.push("/login");
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
            Reset Password
          </h1>

          <p className="mt-2 text-gray-400">
            Choose your new password.
          </p>
        </div>

        {/* Reset Password Card */}

        <div className="rounded-3xl border border-slate-800 bg-[#101A2C] p-6">
          <div className="space-y-5">
            <input
              type="password"
              placeholder="New Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={loading}
              className="w-full rounded-xl border border-slate-700 bg-[#0B1220] px-4 py-3 outline-none focus:border-cyan-500 disabled:opacity-50"
            />

            <input
              type="password"
              placeholder="Confirm Password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              disabled={loading}
              className="w-full rounded-xl border border-slate-700 bg-[#0B1220] px-4 py-3 outline-none focus:border-cyan-500 disabled:opacity-50"
            />

            <button
              type="button"
              onClick={handleResetPassword}
              disabled={loading}
              className="w-full rounded-xl bg-cyan-500 py-3 font-bold text-black transition hover:bg-cyan-600 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading ? "Saving..." : "Reset Password"}
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}

export default function ResetPasswordPage() {
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
      <ResetPasswordContent />
    </Suspense>
  );
}