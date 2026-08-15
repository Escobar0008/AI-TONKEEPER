import crypto from "crypto";

type BybitSide = "Buy" | "Sell";

type BybitResponse<T = unknown> = {
  retCode: number;
  retMsg: string;
  result?: T;
  retExtInfo?: unknown;
  time?: number;
};

type PlaceOrderResult = {
  success: boolean;
  orderId?: string;
  orderLinkId?: string;
  message: string;
  raw?: unknown;
};

type BybitOrderResult = {
  orderId?: string;
  orderLinkId?: string;
};

const BYBIT_BASE_URL =
  process.env.BYBIT_BASE_URL ||
  "https://api-testnet.bybit.com";

const BYBIT_API_KEY =
  process.env.BYBIT_API_KEY;

const BYBIT_API_SECRET =
  process.env.BYBIT_API_SECRET;

const BYBIT_RECV_WINDOW = "5000";

function getCredentials() {
  if (!BYBIT_API_KEY) {
    throw new Error(
      "BYBIT_API_KEY is not configured."
    );
  }

  if (!BYBIT_API_SECRET) {
    throw new Error(
      "BYBIT_API_SECRET is not configured."
    );
  }

  return {
    apiKey: BYBIT_API_KEY,
    apiSecret: BYBIT_API_SECRET,
  };
}

function createSignature(
  timestamp: string,
  apiKey: string,
  recvWindow: string,
  body: string,
  secret: string
) {
  const payload =
    timestamp +
    apiKey +
    recvWindow +
    body;

  return crypto
    .createHmac("sha256", secret)
    .update(payload)
    .digest("hex");
}

/*
|--------------------------------------------------------------------------
| PRIVATE POST
|--------------------------------------------------------------------------
*/

async function privatePost<T>(
  endpoint: string,
  body: Record<string, unknown>
): Promise<BybitResponse<T>> {
  const {
    apiKey,
    apiSecret,
  } = getCredentials();

  const timestamp =
    Date.now().toString();

  const requestBody =
    JSON.stringify(body);

  const signature =
    createSignature(
      timestamp,
      apiKey,
      BYBIT_RECV_WINDOW,
      requestBody,
      apiSecret
    );

  const response = await fetch(
    `${BYBIT_BASE_URL}${endpoint}`,
    {
      method: "POST",

      headers: {
        "Content-Type":
          "application/json",

        "X-BAPI-API-KEY":
          apiKey,

        "X-BAPI-TIMESTAMP":
          timestamp,

        "X-BAPI-RECV-WINDOW":
          BYBIT_RECV_WINDOW,

        "X-BAPI-SIGN":
          signature,
      },

      body: requestBody,

      cache: "no-store",
    }
  );

  const data =
    (await response.json()) as BybitResponse<T>;

  if (!response.ok) {
    throw new Error(
      data?.retMsg ||
        `Bybit HTTP ${response.status}`
    );
  }

  return data;
}

/*
|--------------------------------------------------------------------------
| TESTNET CONNECTION
|--------------------------------------------------------------------------
*/

export async function testBybitConnection() {
  try {
    getCredentials();

    return {
      success: true,
      message:
        "Bybit Testnet configuration is ready.",
      testnet:
        BYBIT_BASE_URL.includes(
          "api-testnet.bybit.com"
        ),
    };
  } catch (error) {
    return {
      success: false,
      message:
        error instanceof Error
          ? error.message
          : "Bybit configuration error.",
    };
  }
}

/*
|--------------------------------------------------------------------------
| PLACE SPOT MARKET ORDER
|--------------------------------------------------------------------------
*/

export async function placeSpotMarketOrder(
  symbol: string,
  side: BybitSide,
  qty: number
): Promise<PlaceOrderResult> {
  try {
    if (!symbol) {
      return {
        success: false,
        message:
          "Trading symbol is required.",
      };
    }

    if (
      !Number.isFinite(qty) ||
      qty <= 0
    ) {
      return {
        success: false,
        message:
          "Invalid order quantity.",
      };
    }

    const orderLinkId =
      `aitk_${Date.now()}_${Math.random()
        .toString(36)
        .slice(2, 8)}`;

    const response =
      await privatePost<BybitOrderResult>(
        "/v5/order/create",
        {
          category: "spot",

          symbol:
            symbol.toUpperCase(),

          side,

          orderType: "Market",

          qty: String(qty),

          orderLinkId,

          orderFilter: "Order",
        }
      );

    if (
      response.retCode !== 0
    ) {
      return {
        success: false,
        message:
          response.retMsg ||
          "Bybit rejected the order.",
        raw: response,
      };
    }

    return {
      success: true,

      orderId:
        response.result?.orderId,

      orderLinkId:
        response.result?.orderLinkId,

      message:
        "Bybit Testnet order accepted.",

      raw: response,
    };
  } catch (error) {
    console.error(
      "BYBIT PLACE ORDER ERROR:",
      error
    );

    return {
      success: false,

      message:
        error instanceof Error
          ? error.message
          : "Unable to place Bybit order.",
    };
  }
}