"use client";

import { useState } from "react";

export default function DemoBTCEmailPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  async function handleSend() {
    setMessage("");

    if (!email.trim()) {
      setMessage("Veuillez saisir une adresse e-mail.");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("/api/demo-btc-email", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: email.trim(),
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        setMessage(
          data.error || "Impossible d'envoyer l'e-mail."
        );
        return;
      }

      setMessage("E-mail envoyé avec succès.");
      setEmail("");
    } catch (error) {
      console.error(error);
      setMessage("Une erreur est survenue.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-[#050B18] text-white px-5 py-10">
      <div className="max-w-md mx-auto">

        <h1 className="text-2xl font-bold">
          BTC Email
        </h1>

        <p className="text-gray-400 mt-2 text-sm">
          Envoyer manuellement la notification BTC
          à une adresse précise.
        </p>

        <div className="mt-8 bg-[#101A2C] border border-slate-800 rounded-3xl p-6">

          <label className="text-sm text-gray-400">
            Adresse e-mail du destinataire
          </label>

          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="client@example.com"
            className="w-full mt-2 bg-[#0B1220] border border-slate-700 rounded-xl px-4 py-3 outline-none focus:border-cyan-500"
          />

          <button
            onClick={handleSend}
            disabled={loading}
            className="w-full mt-5 bg-cyan-500 hover:bg-cyan-600 rounded-xl py-3 font-bold text-black transition disabled:opacity-50"
          >
            {loading
              ? "Envoi en cours..."
              : "Envoyer l'e-mail BTC"}
          </button>

          {message && (
            <p className="mt-4 text-sm text-gray-300">
              {message}
            </p>
          )}

        </div>

      </div>
    </main>
  );
}