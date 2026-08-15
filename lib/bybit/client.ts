import crypto from "crypto";

type BybitResponse<T = unknown> = {
  retCode: number;
  retMsg: string;
  result?: T;
  time?: number;
};

type WalletCoin = {
  coin: string;
  walletBalance: string;
  availableToWithdraw?: string;
  usdValue?: string;
  equity?: string;
  totalOrderIM?: string;
  totalPositionIM?: string;
};

type WalletBalanceResult = {
  totalEquity?: string;
  totalWalletBalance?: string;
  totalAvailableBalance?: string;
  coin?: WalletCoin[];
};

type TickerItem = {
  symbol: string;
  lastPrice: string;
  price24hPcnt?: string;
  highPrice24h?: string;
  lowPrice24h?: string;
  turnover24h?: string;
  volume24h?: string;
};

type TickerResult = {
  category: string;
  list: TickerItem[];
};

type OrderItem = {
  orderId: string;
  orderLinkId?: string;
  symbol: string;
  side: string;
  orderType: string;
  price: string;
  qty: string;
  avgPrice?: string;
  orderStatus: string;
  cumExecQty?: string;
  cumExecValue?: string;
  leavesQty?: string;
  createdTime?: string;
  updatedTime?: string;
};

type OrderResult = {
  category: string;
  nextPageCursor?: string;
  list: OrderItem[];
};

type PositionItem = {
  symbol: string;
  side: string;
  size: string;
  avgPrice: string;
  markPrice?: string;
  positionValue?: string;
  unrealisedPnl?: string;
  leverage?: string;
  positionStatus?: string;
  updatedTime?: string;
};

type PositionResult = {
  category: string;
  nextPageCursor?: string;
  list: PositionItem[];
};

const BASE_URL =
  process.env.BYBIT_BASE_URL ||
  "https://api.bybit.com";

const API_KEY = process.env.BYBIT_API_KEY;
const API_SECRET = process.env.BYBIT_API_SECRET;

const RECV_WINDOW = "5000";

/*
|--------------------------------------------------------------------------
| CREDENTIALS
|--------------------------------------------------------------------------
*/

function getCredentials() {
  if (!API_KEY || !API_SECRET) {
    throw new Error(
      "BYBIT_API_KEY or BYBIT_API_SECRET is missing."
    );
  }

  return {
    apiKey: API_KEY,
    apiSecret: API_SECRET,
  };
}

/*
|--------------------------------------------------------------------------
| SIGNATURE
|--------------------------------------------------------------------------
*/

function createSignature(
  timestamp: string,
  apiKey: string,
  recvWindow: string,
  payload: string,
  secret: string
) {
  return crypto
    .createHmac("sha256", secret)
    .update(
      timestamp +
        apiKey +
        recvWindow +
        payload
    )
    .digest("hex");
}

/*
|--------------------------------------------------------------------------
| PUBLIC GET
|--------------------------------------------------------------------------
*/

async function publicGet<T>(
  endpoint: string,
  params: Record<string, string> = {}
): Promise<BybitResponse<T>> {
  const searchParams =
    new URLSearchParams();

  for (const [key, value] of Object.entries(
    params
  )) {
    if (
      value !== undefined &&
      value !== null &&
      value !== ""
    ) {
      searchParams.set(key, value);
    }
  }

  const queryString =
    searchParams.toString();

  const url =
    queryString
      ? `${BASE_URL}${endpoint}?${queryString}`
      : `${BASE_URL}${endpoint}`;

  const response = await fetch(url, {
    method: "GET",
    cache: "no-store",
  });

  let data: BybitResponse<T>;

  try {
    data =
      (await response.json()) as BybitResponse<T>;
  } catch {
    throw new Error(
      `Invalid response from Bybit. HTTP ${response.status}`
    );
  }

  if (!response.ok) {
    throw new Error(
      data.retMsg ||
        `Bybit HTTP ${response.status}`
    );
  }

  return data;
}

/*
|--------------------------------------------------------------------------
| PRIVATE GET
|--------------------------------------------------------------------------
*/

