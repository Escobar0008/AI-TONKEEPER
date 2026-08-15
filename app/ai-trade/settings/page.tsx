"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Bot,
  ShieldCheck,
  TrendingUp,
  Wallet,
  BarChart3,
  Activity,
  Save,
} from "lucide-react";
type Strategy = "CONSERVATIVE" | "BALANCED" | "AGGRESSIVE";
type RiskLevel = "LOW" | "MEDIUM" | "HIGH";
type AITradeSettings = {
  strategy: Strategy;
  riskLevel: RiskLevel;
  minimumConfidence: number;
  maximumTradeAllocation: number;
  stopLossProtection: boolean;
  dailyLossProtection: boolean;
  emergencyStop: boolean;
  updatedAt: string;
};
const DEFAULT_SETTINGS: AITradeSettings = {
  strategy: "BALANCED",
  riskLevel: "MEDIUM",
  minimumConfidence: 70,
  maximumTradeAllocation: 10,
  stopLossProtection: true,
  dailyLossProtection: true,
  emergencyStop: true,
  updatedAt: "",
};
export default function AITradeSettingsPage() {
  const router = useRouter();
  const [settings, setSettings] =
    useState<AITradeSettings>(DEFAULT_SETTINGS);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  async function loadSettings() {
    try {
      setLoading(true);
      setError("");
      const response = await fetch(
        "/api/ai-trade/settings",
        {
          method: "GET",
          cache: "no-store",
        }
      );
      const data = await response.json();
      if (!response.ok || !data?.success) {
        setError(
          data?.message ||
            "Unable to load AI Trade settings."
        );
        return;
      }
      if (data?.settings) {
        setSettings(data.settings);
      }
    } catch (error) {
      console.error(
        "AI TRADE SETTINGS LOAD ERROR:",
        error
      );
      setError(
        "Unable to connect to AI Trade settings API."
      );
    } finally {
      setLoading(false);
    }
  }
  async function saveSettings() {
    try {
      setSaving(true);
      setMessage("");
      setError("");
      const response = await fetch(
        "/api/ai-trade/settings",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            strategy: settings.strategy,
            riskLevel: settings.riskLevel,
            minimumConfidence:
              settings.minimumConfidence,
            maximumTradeAllocation:
              settings.maximumTradeAllocation,
            stopLossProtection:
              settings.stopLossProtection,
            dailyLossProtection:
              settings.dailyLossProtection,
            emergencyStop:
              settings.emergencyStop,
          }),
        }
      );
      const data = await response.json();
      if (!response.ok || !data?.success) {
        setError(
          data?.message ||
            "Unable to save AI Trade settings."
        );
        return;
      }
      if (data?.settings) {
        setSettings(data.settings);
      }
      setMessage(
        "AI Trade settings saved successfully."
      );
    } catch (error) {
      console.error(
        "AI TRADE SETTINGS SAVE ERROR:",
        error
      );
      setError(
        "Unable to connect to AI Trade settings API."
      );
    } finally {
      setSaving(false);
    }
  }
  function updateSetting<K extends keyof AITradeSettings>(
    key: K,
    value: AITradeSettings[K]
  ) {
    setSettings((current) => ({
      ...current,
      [key]: value,
    }));
    setMessage("");
    setError("");
  }
  useEffect(() => {
  const timer = window.setTimeout(() => {
    void loadSettings();
  }, 0);

  return () => {
    window.clearTimeout(timer);
  };
}, []);
  return (
    <main className="min-h-screen bg-[#050B18] text-white pb-10">
      <div className="max-w-md mx-auto px-5 py-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <button
            onClick={() => router.back()}
            className="w-12 h-12 rounded-2xl bg-[#101A2C] border border-slate-800 flex items-center justify-center"
          >
            <ArrowLeft size={22} />
          </button>
          <div className="text-center">
            <h1 className="text-2xl font-bold">
              AI Trade Settings
            </h1>
            <p className="text-sm text-cyan-400 mt-1">
              Configure your AI trading engine
            </p>
          </div>
          <div className="w-12 h-12" />
        </div>
        {/* Loading */}
        {loading && (
          <div className="mb-6 rounded-2xl bg-[#101A2C] border border-slate-800 p-4 text-center text-sm text-gray-400">
            Loading AI Trade settings...
          </div>
        )}
        {/* Error */}
        {error && (
          <div className="mb-6 rounded-2xl bg-red-500/10 border border-red-500/30 p-4 text-center text-sm text-red-300">
            {error}
          </div>
        )}
        {/* Success */}
        {message && (
          <div className="mb-6 rounded-2xl bg-green-500/10 border border-green-500/30 p-4 text-center text-sm text-green-300">
            {message}
          </div>
        )}
        {/* AI Engine */}
        <div className="rounded-3xl bg-gradient-to-br from-cyan-600 to-blue-700 p-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center">
              <Bot size={26} />
            </div>
            <div>
              <h2 className="text-xl font-bold">
                AI Trading Engine
              </h2>
              <p className="text-sm text-blue-100">
                Autonomous market analysis
              </p>
            </div>
          </div>
          <div className="mt-6 flex items-center justify-between">
            <div>
              <p className="text-sm text-blue-100">
                Engine status
              </p>
              <p className="font-semibold mt-1">
                Ready
              </p>
            </div>
            <span className="px-4 py-2 rounded-full bg-green-500/20 text-green-300 text-sm font-semibold">
              ● READY
            </span>
          </div>
        </div>
        {/* Trading Strategy */}
        <section className="mt-7">
          <h2 className="text-xs font-semibold tracking-widest text-gray-500 uppercase mb-4">
            Trading Strategy
          </h2>
          <div className="rounded-3xl bg-[#101A2C] border border-slate-800 overflow-hidden">
            {/* Strategy */}
            <div className="p-5 border-b border-slate-800">
              <div className="flex items-center gap-4">
                <div className="w-11 h-11 rounded-2xl bg-cyan-500/20 flex items-center justify-center">
                  <TrendingUp
                    size={22}
                    className="text-cyan-400"
                  />
                </div>
                <div className="flex-1">
                  <p className="font-semibold">
                    Strategy
                  </p>
                  <select
                    value={settings.strategy}
                    onChange={(event) =>
                      updateSetting(
                        "strategy",
                        event.target.value as Strategy
                      )
                    }
                    className="mt-2 w-full rounded-xl bg-[#0B1220] border border-slate-700 px-3 py-3 text-white outline-none"
                  >
                    <option value="CONSERVATIVE">
                      Conservative
                    </option>
                    <option value="BALANCED">
                      Balanced
                    </option>
                    <option value="AGGRESSIVE">
                      Aggressive
                    </option>
                  </select>
                </div>
              </div>
            </div>
            {/* Risk Level */}
            <div className="p-5 border-b border-slate-800">
              <div className="flex items-center gap-4">
                <div className="w-11 h-11 rounded-2xl bg-yellow-500/20 flex items-center justify-center">
                  <ShieldCheck
                    size={22}
                    className="text-yellow-400"
                  />
                </div>
                <div className="flex-1">
                  <p className="font-semibold">
                    Risk Level
                  </p>
                  <select
                    value={settings.riskLevel}
                    onChange={(event) =>
                      updateSetting(
                        "riskLevel",
                        event.target.value as RiskLevel
                      )
                    }
                    className="mt-2 w-full rounded-xl bg-[#0B1220] border border-slate-700 px-3 py-3 text-white outline-none"
                  >
                    <option value="LOW">
                      Low Risk
                    </option>
                    <option value="MEDIUM">
                      Medium Risk
                    </option>
                    <option value="HIGH">
                      High Risk
                    </option>
                  </select>
                </div>
              </div>
            </div>
            {/* Minimum Confidence */}
            <div className="p-5">
              <div className="flex items-center gap-4">
                <div className="w-11 h-11 rounded-2xl bg-purple-500/20 flex items-center justify-center">
                  <Activity
                    size={22}
                    className="text-purple-400"
                  />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-semibold">
                        Minimum AI Confidence
                      </p>
                      <p className="text-sm text-gray-400 mt-1">
                        Required before entering a trade
                      </p>
                    </div>
                    <span className="text-cyan-400 font-bold">
                      {settings.minimumConfidence}%
                    </span>
                  </div>
                </div>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={settings.minimumConfidence}
                onChange={(event) =>
                  updateSetting(
                    "minimumConfidence",
                    Number(event.target.value)
                  )
                }
                className="w-full mt-5 accent-cyan-400"
              />
            </div>
          </div>
        </section>
        {/* Trading Assets */}
        <section className="mt-7">
          <h2 className="text-xs font-semibold tracking-widest text-gray-500 uppercase mb-4">
            Trading Assets
          </h2>
          <div className="rounded-3xl bg-[#101A2C] border border-slate-800 p-5">
            <div className="flex items-center gap-4">
              <div className="w-11 h-11 rounded-2xl bg-blue-500/20 flex items-center justify-center">
                <BarChart3
                  size={22}
                  className="text-blue-400"
                />
              </div>
              <div>
                <p className="font-semibold">
                  Supported Assets
                </p>
                <p className="text-sm text-gray-400">
                  Assets monitored by the AI engine
                </p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3 mt-5">
              {["TON", "BTC", "ETH", "BNB", "USDT"].map(
                (coin) => (
                  <div
                    key={coin}
                    className="rounded-2xl bg-[#0B1220] border border-slate-800 p-4 flex items-center justify-between"
                  >
                    <span className="font-semibold">
                      {coin}
                    </span>
                    <span className="w-2.5 h-2.5 rounded-full bg-green-400" />
                  </div>
                )
              )}
            </div>
          </div>
        </section>
        {/* Capital Management */}
        <section className="mt-7">
          <h2 className="text-xs font-semibold tracking-widest text-gray-500 uppercase mb-4">
            Capital Management
          </h2>
          <div className="rounded-3xl bg-[#101A2C] border border-slate-800 overflow-hidden">
            <div className="p-5 border-b border-slate-800">
              <div className="flex items-center gap-4">
                <div className="w-11 h-11 rounded-2xl bg-green-500/20 flex items-center justify-center">
                  <Wallet
                    size={22}
                    className="text-green-400"
                  />
                </div>
                <div>
                  <p className="font-semibold">
                    Trading Capital
                  </p>
                  <p className="text-sm text-gray-400">
                    Capital available to the AI engine
                  </p>
                </div>
              </div>
              <div className="mt-5 rounded-2xl bg-[#0B1220] border border-slate-800 p-4">
                <p className="text-xs text-gray-500">
                  Current allocation
                </p>
                <p className="text-2xl font-bold mt-1">
                  0.0000 TON
                </p>
                <p className="text-sm text-gray-500 mt-1">
                  ≈ $0.00 USD
                </p>
              </div>
            </div>
            <div className="p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-semibold">
                    Maximum Trade Allocation
                  </p>
                  <p className="text-sm text-gray-400 mt-1">
                    Maximum capital per trade
                  </p>
                </div>
                <span className="text-cyan-400 font-bold">
                  {settings.maximumTradeAllocation}%
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={settings.maximumTradeAllocation}
                onChange={(event) =>
                  updateSetting(
                    "maximumTradeAllocation",
                    Number(event.target.value)
                  )
                }
                className="w-full mt-4 accent-cyan-400"
              />
            </div>
          </div>
        </section>
        {/* Protection */}
        <section className="mt-7">
          <h2 className="text-xs font-semibold tracking-widest text-gray-500 uppercase mb-4">
            Protection
          </h2>
          <div className="rounded-3xl bg-[#101A2C] border border-slate-800 p-5">
            <div className="flex items-start gap-4">
              <div className="w-11 h-11 rounded-2xl bg-green-500/20 flex items-center justify-center shrink-0">
                <ShieldCheck
                  size={22}
                  className="text-green-400"
                />
              </div>
              <div>
                <p className="font-semibold">
                  Risk Protection
                </p>
                <p className="text-sm text-gray-400 mt-2 leading-6">
                  The AI engine should only operate within
                  the configured risk limits and trading
                  parameters.
                </p>
              </div>
            </div>
            <div className="mt-5 space-y-3">
              <label className="flex items-center justify-between bg-[#0B1220] rounded-2xl p-4 cursor-pointer">
                <span className="text-sm text-gray-300">
                  Stop Loss Protection
                </span>
                <input
                  type="checkbox"
                  checked={settings.stopLossProtection}
                  onChange={(event) =>
                    updateSetting(
                      "stopLossProtection",
                      event.target.checked
                    )
                  }
                  className="w-5 h-5 accent-cyan-400"
                />
              </label>
              <label className="flex items-center justify-between bg-[#0B1220] rounded-2xl p-4 cursor-pointer">
                <span className="text-sm text-gray-300">
                  Daily Loss Protection
                </span>
                <input
                  type="checkbox"
                  checked={settings.dailyLossProtection}
                  onChange={(event) =>
                    updateSetting(
                      "dailyLossProtection",
                      event.target.checked
                    )
                  }
                  className="w-5 h-5 accent-cyan-400"
                />
              </label>
              <label className="flex items-center justify-between bg-[#0B1220] rounded-2xl p-4 cursor-pointer">
                <span className="text-sm text-gray-300">
                  Emergency Stop
                </span>
                <input
                  type="checkbox"
                  checked={settings.emergencyStop}
                  onChange={(event) =>
                    updateSetting(
                      "emergencyStop",
                      event.target.checked
                    )
                  }
                  className="w-5 h-5 accent-cyan-400"
                />
              </label>
            </div>
          </div>
        </section>
        {/* Performance */}
        <section className="mt-7">
          <h2 className="text-xs font-semibold tracking-widest text-gray-500 uppercase mb-4">
            Performance
          </h2>
          <div className="rounded-3xl bg-[#101A2C] border border-slate-800 p-5">
            <div className="flex items-center gap-4">
              <div className="w-11 h-11 rounded-2xl bg-cyan-500/20 flex items-center justify-center">
                <Activity
                  size={22}
                  className="text-cyan-400"
                />
              </div>
              <div>
                <p className="font-semibold">
                  AI Monitoring
                </p>
                <p className="text-sm text-gray-400">
                  Market analysis and performance tracking
                </p>
              </div>
            </div>
            <div className="mt-5 grid grid-cols-2 gap-3">
              <div className="rounded-2xl bg-[#0B1220] p-4">
                <p className="text-xs text-gray-500">
                  Confidence
                </p>
                <p className="text-xl font-bold mt-1">
                  {settings.minimumConfidence}%
                </p>
              </div>
              <div className="rounded-2xl bg-[#0B1220] p-4">
                <p className="text-xs text-gray-500">
                  Allocation
                </p>
                <p className="text-xl font-bold mt-1">
                  {settings.maximumTradeAllocation}%
                </p>
              </div>
            </div>
          </div>
        </section>
        {/* Save */}
        <button
          onClick={saveSettings}
          disabled={saving || loading}
          className="w-full mt-8 rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-600 py-4 flex items-center justify-center gap-3 font-bold hover:opacity-90 transition disabled:opacity-50"
        >
          <Save size={20} />
          {saving
            ? "Saving..."
            : "Save Settings"}
        </button>
        {/* Return */}
        <button
          onClick={() => router.push("/ai-trade")}
          className="w-full mt-3 rounded-2xl bg-[#101A2C] border border-slate-800 py-4 font-semibold hover:bg-[#16233D] transition"
        >
          Return to AI Trade
        </button>
        {/* Security Notice */}
        <div className="mt-5 rounded-2xl border border-cyan-500/20 bg-cyan-500/5 p-4">
          <div className="flex items-start gap-3">
            <ShieldCheck
              size={20}
              className="text-cyan-400 mt-0.5 shrink-0"
            />
            <p className="text-xs text-gray-400 leading-5">
              AI Trade settings control the behavior of the
              trading engine. Actual blockchain transactions
              should only occur through the authorized wallet
              and transaction flow.
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}