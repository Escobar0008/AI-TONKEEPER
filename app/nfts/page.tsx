export default function NFTsPage() {

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-slate-900 p-6">

      <h1 className="text-4xl font-bold text-white">
        NFTs
      </h1>

      <p className="text-blue-200 mt-3">
        Manage your digital assets and NFT collection.
      </p>


      <div className="mt-8 rounded-2xl bg-slate-900 border border-slate-700 p-6">

        <h2 className="text-2xl font-bold text-white">
          Your NFTs
        </h2>

        <p className="text-slate-400 mt-4">
          No NFTs available yet.
        </p>

      </div>

    </main>
  );
}