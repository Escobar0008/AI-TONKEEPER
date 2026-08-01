"use client";

import { useState } from "react";

export default function VerifyEmailPage() {
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleVerify(e: React.FormEvent) {
    e.preventDefault();

    setLoading(true);

    try {
      const res = await fetch("/api/verify-code", {
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

      setLoading(false);

      if (!res.ok) {
        alert(data.error || "Invalid verification code.");
        return;
      }

      alert("✅ Email verified successfully!");

      window.location.href = "/signin";
    } catch (error) {
      console.error(error);
      setLoading(false);
      alert("Server error.");
    }
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#050B18] via-[#0B2E6D] to-[#050B18] px-6">

      <div className="w-full max-w-md rounded-3xl bg-white/10 backdrop-blur-xl border border-white/20 p-8">

        <h1 className="text-3xl font-bold text-white text-center">
          Verify your email
        </h1>

        <p className="text-blue-200 text-center mt-3 mb-8">
          Enter the 6-digit code sent to your email.
        </p>

        <form onSubmit={handleVerify} className="space-y-5">

          <input
            type="email"
            placeholder="Email"
            className="w-full rounded-xl bg-white/10 border border-white/20 p-4 text-white"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <input
            type="text"
            maxLength={6}
            placeholder="123456"
            className="w-full rounded-xl bg-white/10 border border-white/20 p-4 text-center text-2xl tracking-[10px] text-white"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            required
          />

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-blue-600 py-4 font-bold text-white"
          >
            {loading ? "Verifying..." : "Verify"}
          </button>

        </form>

      </div>

    </main>
  );
}