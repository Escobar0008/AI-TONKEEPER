"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function ForgotPasswordPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleForgotPassword() {
    if (!email) {
      alert("Veuillez saisir votre adresse e-mail.");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("/api/forgot-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        alert(data.message);
        return;
      }

      alert("Code envoyé avec succès.");

      router.push(
        `/forgot-password/verify?email=${encodeURIComponent(email)}`
      );
    } catch (error) {
      console.error(error);
      alert("Une erreur est survenue.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-[#050B18] text-white flex items-center justify-center px-5">
      <div className="w-full max-w-md">

        <div className="text-center mb-8">
          <img
            src="/logo.png"
            alt="AI TONKEEPER"
            className="w-20 h-20 mx-auto"
          />

          <h1 className="text-3xl font-bold mt-4">
            Forgot Password
          </h1>

          <p className="text-gray-400 mt-2">
            Enter your email to receive a verification code.
          </p>
        </div>

        <div className="bg-[#101A2C] border border-slate-800 rounded-3xl p-6">
          <div className="space-y-5">

            <div>
              <label className="text-sm text-gray-400">
                Email Address
              </label>

              <input
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full mt-2 bg-[#0B1220] border border-slate-700 rounded-xl px-4 py-3 outline-none focus:border-cyan-500"
              />
            </div>

            <button
              onClick={handleForgotPassword}
              disabled={loading}
              className="w-full bg-cyan-500 hover:bg-cyan-600 rounded-xl py-3 font-bold text-black transition disabled:opacity-50"
            >
              {loading
                ? "Sending..."
                : "Send Verification Code"}
            </button>

          </div>
        </div>

      </div>
    </main>
  );
}