async function privateGet<T>(
  endpoint: string,
  params: Record<string, string> = {}
): Promise<BybitResponse<T>> {
  const {
    apiKey,
    apiSecret,
  } = getCredentials();

  const searchParams =
    new URLSearchParams();

  for (const [key, value] of Object.entries(
    params
  )) {
    if (
      value !== undefined &&
      value !== null &&
      value !== ""
    ) {
      searchParams.set(key, value);
    }
  }

  const queryString =
    searchParams.toString();

  const timestamp =
    Date.now().toString();

  const signature =
    createSignature(
      timestamp,
      apiKey,
      RECV_WINDOW,
      queryString,
      apiSecret
    );

  const url =
    queryString
      ? `${BASE_URL}${endpoint}?${queryString}`
      : `${BASE_URL}${endpoint}`;

  const response = await fetch(url, {
    method: "GET",
    headers: {
      "X-BAPI-API-KEY": apiKey,
      "X-BAPI-TIMESTAMP": timestamp,
      "X-BAPI-RECV-WINDOW":
        RECV_WINDOW,
      "X-BAPI-SIGN": signature,
      "Content-Type":
        "application/json",
    },
    cache: "no-store",
  });

  let data: BybitResponse<T>;

  try {
    data =
      (await response.json()) as BybitResponse<T>;
  } catch {
    throw new Error(
      `Invalid response from Bybit. HTTP ${response.status}`
    );
  }

  if (!response.ok) {
    throw new Error(
      data.retMsg ||
        `Bybit HTTP ${response.status}`
    );
  }

  return data;
}

/*
|--------------------------------------------------------------------------
| TEST CONNECTION
|--------------------------------------------------------------------------
*/

export async function testBybitConnection() {
  try {
    getCredentials();

    const response =
      await privateGet<WalletBalanceResult>(
        "/v5/account/wallet-balance",
        {
          accountType: "UNIFIED",
        }
      );

    if (response.retCode !== 0) {
      return {
        success: false,
        message:
          response.retMsg ||
          "Bybit connection failed.",
      };
    }

    return {
      success: true,
      message:
        "Bybit connection successful.",
      testnet:
        BASE_URL.includes(
          "api-testnet.bybit.com"
        ),
    };
  } catch (error) {
    console.error(
      "BYBIT CONNECTION ERROR:",
      error
    );

    return {
      success: false,
      message:
        error instanceof Error
          ? error.message
          : "Unable to connect to Bybit.",
    };
  }
}

/*
|--------------------------------------------------------------------------
| ALL BALANCES
|--------------------------------------------------------------------------
*/

export async function getBybitBalances() {
  try {
    const response =
      await privateGet<WalletBalanceResult>(
        "/v5/account/wallet-balance",
        {
          accountType: "UNIFIED",
        }
      );

    if (response.retCode !== 0) {
      return {
        success: false,
        message:
          response.retMsg ||
          "Unable to retrieve Bybit balances.",
        balances: [],
      };
    }

    return {
      success: true,
      message:
        "Bybit balances retrieved.",
      totalEquity:
        response.result?.totalEquity ?? "0",
      totalWalletBalance:
        response.result?.totalWalletBalance ??
        "0",
      totalAvailableBalance:
        response.result
          ?.totalAvailableBalance ?? "0",
      balances:
        response.result?.coin ?? [],
    };
  } catch (error) {
    console.error(
      "BYBIT BALANCE ERROR:",
      error
    );

    return {
      success: false,
      message:
        error instanceof Error
          ? error.message
          : "Unable to retrieve Bybit balances.",
      balances: [],
    };
  }
}

/*
|--------------------------------------------------------------------------
| SINGLE COIN BALANCE
|--------------------------------------------------------------------------
*/

