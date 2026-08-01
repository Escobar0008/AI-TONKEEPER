"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function CreatePinPage() {
  const router = useRouter();

  const [pin, setPin] = useState("");
  const [confirmPin, setConfirmPin] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleCreatePin(e: React.FormEvent) {
    e.preventDefault();

    if (!/^\d{6}$/.test(pin)) {
      alert("Le PIN doit contenir exactement 6 chiffres.");
      return;
    }

    if (pin !== confirmPin) {
      alert("Les deux PIN ne correspondent pas.");
      return;
    }

    const userId = localStorage.getItem("userId");

    if (!userId) {
      alert("Utilisateur non connecté.");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/transaction-pin", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId,
          pin,
        }),
      });

      const data = await res.json();

      setLoading(false);

      if (!res.ok) {
        alert(data.error);
        return;
      }

      alert("✅ Code de transaction créé avec succès.");

      router.push("/dashboard");

    } catch (error) {
      setLoading(false);
      console.error(error);
      alert("Erreur serveur.");
    }
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-[#050B18] px-6">
      <div className="w-full max-w-md rounded-3xl bg-[#101A2C] border border-slate-800 p-8">

        <h1 className="text-3xl font-bold text-white text-center">
          Créer votre code de transaction
        </h1>

        <p className="text-slate-400 text-center mt-3 mb-8">
          Ce code sera demandé avant chaque retrait.
        </p>

        <form
          onSubmit={handleCreatePin}
          className="space-y-5"
        >

          <input
            type="password"
            inputMode="numeric"
            maxLength={6}
            placeholder="PIN (6 chiffres)"
            value={pin}
            onChange={(e) => setPin(e.target.value)}
            className="w-full rounded-xl border border-slate-700 bg-[#0B1322] p-4 text-white outline-none"
          />

          <input
            type="password"
            inputMode="numeric"
            maxLength={6}
            placeholder="Confirmer le PIN"
            value={confirmPin}
            onChange={(e) => setConfirmPin(e.target.value)}
            className="w-full rounded-xl border border-slate-700 bg-[#0B1322] p-4 text-white outline-none"
          />

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-cyan-500 py-4 font-bold text-black hover:bg-cyan-400 transition"
          >
            {loading ? "Création..." : "Créer le PIN"}
          </button>

        </form>

      </div>
    </main>
  );
}