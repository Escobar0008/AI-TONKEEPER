export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const coin = searchParams.get("coin") || "bitcoin";

  const res = await fetch(
    `https://api.coingecko.com/api/v3/coins/${coin}`
  );

  const data = await res.json();

  return Response.json({
    name: data.name,
    symbol: data.symbol.toUpperCase(),
    price: data.market_data.current_price.usd,
    change24h: data.market_data.price_change_percentage_24h,
    marketCap: data.market_data.market_cap.usd,
  });
}