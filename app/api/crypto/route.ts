import { NextRequest, NextResponse } from "next/server";

/*
|--------------------------------------------------------------------------
| CRYPTO MARKET API
|--------------------------------------------------------------------------
|
| IMPORTANT:
|
| AI TONKEEPER utilise CoinGecko comme source de données de marché.
|
| Aucun service Bybit n'est utilisé ici.
| Aucun ordre n'est envoyé.
| Cette route sert uniquement à récupérer les prix réels du marché.
|
|--------------------------------------------------------------------------
*/

const COIN_MAP: Record<string, string> = {
  BTC: "bitcoin",
  ETH: "ethereum",
  TON: "the-open-network",
  GRAM: "the-open-network",
  SOL: "solana",
  BNB: "binancecoin",
  XRP: "ripple",
};

type CoinGeckoResponse = {
  id?: string;
  name?: string;
  symbol?: string;
  market_data?: {
    current_price?: {
      usd?: number;
    };
    price_change_percentage_24h?: number | null;
    market_cap?: {
      usd?: number;
    };
    total_volume?: {
      usd?: number;
    };
    high_24h?: {
      usd?: number;
    };
    low_24h?: {
      usd?: number;
    };
  };
};

function errorResponse(
  message: string,
  status: number
) {
  return NextResponse.json(
    {
      success: false,
      message,
    },
    { status }
  );
}

function getTrend(
  change24h: number
): string {
  if (change24h >= 5) {
    return "Bullish";
  }

  if (change24h >= 0) {
    return "Bullish";
  }

  if (change24h <= -5) {
    return "Bearish";
  }

  return "Bearish";
}

function getRecommendation(
  change24h: number
): string {
  if (change24h >= 5) {
    return "STRONG BUY";
  }

  if (change24h >= 0) {
    return "BUY";
  }

  if (change24h <= -5) {
    return "STRONG SELL";
  }

  return "SELL";
}

