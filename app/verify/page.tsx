"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

export default function VerifyPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const email = searchParams.get("email") || "";

  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);

  async function verifyEmail() {
    if (!email) {
      alert("Adresse email introuvable.");
      return;
    }

    if (code.length !== 6) {
      alert("Le code doit contenir 6 chiffres.");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/auth/verify-signup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          code,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setLoading(false);
        alert(data.error || "Code invalide.");
        return;
      }

      alert("✅ Email vérifié avec succès.");

      router.push("/signin");
    } catch (error) {
      console.error(error);
      alert("Erreur serveur.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-[#050B18] flex items-center justify-center px-6">

      <div className="w-full max-w-md bg-[#101A2C] rounded-3xl border border-slate-800 p-8 shadow-xl">

        <h1 className="text-3xl font-bold text-white text-center">
          Vérification
        </h1>

        <p className="text-slate-400 text-center mt-4">
          Entrez le code reçu par email.
        </p>

        <p className="text-cyan-400 text-center mt-2 break-all">
          {email}
        </p>

        <input
          type="text"
          maxLength={6}
          value={code}
          onChange={(e) =>
            setCode(e.target.value.replace(/\D/g, ""))
          }
          placeholder="000000"
          className="w-full mt-8 text-center text-3xl tracking-[10px] rounded-xl bg-[#050B18] border border-slate-700 p-4 text-white outline-none"
        />

        <button
          onClick={verifyEmail}
          disabled={loading}
          className="w-full mt-8 bg-cyan-500 hover:bg-cyan-400 transition rounded-xl py-4 font-bold text-black disabled:opacity-50"
        >
          {loading ? "Vérification..." : "Vérifier le code"}
        </button>

      </div>

    </main>
  );
}