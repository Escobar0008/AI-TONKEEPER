"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function RegisterPage() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleRegister() {
    if (!name || !email || !password || !confirmPassword) {
      alert("Veuillez remplir tous les champs.");
      return;
    }

    if (password !== confirmPassword) {
      alert("Les mots de passe ne correspondent pas.");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("/api/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name,
          email,
          password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        alert(data.error);
        setLoading(false);
        return;
      }

      alert("Compte créé ! Vérifiez votre e-mail.");

      router.push(`/verification?email=${encodeURIComponent(email)}`);
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
            Create Account
          </h1>

          <p className="text-gray-400 mt-2">
            Join AI TONKEEPER
          </p>
        </div>

        <div className="bg-[#101A2C] border border-slate-800 rounded-3xl p-6">

          <div className="space-y-5">

            <div>
              <label className="text-sm text-gray-400">
                Full Name
              </label>

              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter your full name"
                className="w-full mt-2 bg-[#0B1220] border border-slate-700 rounded-xl px-4 py-3 outline-none focus:border-cyan-500"
              />
            </div>

            <div>
              <label className="text-sm text-gray-400">
                Email Address
              </label>

              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                className="w-full mt-2 bg-[#0B1220] border border-slate-700 rounded-xl px-4 py-3 outline-none focus:border-cyan-500"
              />
            </div>

            <div>
              <label className="text-sm text-gray-400">
                Password
              </label>

              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Create a password"
                className="w-full mt-2 bg-[#0B1220] border border-slate-700 rounded-xl px-4 py-3 outline-none focus:border-cyan-500"
              />
            </div>

            <div>
              <label className="text-sm text-gray-400">
                Confirm Password
              </label>

              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm your password"
                className="w-full mt-2 bg-[#0B1220] border border-slate-700 rounded-xl px-4 py-3 outline-none focus:border-cyan-500"
              />
            </div>

            <button
              onClick={handleRegister}
              disabled={loading}
              className="w-full bg-cyan-500 hover:bg-cyan-600 rounded-xl py-3 font-bold text-black transition disabled:opacity-50"
            >
              {loading ? "Creating Account..." : "Create Account"}
            </button>

          </div>

        </div>

      </div>
    </main>
  );
}