export async function GET(
  request: NextRequest
) {
  try {
    /*
    |--------------------------------------------------------------------------
    | GET COIN
    |--------------------------------------------------------------------------
    */

    const coin =
      request.nextUrl.searchParams
        .get("coin")
        ?.trim()
        .toUpperCase();

    if (!coin) {
      return errorResponse(
        "Crypto symbol is required.",
        400
      );
    }

    const coinGeckoId =
      COIN_MAP[coin];

    if (!coinGeckoId) {
      return errorResponse(
        `Crypto ${coin} is not supported.`,
        400
      );
    }

    /*
    |--------------------------------------------------------------------------
    | COINGECKO REQUEST
    |--------------------------------------------------------------------------
    |
    | Source indépendante de Bybit.
    |
    */

    const url =
      "https://api.coingecko.com/api/v3/coins/" +
      `${encodeURIComponent(
        coinGeckoId
      )}?localization=false` +
      "&tickers=false" +
      "&market_data=true" +
      "&community_data=false" +
      "&developer_data=false";

    const response =
      await fetch(url, {
        method: "GET",

        /*
        | Court cache serveur.
        |
        | Cela évite de multiplier inutilement
        | les appels vers CoinGecko tout en
        | gardant des données suffisamment
        | fraîches pour notre tableau.
        */
        next: {
          revalidate: 15,
        },

        headers: {
          Accept:
            "application/json",
        },
      });

    /*
    |--------------------------------------------------------------------------
    | COINGECKO ERROR
    |--------------------------------------------------------------------------
    */

    if (!response.ok) {
      console.error(
        `CRYPTO API: CoinGecko returned HTTP ${response.status} for ${coin}.`
      );

      return errorResponse(
        "Unable to retrieve current crypto market data.",
        response.status === 429
          ? 429
          : 503
      );
    }

    /*
    |--------------------------------------------------------------------------
    | PARSE RESPONSE
    |--------------------------------------------------------------------------
    */

    let data: CoinGeckoResponse;

    try {
      data =
        (await response.json()) as CoinGeckoResponse;
    } catch (error) {
      console.error(
        "CRYPTO API: invalid CoinGecko JSON response.",
        error
      );

      return errorResponse(
        "Invalid market data response.",
        502
      );
    }

    /*
    |--------------------------------------------------------------------------
    | MARKET DATA
    |--------------------------------------------------------------------------
    */

    const marketData =
      data.market_data;

    if (!marketData) {
      return errorResponse(
        "Market data is unavailable.",
        503
      );
    }

    const price =
      Number(
        marketData.current_price?.usd ??
          0
      );

    const change24h =
      Number(
        marketData
          .price_change_percentage_24h ??
          0
      );

    const marketCap =
      Number(
        marketData.market_cap?.usd ??
          0
      );

    const volume24h =
      Number(
        marketData.total_volume?.usd ??
          0
      );

    const high24h =
      Number(
        marketData.high_24h?.usd ??
          0
      );

    const low24h =
      Number(
        marketData.low_24h?.usd ??
          0
      );

    /*
    |--------------------------------------------------------------------------
    | PRICE VALIDATION
    |--------------------------------------------------------------------------
    */

    if (
      !Number.isFinite(price) ||
      price <= 0
    ) {
      console.error(
        `CRYPTO API: invalid price returned for ${coin}.`
      );

      return errorResponse(
        "Invalid crypto price received.",
        503
      );
    }

    /*
    |--------------------------------------------------------------------------
    | CHANGE VALIDATION
    |--------------------------------------------------------------------------
    */

    const safeChange24h =
      Number.isFinite(change24h)
        ? change24h
        : 0;

    const safeMarketCap =
      Number.isFinite(marketCap) &&
      marketCap >= 0
        ? marketCap
        : 0;

    const safeVolume24h =
      Number.isFinite(volume24h) &&
      volume24h >= 0
        ? volume24h
        : 0;

    const safeHigh24h =
      Number.isFinite(high24h) &&
      high24h >= 0
        ? high24h
        : 0;

    const safeLow24h =
      Number.isFinite(low24h) &&
      low24h >= 0
        ? low24h
        : 0;

    /*
    |--------------------------------------------------------------------------
    | MARKET INTERPRETATION
    |--------------------------------------------------------------------------
    */

    const trend =
      getTrend(
        safeChange24h
      );

    const recommendation =
      getRecommendation(
        safeChange24h
      );

    /*
    |--------------------------------------------------------------------------
    | RESPONSE
    |--------------------------------------------------------------------------
    |
    | Cette structure est compatible avec :
    |
    | - Dashboard
    | - AI Trade
    | - Graphique
    | - AI Engine
    | - Market tables
    |
    |--------------------------------------------------------------------------
    */

    return NextResponse.json(
      {
        success: true,

        source: "CoinGecko",

        coin,

        name:
          data.name ??
          coin,

        symbol:
          data.symbol
            ?.toUpperCase() ??
          coin,

        price,

        change24h:
          safeChange24h,

        marketCap:
          safeMarketCap,

        volume24h:
          safeVolume24h,

        high24h:
          safeHigh24h,

        low24h:
          safeLow24h,

        trend,

        recommendation,

        timestamp:
          new Date().toISOString(),
      },
      {
        status: 200,

        headers: {
          /*
          | Permet au navigateur/CDN de conserver
          | brièvement la réponse tout en demandant
          | régulièrement une nouvelle valeur.
          */
          "Cache-Control":
            "public, s-maxage=15, stale-while-revalidate=30",
        },
      }
    );
  } catch (error) {
    /*
    |--------------------------------------------------------------------------
    | SERVER ERROR
    |--------------------------------------------------------------------------
    */

    console.error(
      "CRYPTO API ERROR:",
      error
    );

    return errorResponse(
      "Unable to retrieve crypto market data.",
      500
    );
  }
}