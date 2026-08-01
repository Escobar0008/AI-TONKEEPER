"use client";

import { useState } from "react";

export default function SignUp() {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  async function handleSignUp(e: React.FormEvent) {
    e.preventDefault();

    if (!fullName || !email || !password) {
      alert("Veuillez remplir tous les champs.");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("/api/auth/signup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: fullName,
          email,
          password,
        }),
      });

      const data = await response.json();

      setLoading(false);

      if (!response.ok) {
        alert(data.error || "Impossible de créer le compte.");
        return;
      }

      alert("📩 Un code de vérification a été envoyé à votre adresse email.");

      window.location.href =
        `/verify?email=${encodeURIComponent(email)}`;

    } catch (error) {
      console.error(error);
      setLoading(false);
      alert("Erreur serveur.");
    }
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-950 via-blue-900 to-black flex items-center justify-center px-6">

      <div className="w-full max-w-md rounded-3xl bg-white/10 backdrop-blur-xl border border-white/20 p-8 shadow-2xl">

        <h1 className="text-4xl font-bold text-white text-center mb-2">
          Create Account
        </h1>

        <p className="text-blue-200 text-center mb-8">
          Join AI TONKEEPER today
        </p>

        <form
          onSubmit={handleSignUp}
          className="space-y-5"
        >

          <input
            type="text"
            placeholder="Full Name"
            value={fullName}
            onChange={(e) =>
              setFullName(e.target.value)
            }
            className="w-full rounded-xl border border-white/20 bg-white/10 p-4 text-white placeholder:text-blue-200 outline-none"
            required
          />

          <input
            type="email"
            placeholder="Email Address"
            value={email}
            onChange={(e) =>
              setEmail(e.target.value)
            }
            className="w-full rounded-xl border border-white/20 bg-white/10 p-4 text-white placeholder:text-blue-200 outline-none"
            required
          />

          <div className="relative">

            <input
              type={
                showPassword
                  ? "text"
                  : "password"
              }
              placeholder="Password"
              value={password}
              onChange={(e) =>
                setPassword(e.target.value)
              }
              className="w-full rounded-xl border border-white/20 bg-white/10 p-4 pr-14 text-white placeholder:text-blue-200 outline-none"
              required
            />

            <button
              type="button"
              onClick={() =>
                setShowPassword(!showPassword)
              }
              className="absolute right-4 top-1/2 -translate-y-1/2 text-blue-200 hover:text-white"
            >
              {showPassword ? "🙈" : "👁️"}
            </button>

          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-blue-600 py-4 font-bold text-white transition hover:bg-blue-500 disabled:opacity-50"
          >
            {loading
              ? "Creating account..."
              : "Create Account"}
          </button>

        </form>

        <p className="mt-8 text-center text-blue-200">
          Already have an account?{" "}
          <a
            href="/signin"
            className="font-semibold text-white"
          >
            Sign In
          </a>
        </p>

      </div>

    </main>
  );
}