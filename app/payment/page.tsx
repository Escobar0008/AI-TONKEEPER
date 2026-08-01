"use client";

export default function PaymentPage() {
  const handleRamp = () => {
    window.location.href =
      "https://ramp.network/buy/";
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-8">

      <div className="w-full max-w-xl bg-slate-900 border border-slate-700 rounded-3xl p-8">

        <h1 className="text-4xl font-bold text-cyan-400">
          Secure Payment
        </h1>

        <p className="mt-4 text-slate-300">
          You will now be redirected to our trusted payment partner to complete
          your TON purchase securely.
        </p>

        <button
          onClick={handleRamp}
          className="w-full mt-8 bg-cyan-500 hover:bg-cyan-600 text-black font-bold py-4 rounded-xl"
        >
          Continue to Ramp Network
        </button>

      </div>

    </div>
  );
}