export async function getBybitCoinBalance(
  coin: string
) {
  try {
    const normalizedCoin =
      coin.trim().toUpperCase();

    if (!normalizedCoin) {
      return {
        success: false,
        message: "Coin is required.",
        balance: 0,
        availableBalance: 0,
      };
    }

    const response =
      await privateGet<WalletBalanceResult>(
        "/v5/account/wallet-balance",
        {
          accountType: "UNIFIED",
          coin: normalizedCoin,
        }
      );

    if (response.retCode !== 0) {
      return {
        success: false,
        message:
          response.retMsg ||
          "Unable to retrieve coin balance.",
        balance: 0,
        availableBalance: 0,
      };
    }

    const walletCoin =
      response.result?.coin?.find(
        (item) =>
          item.coin.toUpperCase() ===
          normalizedCoin
      );

    if (!walletCoin) {
      return {
        success: true,
        message:
          "Coin balance not found. Balance is zero.",
        coin: normalizedCoin,
        balance: 0,
        availableBalance: 0,
      };
    }

    const balance =
      Number(
        walletCoin.walletBalance ?? "0"
      );

    /*
     * For trading/accounting purposes we use
     * equity/wallet balance when Bybit does not
     * expose availableToWithdraw.
     */
    const availableBalance =
      Number(
        walletCoin.availableToWithdraw ??
          walletCoin.equity ??
          walletCoin.walletBalance ??
          "0"
      );

    return {
      success: true,
      message:
        "Coin balance retrieved.",
      coin: normalizedCoin,
      balance:
        Number.isFinite(balance)
          ? balance
          : 0,
      availableBalance:
        Number.isFinite(
          availableBalance
        )
          ? availableBalance
          : 0,
    };
  } catch (error) {
    console.error(
      "BYBIT COIN BALANCE ERROR:",
      error
    );

    return {
      success: false,
      message:
        error instanceof Error
          ? error.message
          : "Unable to retrieve coin balance.",
      balance: 0,
      availableBalance: 0,
    };
  }
}

/*
|--------------------------------------------------------------------------
| MARKET PRICE
|--------------------------------------------------------------------------
*/

export async function getBybitMarketPrice(
  symbol: string,
  category = "spot"
) {
  try {
    const normalizedSymbol =
      symbol.trim().toUpperCase();

    if (!normalizedSymbol) {
      return {
        success: false,
        message: "Symbol is required.",
        price: 0,
      };
    }

    if (
      normalizedSymbol ===
      "USDTUSDT"
    ) {
      return {
        success: false,
        message:
          "USDTUSDT is not a valid trading pair.",
        price: 0,
      };
    }

    const response =
      await publicGet<TickerResult>(
        "/v5/market/tickers",
        {
          category,
          symbol: normalizedSymbol,
        }
      );

    if (response.retCode !== 0) {
      return {
        success: false,
        message:
          response.retMsg ||
          "Unable to retrieve market price.",
        price: 0,
      };
    }

    const ticker =
      response.result?.list?.[0];

    if (!ticker) {
      return {
        success: false,
        message:
          "Market ticker not found.",
        price: 0,
      };
    }

    const price =
      Number(
        ticker.lastPrice
      );

    if (
      !Number.isFinite(price) ||
      price <= 0
    ) {
      return {
        success: false,
        message:
          "Invalid market price received.",
        price: 0,
      };
    }

    return {
      success: true,
      message:
        "Market price retrieved.",
      symbol: normalizedSymbol,
      price,
      change24h:
        Number(
          ticker.price24hPcnt ?? "0"
        ) * 100,
      high24h:
        Number(
          ticker.highPrice24h ?? "0"
        ),
      low24h:
        Number(
          ticker.lowPrice24h ?? "0"
        ),
      volume24h:
        Number(
          ticker.volume24h ?? "0"
        ),
      turnover24h:
        Number(
          ticker.turnover24h ?? "0"
        ),
    };
  } catch (error) {
    console.error(
      "BYBIT MARKET PRICE ERROR:",
      error
    );

    return {
      success: false,
      message:
        error instanceof Error
          ? error.message
          : "Unable to retrieve market price.",
      price: 0,
    };
  }
}

/*
|--------------------------------------------------------------------------
| OPEN ORDERS
|--------------------------------------------------------------------------
*/

export async function getBybitOpenOrders(
  category = "spot"
) {
  try {
    const response =
      await privateGet<OrderResult>(
        "/v5/order/realtime",
        {
          category,
        }
      );

    if (response.retCode !== 0) {
      return {
        success: false,
        message:
          response.retMsg ||
          "Unable to retrieve open orders.",
        orders: [],
      };
    }

    return {
      success: true,
      message:
        "Open orders retrieved.",
      orders:
        response.result?.list ?? [],
      nextPageCursor:
        response.result?.nextPageCursor ??
        null,
    };
  } catch (error) {
    console.error(
      "BYBIT OPEN ORDERS ERROR:",
      error
    );

    return {
      success: false,
      message:
        error instanceof Error
          ? error.message
          : "Unable to retrieve open orders.",
      orders: [],
    };
  }
}

/*
|--------------------------------------------------------------------------
| POSITIONS
|--------------------------------------------------------------------------
*/

