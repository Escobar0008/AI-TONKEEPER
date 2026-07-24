export default function Sidebar() {
  return (
    <aside className="w-64 h-screen bg-white/5 border-r border-white/10 p-6">
      <h1 className="text-2xl font-bold text-white">
        AI TONKEEPER
      </h1>

      <nav className="mt-10 space-y-4">
        <button className="block text-blue-200 hover:text-white">
          Dashboard
        </button>

        <button className="block text-blue-200 hover:text-white">
          Wallet
        </button>

        <button className="block text-blue-200 hover:text-white">
          NFTs
        </button>

        <button className="block text-blue-200 hover:text-white">
          Transactions
        </button>

        <button className="block text-blue-200 hover:text-white">
          AI Assistant
        </button>

        <button className="block text-blue-200 hover:text-white">
          Settings
        </button>
      </nav>
    </aside>
  );
}