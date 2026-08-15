import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/auth";
import { prisma } from "@/lib/prisma";

const COINS = ["TON", "BTC", "ETH", "USDT", "BNB"] as const;

type Coin = (typeof COINS)[number];

const COINGECKO_IDS: Record<Coin, string> = {
  TON: "the-open-network",
  BTC: "bitcoin",
  ETH: "ethereum",
  USDT: "tether",
  BNB: "binancecoin",
};

function isCoin(value: unknown): value is Coin {
  return typeof value === "string" && COINS.includes(value as Coin);
}

async function requireUser() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return {
      error: NextResponse.json(
        {
          success: false,
          message: "Not authenticated.",
        },
        { status: 401 },
      ),
    };
  }

  const user = await prisma.user.findUnique({
    where: {
      id: session.user.id,
    },
    select: {
      id: true,
    },
  });

  if (!user) {
    return {
      error: NextResponse.json(
        {
          success: false,
          message: "User not found.",
        },
        { status: 404 },
      ),
    };
  }

  return {
    userId: user.id,
  };
}

async function getLiveRate(fromCoin: Coin, toCoin: Coin) {
  const fromId = COINGECKO_IDS[fromCoin];
  const toId = COINGECKO_IDS[toCoin];

  const url =
    `https://api.coingecko.com/api/v3/simple/price` +
    `?ids=${encodeURIComponent(`${fromId},${toId}`)}` +
    `&vs_currencies=usd`;

  const response = await fetch(url, {
    method: "GET",
    headers: {
      Accept: "application/json",
    },
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error("Unable to retrieve live cryptocurrency prices.");
  }

  const prices = await response.json();

  const fromUsd = prices?.[fromId]?.usd;
  const toUsd = prices?.[toId]?.usd;

  if (
    typeof fromUsd !== "number" ||
    typeof toUsd !== "number" ||
    fromUsd <= 0 ||
    toUsd <= 0
  ) {
    throw new Error("Live price data is unavailable.");
  }

  return {
    fromUsd,
    toUsd,
    rate: fromUsd / toUsd,
  };
}

export async function GET() {
  try {
    const auth = await requireUser();

    if (auth.error) {
      return auth.error;
    }

    const requests = await prisma.swapRequest.findMany({
      where: {
        userId: auth.userId,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json({
      success: true,
      requests,
    });
  } catch (error) {
    console.error("SWAP GET ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Unable to retrieve Swap requests.",
      },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const auth = await requireUser();

    if (auth.error) {
      return auth.error;
    }

    const body = await request.json();

    const fromCoin = body?.fromCoin;
    const toCoin = body?.toCoin;

    const fromAmount = Number(body?.fromAmount);

    if (!isCoin(fromCoin)) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid source coin.",
        },
        { status: 400 },
      );
    }

    if (!isCoin(toCoin)) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid destination coin.",
        },
        { status: 400 },
      );
    }

    if (fromCoin === toCoin) {
      return NextResponse.json(
        {
          success: false,
          message: "Source and destination coins must be different.",
        },
        { status: 400 },
      );
    }

    if (!Number.isFinite(fromAmount) || fromAmount <= 0) {
      return NextResponse.json(
        {
          success: false,
          message: "From amount must be greater than zero.",
        },
        { status: 400 },
      );
    }

    /*
     * Get the user's balance before creating
     * the Swap request.
     */

    const balance = await prisma.balance.findUnique({
      where: {
        userId_coin: {
          userId: auth.userId,
          coin: fromCoin,
        },
      },
      select: {
        balance: true,
      },
    });

    const currentBalance = balance?.balance ?? 0;

    if (currentBalance < fromAmount) {
      return NextResponse.json(
        {
          success: false,
          message: `Insufficient ${fromCoin} balance.`,
          balance: currentBalance,
          required: fromAmount,
          coin: fromCoin,
        },
        { status: 400 },
      );
    }

    /*
     * Never trust rate, toAmount or fee
     * coming from the client.
     */

    let livePrice;

    try {
      livePrice = await getLiveRate(fromCoin, toCoin);
    } catch (error) {
      console.error("SWAP LIVE PRICE ERROR:", error);

      return NextResponse.json(
        {
          success: false,
          message: "Unable to retrieve the live Swap price.",
        },
        { status: 502 },
      );
    }

    const rate = livePrice.rate;

    const toAmount = fromAmount * rate;

    /*
     * Fee remains zero for now.
     * The real fee engine will be added
     * before final execution.
     */

    const fee = 0;

    if (!Number.isFinite(toAmount) || toAmount <= 0) {
      return NextResponse.json(
        {
          success: false,
          message: "Unable to calculate Swap amount.",
        },
        { status: 400 },
      );
    }

    const result = await prisma.$transaction(async (tx) => {
      const swap = await tx.swapRequest.create({
        data: {
          userId: auth.userId,
          fromCoin,
          toCoin,
          fromAmount,
          toAmount,
          rate,
          fee,
          status: "PENDING",
        },
      });

      const transaction = await tx.transaction.create({
        data: {
          userId: auth.userId,
          coin: fromCoin,
          type: "SWAP",
          amount: fromAmount,
          fee,
          status: "PENDING",
        },
      });

      return {
        swap,
        transaction,
      };
    });

    return NextResponse.json(
      {
        success: true,
        message: "Swap request created successfully.",
        request: result.swap,
        transaction: result.transaction,
        price: {
          fromUsd: livePrice.fromUsd,
          toUsd: livePrice.toUsd,
          rate,
          source: "CoinGecko",
          timestamp: new Date().toISOString(),
        },
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("SWAP POST ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Unable to create Swap request.",
      },
      { status: 500 },
    );
  }
}