export async function getBybitPositions(
  category = "linear"
) {
  try {
    const response =
      await privateGet<PositionResult>(
        "/v5/position/list",
        {
          category,
          settleCoin: "USDT",
        }
      );

    if (response.retCode !== 0) {
      return {
        success: false,
        message:
          response.retMsg ||
          "Unable to retrieve positions.",
        positions: [],
      };
    }

    return {
      success: true,
      message:
        "Positions retrieved.",
      positions:
        response.result?.list ?? [],
      nextPageCursor:
        response.result?.nextPageCursor ??
        null,
    };
  } catch (error) {
    console.error(
      "BYBIT POSITIONS ERROR:",
      error
    );

    return {
      success: false,
      message:
        error instanceof Error
          ? error.message
          : "Unable to retrieve positions.",
      positions: [],
    };
  }
}

/*
|--------------------------------------------------------------------------
| ORDER HISTORY
|--------------------------------------------------------------------------
*/

export async function getBybitOrderHistory(
  category = "spot",
  limit = "50"
) {
  try {
    const numericLimit =
      Number(limit);

    const safeLimit =
      Math.min(
        Math.max(
          Number.isFinite(
            numericLimit
          )
            ? numericLimit
            : 50,
          1
        ),
        50
      ).toString();

    const response =
      await privateGet<OrderResult>(
        "/v5/order/history",
        {
          category,
          limit: safeLimit,
        }
      );

    if (response.retCode !== 0) {
      return {
        success: false,
        message:
          response.retMsg ||
          "Unable to retrieve order history.",
        orders: [],
      };
    }

    return {
      success: true,
      message:
        "Order history retrieved.",
      orders:
        response.result?.list ?? [],
      nextPageCursor:
        response.result?.nextPageCursor ??
        null,
    };
  } catch (error) {
    console.error(
      "BYBIT ORDER HISTORY ERROR:",
      error
    );

    return {
      success: false,
      message:
        error instanceof Error
          ? error.message
          : "Unable to retrieve order history.",
      orders: [],
    };
  }
}
/*
|--------------------------------------------------------------------------
| DEPOSIT HISTORY / WALLET TRANSACTIONS
|--------------------------------------------------------------------------
|
| Used to detect incoming deposits on the Bybit main account.
|
| IMPORTANT:
| - Bybit remains the real custody wallet.
| - AI TONKEEPER Balance remains the user's internal balance.
| - A deposit must only be credited once.
|
|--------------------------------------------------------------------------
*/

type WalletTransactionItem = {
  id?: string;
  coin?: string;
  amount?: string;
  type?: string;
  status?: string;
  txID?: string;
  txHash?: string;
  address?: string;
  fromAddress?: string;
  toAddress?: string;
  timestamp?: string;
  transactionTime?: string;
};

type WalletTransactionResult = {
  rows?: WalletTransactionItem[];
  list?: WalletTransactionItem[];
  nextPageCursor?: string;
};

/*
|--------------------------------------------------------------------------
| BYBIT TRANSACTION LOG
|--------------------------------------------------------------------------
*/

export async function getBybitTransactionLog(
  coin?: string,
  limit = "50",
) {
  try {
    const params: Record<string, string> = {
      accountType: "UNIFIED",
      limit: Math.min(
        Math.max(Number(limit) || 50, 1),
        50,
      ).toString(),
    };

    if (coin?.trim()) {
      params.coin = coin.trim().toUpperCase();
    }

    const response =
      await privateGet<WalletTransactionResult>(
        "/v5/account/transaction-log",
        params,
      );

    if (response.retCode !== 0) {
      return {
        success: false,
        message:
          response.retMsg ||
          "Unable to retrieve Bybit transaction log.",
        transactions: [],
      };
    }

    const transactions =
      response.result?.rows ??
      response.result?.list ??
      [];

    return {
      success: true,
      message:
        "Bybit transaction log retrieved.",
      transactions,
      nextPageCursor:
        response.result?.nextPageCursor ??
        null,
    };
  } catch (error) {
    console.error(
      "BYBIT TRANSACTION LOG ERROR:",
      error,
    );

    return {
      success: false,
      message:
        error instanceof Error
          ? error.message
          : "Unable to retrieve Bybit transaction log.",
      transactions: [],
    };
  }
}

