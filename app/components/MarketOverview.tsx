"use client";

const coins = [
  {
    symbol: "TON",
    price: "$0.00",
    change: "+0.00%",
    color: "text-cyan-400",
  },
  {
    symbol: "BTC",
    price: "$0.00",
    change: "+0.00%",
    color: "text-orange-400",
  },
  {
    symbol: "ETH",
    price: "$0.00",
    change: "+0.00%",
    color: "text-indigo-400",
  },
  {
    symbol: "BNB",
    price: "$0.00",
    change: "+0.00%",
    color: "text-yellow-400",
  },
];

export default function MarketOverview() {
  return (
    <div className="rounded-3xl bg-slate-900 border border-slate-800 p-6 shadow-xl">

      <div className="flex items-center justify-between">

        <h2 className="text-2xl font-bold text-white">
          Crypto Market
        </h2>

        <span className="text-green-400 text-sm">
          Live
        </span>

      </div>

      <div className="space-y-4 mt-6">

        {coins.map((coin) => (

          <div
            key={coin.symbol}
            className="flex items-center justify-between rounded-2xl bg-slate-800 p-4"
          >

            <div>

              <h3 className={`font-bold text-lg ${coin.color}`}>
                {coin.symbol}
              </h3>

              <p className="text-slate-400 text-sm">
                {coin.price}
              </p>

            </div>

            <div className="text-green-400 font-bold">
              {coin.change}
            </div>

          </div>

        ))}

      </div>

    </div>
  );
}