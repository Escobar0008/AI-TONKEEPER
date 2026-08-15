export default function NewPasswordPage() {
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
            Create New Password
          </h1>

          <p className="text-gray-400 mt-2">
            Choose a new password for your account.
          </p>

        </div>

        <div className="bg-[#101A2C] border border-slate-800 rounded-3xl p-6">

          <div className="space-y-5">

            <div>

              <label className="text-sm text-gray-400">
                New Password
              </label>

              <input
                type="password"
                placeholder="Enter new password"
                className="w-full mt-2 bg-[#0B1220] border border-slate-700 rounded-xl px-4 py-3 outline-none focus:border-cyan-500"
              />

            </div>

            <div>

              <label className="text-sm text-gray-400">
                Confirm Password
              </label>

              <input
                type="password"
                placeholder="Confirm new password"
                className="w-full mt-2 bg-[#0B1220] border border-slate-700 rounded-xl px-4 py-3 outline-none focus:border-cyan-500"
              />

            </div>

            <button className="w-full bg-cyan-500 hover:bg-cyan-600 rounded-xl py-3 font-bold text-black transition">
              Update Password
            </button>

          </div>

        </div>

      </div>

    </main>
  );
}