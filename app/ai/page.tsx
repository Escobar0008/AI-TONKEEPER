"use client";
import "../styles/responsive.css";
import { useState } from "react";

type ChatMessage = {
  sender: "user" | "ai";
  text: string;
};

export default function AIPage() {
  const [message, setMessage] = useState("");

  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      sender: "ai",
      text: "🤖 AI TONKEEPER Online.",
    },
  ]);

  const sendMessage = async () => {
    if (!message.trim()) return;

    const userMessage = message;

    setMessages((prev) => [
      ...prev,
      {
        sender: "user",
        text: userMessage,
      },
    ]);

    setMessage("");

    let coin = userMessage.toLowerCase().trim();

    if (coin === "btc") coin = "bitcoin";
    if (coin === "eth") coin = "ethereum";
    if (coin === "ton") coin = "the-open-network";
    if (coin === "gram") coin = "the-open-network";
    if (coin === "sol") coin = "solana";

    try {
      const res = await fetch(`/api/crypto?coin=${coin}`);
      const data = await res.json();
      if (data.error) {
        setMessages((prev) => [
          ...prev,
          {
            sender: "ai",
            text: "❌ Crypto introuvable.",
          },
        ]);

        return;
      }

      const trend =
        data.change24h >= 0 ? "📈 Bullish" : "📉 Bearish";

      const recommendation =
        data.change24h >= 5
          ? "🔥 STRONG BUY"
          : data.change24h >= 0
          ? "✅ BUY"
          : "⚠️ SELL";

      setMessages((prev) => [
        ...prev,
        {
          sender: "ai",
          text:
            `🪙 ${data.name} (${data.symbol})\n\n` +
            `💲 Prix : $${Number(data.price).toLocaleString()}\n` +
            `📊 Variation 24h : ${Number(data.change24h).toFixed(2)}%\n` +
            `🏦 Market Cap : $${Number(data.marketCap).toLocaleString()}\n\n` +
            `📈 Tendance : ${trend}\n` +
            `🎯 Recommandation : ${recommendation}`,
        },
      ]);
      } catch (error) {
      setMessages((prev) => [
        ...prev,
        {
          sender: "ai",
          text: "❌ Impossible de récupérer les données.",
        },
      ]);
    }
    };
    return (
    <div className="min-h-screen bg-slate-950 text-white p-8">
      <h1 className="text-4xl font-bold text-cyan-400">
        AI TONKEEPER
      </h1>

      <p className="mt-2 text-slate-400">
        Welcome to the AI Crypto Assistant.
      </p>

      <div className="mt-8 rounded-xl bg-slate-900 p-6 shadow-lg">
        <h2 className="text-2xl font-bold mb-6">
          AI Chat
        </h2>

        <div className="space-y-4">
            {messages.map((msg, index) => (
          <div
            key={index}
            className={`rounded-lg p-4 ${
              msg.sender === "ai"
                ? "bg-slate-800 text-white"
                : "bg-cyan-600 text-white text-right"
            }`}
          >
            {msg.text}
          </div>
        ))}

        <div className="flex gap-3">
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") sendMessage();
            }}
            placeholder="Ask AI about crypto..."
            className="flex-1 rounded-lg bg-slate-800 p-4 text-white outline-none"
          />

          <button
            onClick={sendMessage}
            className="rounded-lg bg-cyan-500 px-6 font-bold text-black hover:bg-cyan-400"
          >
            Send
          </button>
        </div>
        </div>

      <div className="mt-6 flex justify-end">
        <button
          onClick={() => {
            setMessages([
              {
                sender: "ai",
                text: "🤖 AI TONKEEPER Online.",
              },
            ]);
          }}
          className="rounded-lg bg-red-500 px-5 py-2 font-bold text-white hover:bg-red-600"
        >
          Clear Chat
        </button>
      </div>
      <div className="mt-8 rounded-xl bg-slate-900 p-6">
        <h3 className="mb-4 text-xl font-bold text-cyan-400">
          AI Features
        </h3>

        <ul className="space-y-2 text-slate-300">
          <li>✅ Live Crypto Prices</li>
          <li>✅ AI Market Analysis</li>
          <li>✅ Buy / Sell Recommendation</li>
          <li>✅ TON Ecosystem Support</li>
          <li>✅ Fast API Response</li>
        </ul>
      </div>
      <div className="mt-8 rounded-xl bg-slate-900 p-6">
        <h3 className="mb-4 text-xl font-bold text-cyan-400">
          Supported Coins
        </h3>

        <div className="grid grid-cols-2 gap-3 text-slate-300">
          <div>🟠 Bitcoin (BTC)</div>
          <div>🔵 Ethereum (ETH)</div>
          <div>💎 TON (TON)</div>
          <div>🟣 Solana (SOL)</div>
          <div>🟡 BNB</div>
          <div>⚫ XRP</div>
        </div>
      </div>
      </div>
    </div>
  );
}