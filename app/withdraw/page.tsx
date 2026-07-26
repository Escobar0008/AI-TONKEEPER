export default function WithdrawPage() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-slate-900 p-6 md:p-8">

      <h1 className="text-3xl md:text-4xl font-bold text-white">
        Withdraw TON
      </h1>

      <p className="text-blue-200 mt-3">
        Send your TON securely.
      </p>


      <div className="mt-8 rounded-2xl bg-slate-900 border border-slate-700 p-6">


        <h2 className="text-2xl font-bold text-white">
          Withdrawal Request
        </h2>


        <input
          placeholder="TON Address"
          className="w-full mt-5 bg-slate-800 text-white p-4 rounded-xl"
        />


        <input
          placeholder="Amount TON"
          className="w-full mt-4 bg-slate-800 text-white p-4 rounded-xl"
        />


        <button className="mt-6 bg-red-500 hover:bg-red-600 text-white font-bold px-6 py-3 rounded-xl">
          Withdraw
        </button>


      </div>


    </main>
  );
}