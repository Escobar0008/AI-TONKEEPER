"use client";
import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
type Candle = {
  time: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
  turnover: number;
};
type MarketApiResponse = {
  success?: boolean;
  market?: boolean;
  source?: string;
  cached?: boolean;
  symbol?: string;
  interval?: number;
  candles?: Candle[];
  message?: string;
};
type TradingChartProps = {
  symbol?: string;
};
const PERIODS = [
  { label: "1m", minutes: 1 },
  { label: "5m", minutes: 5 },
  { label: "15m", minutes: 15 },
  { label: "30m", minutes: 30 },
  { label: "1H", minutes: 60 },
  { label: "4H", minutes: 240 },
  { label: "1D", minutes: 1440 },
] as const;
/*
|--------------------------------------------------------------------------
| Market refresh
|--------------------------------------------------------------------------
|
| CoinGecko public API must not be polled every few seconds.
| The API route also has its own cache.
|--------------------------------------------------------------------------
*/
const MARKET_REFRESH_MS = 60_000;
function formatPrice(
  value: number
): string {
  if (!Number.isFinite(value)) {
    return "0";
  }
  if (value >= 1000) {
    return value.toLocaleString(
      "en-US",
      {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }
    );
  }
  if (value >= 1) {
    return value.toLocaleString(
      "en-US",
      {
        minimumFractionDigits: 2,
        maximumFractionDigits: 4,
      }
    );
  }
  return value.toLocaleString(
    "en-US",
    {
      minimumFractionDigits: 2,
      maximumFractionDigits: 8,
    }
  );
}
function formatTime(
  timestamp: number,
  intervalMinutes: number
): string {
  const date =
    new Date(timestamp);
  if (
    intervalMinutes >= 1440
  ) {
    return date.toLocaleDateString(
      "en-US",
      {
        month: "short",
        day: "numeric",
      }
    );
  }
  return date.toLocaleTimeString(
    "en-US",
    {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    }
  );
}
export default function TradingChart({
  symbol = "BTCUSDT",
}: TradingChartProps) {
  const [period, setPeriod] =
    useState("15m");
  const [candles, setCandles] =
    useState<Candle[]>([]);
  const [loading, setLoading] =
    useState(true);
  const [error, setError] =
    useState("");
  const [liveConnected, setLiveConnected] =
    useState(false);
  const [refreshing, setRefreshing] =
    useState(false);
  const selectedPeriod =
    useMemo(() => {
      return (
        PERIODS.find(
          (item) =>
            item.label ===
            period
        ) ?? PERIODS[2]
      );
    }, [period]);
  const loadCandles =
    useCallback(
      async (
        showLoading = true
      ) => {
        try {
          if (showLoading) {
            setLoading(true);
          } else {
            setRefreshing(true);
          }
          const url =
            `/api/ai-trade?market=true` +
            `&symbol=${encodeURIComponent(
              symbol
            )}` +
            `&interval=${selectedPeriod.minutes}` +
            `&limit=200`;
          const response =
            await fetch(url, {
              method: "GET",
              cache: "no-store",
              headers: {
                Accept:
                  "application/json",
              },
            });
          let data: MarketApiResponse;
          try {
            data =
              (await response.json()) as MarketApiResponse;
          } catch {
            throw new Error(
              "AI TONKEEPER returned an invalid market response."
            );
          }
          if (!response.ok) {
            throw new Error(
              data?.message ??
                `Market API error (${response.status}).`
            );
          }
          if (
            data?.success !==
            true
          ) {
            throw new Error(
              data?.message ??
                "AI TONKEEPER could not load real market data."
            );
          }
          const nextCandles =
            Array.isArray(
              data.candles
            )
              ? data.candles
              : [];
          if (
            nextCandles.length ===
            0
          ) {
            throw new Error(
              "No real market data available."
            );
          }
          const normalized =
            nextCandles
              .map(
                (candle) => ({
                  time: Number(
                    candle.time
                  ),
                  open: Number(
                    candle.open
                  ),
                  high: Number(
                    candle.high
                  ),
                  low: Number(
                    candle.low
                  ),
                  close: Number(
                    candle.close
                  ),
                  volume: Number(
                    candle.volume ??
                      0
                  ),
                  turnover: Number(
                    candle.turnover ??
                      0
                  ),
                })
              )
              .filter(
                (candle) =>
                  Number.isFinite(
                    candle.time
                  ) &&
                  Number.isFinite(
                    candle.open
                  ) &&
                  Number.isFinite(
                    candle.high
                  ) &&
                  Number.isFinite(
                    candle.low
                  ) &&
                  Number.isFinite(
                    candle.close
                  ) &&
                  candle.close >
                    0
              )
              .sort(
                (a, b) =>
                  a.time -
                  b.time
              )
              .slice(-200);
          if (
            normalized.length ===
            0
          ) {
            throw new Error(
              "No valid real market candles received."
            );
          }
          setCandles(
            normalized
          );
          /*
           * A cached CoinGecko response is still
           * valid real market data.
           */
          setLiveConnected(
            true
          );
          setError("");
        } catch (err) {
          console.error(
            "AI TONKEEPER TRADING CHART ERROR:",
            err
          );
          /*
           * Keep the last valid candles.
           * Temporary CoinGecko 429 errors must
           * not erase the chart.
           */
          setLiveConnected(
            false
          );
          setCandles(
            (current) => {
              if (
                current.length ===
                0
              ) {
                setError(
                  err instanceof
                    Error
                    ? err.message
                    : "Unable to load real market data."
                );
              }
              return current;
            }
          );
        } finally {
          setLoading(false);
          setRefreshing(false);
        }
      },
      [
        symbol,
        selectedPeriod.minutes,
      ]
    );
  useEffect(() => {
    void loadCandles(true);
    const intervalId =
      window.setInterval(
        () => {
          void loadCandles(
            false
          );
        },
        MARKET_REFRESH_MS
      );
    return () => {
      window.clearInterval(
        intervalId
      );
    };
  }, [loadCandles]);
  const latest =
    candles.length > 0
      ? candles[
          candles.length - 1
        ]
      : null;
  const change =
    useMemo(() => {
      if (
        candles.length < 2
      ) {
        return 0;
      }
      const first =
        candles[0].close;
      const last =
        candles[
          candles.length - 1
        ].close;
      if (
        !Number.isFinite(
          first
        ) ||
        !Number.isFinite(
          last
        ) ||
        first === 0
      ) {
        return 0;
      }
      return (
        ((last - first) /
          first) *
        100
      );
    }, [candles]);
  const chart =
    useMemo(() => {
      if (
        candles.length === 0
      ) {
        return null;
      }
      const width = 900;
      const height = 430;
      const left = 15;
      const right = 80;
      const top = 20;
      const bottom = 40;
      const volumeHeight = 65;
      const volumeGap = 15;
      const priceHeight =
        height -
        top -
        bottom -
        volumeHeight -
        volumeGap;
      const chartWidth =
        width -
        left -
        right;
      const rawMax =
        Math.max(
          ...candles.map(
            (candle) =>
              candle.high
          )
        );
      const rawMin =
        Math.min(
          ...candles.map(
            (candle) =>
              candle.low
          )
        );
      const rawRange =
        rawMax - rawMin || 1;
      const padding =
        rawRange * 0.05;
      const maxPrice =
        rawMax + padding;
      const minPrice =
        Math.max(
          0,
          rawMin - padding
        );
      const priceRange =
        maxPrice -
          minPrice || 1;
      const getX = (
        index: number
      ) => {
        if (
          candles.length ===
          1
        ) {
          return (
            left +
            chartWidth / 2
          );
        }
        return (
          left +
          (index /
            (candles.length -
              1)) *
            chartWidth
        );
      };
      const getY = (
        price: number
      ) => {
        return (
          top +
          ((maxPrice -
            price) /
            priceRange) *
            priceHeight
        );
      };
      const candleWidth =
        Math.max(
          2,
          Math.min(
            10,
            (chartWidth /
              candles.length) *
              0.7
          )
        );
      const chartCandles =
        candles.map(
          (
            candle,
            index
          ) => {
            const x =
              getX(index);
            const openY =
              getY(
                candle.open
              );
            const closeY =
              getY(
                candle.close
              );
            const highY =
              getY(
                candle.high
              );
            const lowY =
              getY(
                candle.low
              );
            return {
              time: candle.time,
              x,
              bodyX:
                x -
                candleWidth /
                  2,
              bodyY:
                Math.min(
                  openY,
                  closeY
                ),
              bodyWidth:
                candleWidth,
              bodyHeight:
                Math.max(
                  1,
                  Math.abs(
                    openY -
                      closeY
                  )
                ),
              highY,
              lowY,
              bullish:
                candle.close >=
                candle.open,
            };
          }
        );
      const calculateMA = (
        length: number
      ): (number | null)[] => {
        return candles.map(
          (_, index) => {
            if (
              index <
              length - 1
            ) {
              return null;
            }
            let total = 0;
            for (
              let i =
                index -
                length +
                1;
              i <= index;
              i++
            ) {
              total +=
                candles[i]
                  .close;
            }
            return (
              total / length
            );
          }
        );
      };
      const createPath = (
        values: (
          | number
          | null
        )[]
      ) => {
        let path = "";
        values.forEach(
          (
            value,
            index
          ) => {
            if (
              value ===
                null ||
              !Number.isFinite(
                value
              )
            ) {
              return;
            }
            const px =
              getX(index);
            const py =
              getY(value);
            if (!path) {
              path = `M ${px} ${py}`;
            } else {
              path += ` L ${px} ${py}`;
            }
          }
        );
        return path;
      };
      const ma7 =
        calculateMA(7);
      const ma25 =
        calculateMA(25);
      const ma99 =
        calculateMA(99);
      const maxVolume =
        Math.max(
          ...candles.map(
            (candle) =>
              Number.isFinite(
                candle.volume
              )
                ? candle.volume
                : 0
          ),
          1
        );
      const volumeTop =
        top +
        priceHeight +
        volumeGap;
      const volumeBars =
        candles.map(
          (
            candle,
            index
          ) => {
            const volume =
              Number.isFinite(
                candle.volume
              )
                ? candle.volume
                : 0;
            const barHeight =
              (volume /
                maxVolume) *
              volumeHeight;
            return {
              time: candle.time,
              x: getX(index),
              y:
                volumeTop +
                volumeHeight -
                barHeight,
              width:
                Math.max(
                  1,
                  candleWidth
                ),
              height:
                Math.max(
                  1,
                  barHeight
                ),
              bullish:
                candle.close >=
                candle.open,
            };
          }
        );
      const priceLevels =
        Array.from(
          { length: 6 },
          (_, index) => {
            const ratio =
              index / 5;
            const price =
              maxPrice -
              ratio *
                priceRange;
            const y =
              top +
              ratio *
                priceHeight;
            return {
              price,
              y,
            };
          }
        );
      const timeIndexes =
        candles.length <= 6
          ? candles.map(
              (_, index) =>
                index
            )
          : Array.from(
              { length: 6 },
              (_, index) =>
                Math.round(
                  (index / 5) *
                    (candles.length -
                      1)
                )
            );
      const timeLabels =
        timeIndexes.map(
          (index) => ({
            time:
              candles[index]
                .time,
            x: getX(index),
            label:
              formatTime(
                candles[index]
                  .time,
                selectedPeriod.minutes
              ),
          })
        );
      const currentPriceY =
        latest !== null
          ? getY(
              latest.close
            )
          : null;
      return {
        width,
        height,
        maxPrice: rawMax,
        minPrice: rawMin,
        candles:
          chartCandles,
        ma7Path:
          createPath(ma7),
        ma25Path:
          createPath(ma25),
        ma99Path:
          createPath(ma99),
        volumeBars,
        priceLevels,
        timeLabels,
        volumeTop,
        currentPriceY,
      };
    }, [
      candles,
      latest,
      selectedPeriod.minutes,
    ]);
  const handleRetry =
    () => {
      void loadCandles(true);
    };
  return (
    <div className="bg-[#101A2C] border border-slate-800 rounded-3xl p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <span
              className={`w-2.5 h-2.5 rounded-full ${
                liveConnected
                  ? "bg-green-400 animate-pulse"
                  : "bg-yellow-400"
              }`}
            />
            <h2 className="text-xl font-bold">
              Live Trading Chart
            </h2>
          </div>
          <p className="text-xs text-gray-500 mt-1">
            {symbol.replace(
              "USDT",
              " / USD"
            )}{" "}
            • Real Market Data
          </p>
          <p
            className={`text-[10px] mt-1 font-semibold ${
              liveConnected
                ? "text-green-400"
                : "text-yellow-400"
            }`}
          >
            {liveConnected
              ? "● LIVE MARKET"
              : "● MARKET DATA OFFLINE"}
          </p>
        </div>
        {latest && (
          <div className="text-right">
            <p className="font-bold text-lg">
              $
              {formatPrice(
                latest.close
              )}
            </p>
            <p
              className={`text-xs mt-1 ${
                change >= 0
                  ? "text-green-400"
                  : "text-red-400"
              }`}
            >
              {change >= 0
                ? "+"
                : ""}
              {change.toFixed(
                2
              )}
              %
            </p>
          </div>
        )}
      </div>
      <div className="mt-5 rounded-2xl bg-[#0B1220] border border-slate-700 overflow-hidden">
        {loading ? (
          <div className="h-80 flex items-center justify-center text-gray-500">
            Loading real market data...
          </div>
        ) : error &&
          candles.length ===
            0 ? (
          <div className="h-80 flex items-center justify-center p-5 text-center">
            <div>
              <p className="text-red-400 text-sm">
                {error}
              </p>
              <button
                type="button"
                onClick={
                  handleRetry
                }
                className="mt-4 px-4 py-2 rounded-xl bg-cyan-500 text-white font-semibold"
              >
                Retry
              </button>
            </div>
          </div>
        ) : !chart ? (
          <div className="h-80 flex items-center justify-center text-gray-500">
            No real market data available.
          </div>
        ) : (
          <div className="w-full overflow-x-auto">
            <svg
              viewBox={`0 0 ${chart.width} ${chart.height}`}
              className="w-full min-w-[760px] h-[380px]"
              role="img"
              aria-label={`${symbol} real market candlestick chart`}
            >
              {chart.priceLevels.map(
                (level) => (
                  <line
                    key={`grid-${level.y}`}
                    x1={0}
                    x2={
                      chart.width -
                      80
                    }
                    y1={level.y}
                    y2={level.y}
                    stroke="rgba(148,163,184,0.10)"
                    strokeWidth="1"
                  />
                )
              )}
              {chart.candles.map(
                (item) => (
                  <g
                    key={
                      item.time
                    }
                  >
                    <line
                      x1={item.x}
                      x2={item.x}
                      y1={
                        item.highY
                      }
                      y2={
                        item.lowY
                      }
                      stroke={
                        item.bullish
                          ? "#22c55e"
                          : "#ef4444"
                      }
                      strokeWidth="1"
                    />
                    <rect
                      x={
                        item.bodyX
                      }
                      y={
                        item.bodyY
                      }
                      width={
                        item.bodyWidth
                      }
                      height={
                        item.bodyHeight
                      }
                      fill={
                        item.bullish
                          ? "#22c55e"
                          : "#ef4444"
                      }
                      rx="1"
                    />
                  </g>
                )
              )}
              {chart.ma7Path && (
                <path
                  d={
                    chart.ma7Path
                  }
                  fill="none"
                  stroke="#facc15"
                  strokeWidth="1.5"
                />
              )}
              {chart.ma25Path && (
                <path
                  d={
                    chart.ma25Path
                  }
                  fill="none"
                  stroke="#22d3ee"
                  strokeWidth="1.5"
                />
              )}
              {chart.ma99Path && (
                <path
                  d={
                    chart.ma99Path
                  }
                  fill="none"
                  stroke="#a78bfa"
                  strokeWidth="1.5"
                />
              )}
              <line
                x1={0}
                x2={
                  chart.width -
                  80
                }
                y1={
                  chart.volumeTop
                }
                y2={
                  chart.volumeTop
                }
                stroke="rgba(148,163,184,0.12)"
              />
              {chart.volumeBars.map(
                (bar) => (
                  <rect
                    key={`volume-${bar.time}`}
                    x={
                      bar.x -
                      bar.width /
                        2
                    }
                    y={bar.y}
                    width={
                      bar.width
                    }
                    height={
                      bar.height
                    }
                    fill={
                      bar.bullish
                        ? "#22c55e"
                        : "#ef4444"
                    }
                    opacity="0.45"
                  />
                )
              )}
              {chart.currentPriceY !==
                null &&
                latest && (
                  <>
                    <line
                      x1={0}
                      x2={
                        chart.width -
                        80
                      }
                      y1={
                        chart.currentPriceY
                      }
                      y2={
                        chart.currentPriceY
                      }
                      stroke="#22d3ee"
                      strokeWidth="1"
                      strokeDasharray="4 4"
                      opacity="0.7"
                    />
                    <rect
                      x={
                        chart.width -
                        78
                      }
                      y={
                        chart.currentPriceY -
                        10
                      }
                      width="76"
                      height="20"
                      rx="3"
                      fill="#0891b2"
                    />
                    <text
                      x={
                        chart.width -
                        40
                      }
                      y={
                        chart.currentPriceY +
                        4
                      }
                      textAnchor="middle"
                      fill="white"
                      fontSize="9"
                      fontWeight="600"
                    >
                      $
                      {formatPrice(
                        latest.close
                      )}
                    </text>
                  </>
                )}
              {chart.priceLevels.map(
                (level) => (
                  <text
                    key={`price-${level.y}`}
                    x={
                      chart.width -
                      5
                    }
                    y={
                      level.y + 4
                    }
                    textAnchor="end"
                    fill="#94a3b8"
                    fontSize="10"
                  >
                    {formatPrice(
                      level.price
                    )}
                  </text>
                )
              )}
              <text
                x={15}
                y={
                  chart.volumeTop +
                  12
                }
                fill="#64748b"
                fontSize="9"
              >
                VOLUME
              </text>
              {chart.timeLabels.map(
                (item) => (
                  <text
                    key={`time-${item.time}`}
                    x={item.x}
                    y={
                      chart.height -
                      12
                    }
                    textAnchor="middle"
                    fill="#64748b"
                    fontSize="10"
                  >
                    {item.label}
                  </text>
                )
              )}
            </svg>
          </div>
        )}
      </div>
      <div className="flex gap-2 mt-4 overflow-x-auto pb-1">
        {PERIODS.map(
          (item) => (
            <button
              key={
                item.label
              }
              type="button"
              onClick={() =>
                setPeriod(
                  item.label
                )
              }
              className={
                period ===
                item.label
                  ? "min-w-[58px] bg-cyan-500 rounded-xl py-2.5 px-3 font-semibold text-white"
                  : "min-w-[58px] bg-[#0B1220] border border-slate-700 rounded-xl py-2.5 px-3 text-gray-300"
              }
            >
              {item.label}
            </button>
          )
        )}
      </div>
      <div className="grid grid-cols-3 gap-3 mt-4">
        <div className="bg-[#0B1220] rounded-2xl p-3">
          <p className="text-[10px] text-gray-500">
            HIGH
          </p>
          <p className="text-sm font-semibold mt-1">
            $
            {chart
              ? formatPrice(
                  chart.maxPrice
                )
              : "0"}
          </p>
        </div>
        <div className="bg-[#0B1220] rounded-2xl p-3">
          <p className="text-[10px] text-gray-500">
            LOW
          </p>
          <p className="text-sm font-semibold mt-1">
            $
            {chart
              ? formatPrice(
                  chart.minPrice
                )
              : "0"}
          </p>
        </div>
        <div className="bg-[#0B1220] rounded-2xl p-3">
          <p className="text-[10px] text-gray-500">
            CANDLES
          </p>
          <p className="text-sm font-semibold mt-1">
            {candles.length}
          </p>
        </div>
      </div>
      <div className="flex flex-wrap items-center justify-center gap-4 mt-4 text-[10px]">
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-yellow-400" />
          <span className="text-gray-400">
            MA7
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-cyan-400" />
          <span className="text-gray-400">
            MA25
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-purple-400" />
          <span className="text-gray-400">
            MA99
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          <span
            className={`w-2 h-2 rounded-full ${
              liveConnected
                ? "bg-green-400 animate-pulse"
                : "bg-yellow-400"
            }`}
          />
          <span className="text-gray-400">
            {refreshing
              ? "UPDATING"
              : liveConnected
                ? "LIVE"
                : "OFFLINE"}
          </span>
        </div>
      </div>
    </div>
  );
}