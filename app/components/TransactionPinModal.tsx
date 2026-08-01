"use client";

import { useState } from "react";

type Props = {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
};

export default function TransactionPinModal({
  open,
  onClose,
  onSuccess,
}: Props) {
  const [pin, setPin] = useState("");
  const [loading, setLoading] = useState(false);

  if (!open) return null;

  async function verifyPin() {
    const userId = localStorage.getItem("userId");

    if (!userId) {
      alert("Utilisateur non connecté.");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/verify-pin", {
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

      setPin("");
      onSuccess();

    } catch (error) {
      console.error(error);
      setLoading(false);
      alert("Erreur serveur.");
    }
  }

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">

      <div className="bg-[#101A2C] rounded-3xl p-8 w-[90%] max-w-md border border-slate-700">

        <h2 className="text-2xl text-white font-bold text-center">
          Transaction PIN
        </h2>

        <p className="text-slate-400 text-center mt-3 mb-6">
          Entrez votre code de transaction à 6 chiffres.
        </p>

        <input
          type="password"
          inputMode="numeric"
          maxLength={6}
          value={pin}
          onChange={(e) => setPin(e.target.value)}
          placeholder="••••••"
          className="w-full rounded-xl bg-[#0B1322] border border-slate-700 p-4 text-center text-white text-2xl tracking-[10px]"
        />

        <div className="flex gap-3 mt-6">

          <button
            onClick={onClose}
            className="flex-1 rounded-xl border border-slate-600 py-3 text-white"
          >
            Annuler
          </button>

          <button
            disabled={loading}
            onClick={verifyPin}
            className="flex-1 rounded-xl bg-cyan-500 py-3 font-bold text-black"
          >
            {loading ? "..." : "Valider"}
          </button>

        </div>

      </div>

    </div>
  );
}