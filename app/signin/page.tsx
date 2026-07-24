"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../lib/supabase";
import { TonConnectButton } from "@tonconnect/ui-react";
export default function SignIn() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSignIn(e: React.FormEvent) {
    e.preventDefault();

    setLoading(true);

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    setLoading(false);

    if (error) {
      alert(error.message);
      return;
    }

    alert("Bienvenue !");
    router.push("/dashboard");
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-950 via-blue-900 to-black flex items-center justify-center px-6">
      <div className="w-full max-w-md bg-white/10 backdrop-blur-xl rounded-3xl border border-white/20 p-8 shadow-2xl">

        <h1 className="text-4xl font-bold text-white text-center mb-2">
          Welcome Back
        </h1>

        <p className="text-blue-200 text-center mb-8">
          Sign in to your AI TONKEEPER account
        </p>

        <form onSubmit={handleSignIn} className="space-y-5">

          <input
            type="email"
            placeholder="Email Address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full p-4 rounded-xl bg-white/10 border border-white/20 text-white placeholder:text-blue-200 outline-none"
            required
          />

          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full p-4 rounded-xl bg-white/10 border border-white/20 text-white placeholder:text-blue-200 outline-none"
            required
          />

          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 rounded-xl bg-blue-600 hover:bg-blue-500 transition font-bold text-white"
          >
            {loading ? "Signing In..." : "Sign In"}
          </button>
<TonConnectButton className="w-full mt-4" />
        </form>

        <p className="text-center text-blue-200 mt-8">
          Don't have an account?{" "}
          <a href="/signup" className="text-white font-semibold">
            Sign Up
          </a>
        </p>

      </div>
    </main>
  );
}