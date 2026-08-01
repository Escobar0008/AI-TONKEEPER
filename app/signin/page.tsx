"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Eye, EyeOff } from "lucide-react";

export default function SignInPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  async function handleSignIn(e: React.FormEvent) {
    e.preventDefault();

    setLoading(true);

    try {
      const res = await fetch("/api/auth/signin", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          password,
        }),
      });

      const data = await res.json();

      setLoading(false);

      if (!res.ok) {
        alert(data.error || "Login failed.");
        return;
      }
// Sauvegarder l'utilisateur connecté
localStorage.setItem("userId", data.user.id);
      // Le cookie est créé automatiquement par l'API

      if (!data.user.transactionPin) {
        router.push("/create-pin");
      } else {
        router.push("/dashboard");
      }

    } catch (error) {
      console.error(error);
      setLoading(false);

      alert("Server error.");
    }
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#0b1025] via-[#1d3ea3] to-[#050816] p-6">

      <div className="w-full max-w-md rounded-3xl border border-white/20 bg-white/10 backdrop-blur-xl shadow-2xl p-8">

        <h1 className="text-4xl font-bold text-center text-white">
          Welcome Back
        </h1>

        <p className="mt-3 text-center text-blue-100">
          Sign in to your AI TONKEEPER account
        </p>

        <form
          onSubmit={handleSignIn}
          className="mt-8 space-y-5"
        >

          <div>

            <label className="mb-2 block text-sm text-blue-100">
              Email Address
            </label>

            <input
              type="email"
              placeholder="Email Address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full rounded-xl border border-white/20 bg-white/10 px-4 py-3 text-white placeholder:text-gray-300 outline-none focus:border-blue-400"
            />

          </div>

          <div>

            <label className="mb-2 block text-sm text-blue-100">
              Password
            </label>

            <div className="relative">

              <input
                type={showPassword ? "text" : "password"}
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full rounded-xl border border-white/20 bg-white/10 px-4 py-3 pr-12 text-white placeholder:text-gray-300 outline-none focus:border-blue-400"
              />

              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-300 hover:text-white"
              >
                {showPassword ? (
                  <EyeOff size={22} />
                ) : (
                  <Eye size={22} />
                )}
              </button>

            </div>

          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-blue-600 py-3 font-semibold text-white transition hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? "Signing In..." : "Sign In"}
          </button>

        </form>

        <p className="mt-8 text-center text-blue-100">

          Don't have an account?{" "}

          <Link
            href="/signup"
            className="font-bold text-white hover:underline"
          >
            Sign Up
          </Link>

        </p>

      </div>

    </main>
  );
}