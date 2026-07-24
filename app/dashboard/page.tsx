import Sidebar from "../components/Sidebar";

export default function Dashboard() {
  return (
    <div className="flex min-h-screen bg-gradient-to-br from-blue-950 via-blue-900 to-black">
      <Sidebar />

      <main className="flex-1 p-10">
        <h1 className="text-5xl font-bold text-white">
          Welcome 👋
        </h1>

        <p className="mt-3 text-blue-200">
          Your TON portfolio overview
        </p>
      </main>
    </div>
  );
}