/*
|--------------------------------------------------------------------------
| BYBIT DEPOSIT HISTORY
|--------------------------------------------------------------------------
*/

type DepositHistoryItem = {
  coin: string;
  amount: string;
  status: string;
  txID?: string;
  txHash?: string;
  toAddress?: string;
  fromAddress?: string;
  timestamp?: string;
  transactionTime?: string;
};

type DepositHistoryResult = {
  rows?: DepositHistoryItem[];
  list?: DepositHistoryItem[];
  nextPageCursor?: string;
};

export async function getBybitDepositHistory(
  coin?: string,
  limit = "50",
) {
  try {
    const params: Record<string, string> = {
      accountType: "UNIFIED",
      limit: Math.min(
        Math.max(Number(limit) || 50, 1),
        50,
      ).toString(),
    };

    if (coin?.trim()) {
      params.coin = coin.trim().toUpperCase();
    }

    const response =
      await privateGet<DepositHistoryResult>(
        "/v5/asset/deposit/query-record",
        params,
      );

    if (response.retCode !== 0) {
      return {
        success: false,
        message:
          response.retMsg ||
          "Unable to retrieve Bybit deposit history.",
        deposits: [],
      };
    }

    const deposits =
      response.result?.rows ??
      response.result?.list ??
      [];

    return {
      success: true,
      message:
        "Bybit deposit history retrieved.",
      deposits,
      nextPageCursor:
        response.result?.nextPageCursor ??
        null,
    };
  } catch (error) {
    console.error(
      "BYBIT DEPOSIT HISTORY ERROR:",
      error,
    );

    return {
      success: false,
      message:
        error instanceof Error
          ? error.message
          : "Unable to retrieve Bybit deposit history.",
      deposits: [],
    };
  }
}
/*
|--------------------------------------------------------------------------
| GET BYBIT DEPOSIT BY TX HASH
|--------------------------------------------------------------------------
|
| Vérifie un dépôt réel enregistré sur le compte Bybit principal.
|
| IMPORTANT :
| - Les cryptos restent sur le compte Bybit.
| - TONKEEPER crédite uniquement le Balance interne du client.
| - Le TXID est vérifié directement auprès de Bybit.
|
|--------------------------------------------------------------------------
*/

type BybitDepositRecord = {
  id?: string;
  coin: string;
  chain?: string;
  amount: string;
  txID: string;
  status: number;
  toAddress?: string;
  tag?: string;
  depositFee?: string;
  successAt?: string;
  confirmations?: string;
  txIndex?: string;
  blockHash?: string;
  fromAddress?: string;
  depositType?: string;
};

type BybitDepositQueryResult = {
  rows: BybitDepositRecord[];
  nextPageCursor?: string;
};

export async function getBybitDepositByTxHash(
  txHash: string,
  coin?: string,
) {
  try {
    const normalizedTxHash =
      txHash.trim();

    const normalizedCoin =
      typeof coin === "string"
        ? coin.trim().toUpperCase()
        : "";

    if (!normalizedTxHash) {
      return {
        success: false,
        message:
          "Transaction hash is required.",
        deposit: null,
      };
    }

    const params: Record<string, string> = {
      txID: normalizedTxHash,
      limit: "50",
    };

    if (normalizedCoin) {
      params.coin = normalizedCoin;
    }

    const response =
      await privateGet<BybitDepositQueryResult>(
        "/v5/asset/deposit/query-record",
        params,
      );

    if (response.retCode !== 0) {
      return {
        success: false,
        message:
          response.retMsg ||
          "Unable to retrieve Bybit deposit.",
        deposit: null,
      };
    }

    const deposits =
      response.result?.rows ?? [];

    const deposit =
      deposits.find(
        (item) =>
          item.txID.trim().toLowerCase() ===
          normalizedTxHash.toLowerCase(),
      ) ?? null;

    if (!deposit) {
      return {
        success: true,
        message:
          "No matching Bybit deposit found.",
        deposit: null,
      };
    }

    return {
      success: true,
      message:
        "Bybit deposit found.",
      deposit,
    };
  } catch (error) {
    console.error(
      "BYBIT DEPOSIT BY TX HASH ERROR:",
      error,
    );

    return {
      success: false,
      message:
        error instanceof Error
          ? error.message
          : "Unable to verify Bybit deposit.",
      deposit: null,
    };
  }
}