"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleLogin() {
    const cleanEmail = email.trim().toLowerCase();

    if (!cleanEmail || !password) {
      alert("Veuillez remplir tous les champs.");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("/api/auth-login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: cleanEmail,
          password,
        }),
      });

      const data = await response.json();

      console.log("AUTH LOGIN RESPONSE:", data);

      if (!response.ok || !data.success) {
        alert(
          data.message ||
            data.error ||
            "Impossible de se connecter."
        );
        return;
      }

      /*
       * Le serveur a vérifié :
       * - l'utilisateur
       * - le mot de passe
       * - l'adresse e-mail
       *
       * Puis il a envoyé le code de connexion.
       *
       * On va maintenant vers la page
       * de vérification du code.
       */
      router.push(
        `/login/verify?email=${encodeURIComponent(
          cleanEmail
        )}`
      );
    } catch (error) {
      console.error("LOGIN ERROR:", error);

      alert(
        "Une erreur serveur est survenue. Veuillez réessayer."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-[#050B18] text-white flex items-center justify-center px-5">
      <div className="w-full max-w-md">

        {/* LOGO / HEADER */}
        <div className="text-center mb-8">
          <img
            src="/logo.png"
            alt="AI TONKEEPER"
            className="w-20 h-20 mx-auto"
          />

          <h1 className="text-3xl font-bold mt-4">
            Welcome Back
          </h1>

          <p className="text-gray-400 mt-2">
            Sign in to your AI TONKEEPER account
          </p>
        </div>

        {/* LOGIN CARD */}
        <div className="bg-[#101A2C] border border-slate-800 rounded-3xl p-6">

          <div className="space-y-5">

            {/* EMAIL */}
            <div>
              <label
                htmlFor="email"
                className="text-sm text-gray-400"
              >
                Email Address
              </label>

              <input
                id="email"
                type="email"
                autoComplete="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) =>
                  setEmail(e.target.value)
                }
                disabled={loading}
                className="w-full mt-2 bg-[#0B1220] border border-slate-700 rounded-xl px-4 py-3 outline-none focus:border-cyan-500 disabled:opacity-50"
              />
            </div>

            {/* PASSWORD */}
            <div>
              <label
                htmlFor="password"
                className="text-sm text-gray-400"
              >
                Password
              </label>

              <input
                id="password"
                type="password"
                autoComplete="current-password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) =>
                  setPassword(e.target.value)
                }
                disabled={loading}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    handleLogin();
                  }
                }}
                className="w-full mt-2 bg-[#0B1220] border border-slate-700 rounded-xl px-4 py-3 outline-none focus:border-cyan-500 disabled:opacity-50"
              />
            </div>

            {/* FORGOT PASSWORD */}
            <div className="flex justify-end">
              <button
                type="button"
                onClick={() =>
                  router.push("/forgot-password")
                }
                disabled={loading}
                className="text-cyan-400 text-sm hover:underline disabled:opacity-50"
              >
                Forgot Password?
              </button>
            </div>

            {/* LOGIN */}
            <button
              type="button"
              onClick={handleLogin}
              disabled={loading}
              className="w-full bg-cyan-500 hover:bg-cyan-600 rounded-xl py-3 font-bold text-black transition disabled:opacity-50"
            >
              {loading
                ? "Sending Code..."
                : "Login"}
            </button>

          </div>
        </div>
      </div>
    </main>
  );
}