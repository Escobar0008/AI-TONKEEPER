"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
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

type KlineResponse = {
  success: boolean;
  message?: string;
  candles?: Candle[];
};

type TradingChartProps = {
  symbol?: string;
  category?: "spot" | "linear" | "inverse";
};

const PERIODS = [
  { label: "1m", interval: "1", limit: 200 },
  { label: "5m", interval: "5", limit: 200 },
  { label: "15m", interval: "15", limit: 200 },
  { label: "30m", interval: "30", limit: 200 },
  { label: "1H", interval: "60", limit: 200 },
  { label: "4H", interval: "240", limit: 200 },
  { label: "1D", interval: "D", limit: 200 },
] as const;

function formatPrice(value: number): string {
  if (!Number.isFinite(value)) {
    return "0";
  }

  if (value >= 1000) {
    return value.toLocaleString("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  }

  if (value >= 1) {
    return value.toLocaleString("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 4,
    });
  }

  return value.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 8,
  });
}

function getWebSocketUrl(
  category: "spot" | "linear" | "inverse"
): string {
  switch (category) {
    case "spot":
      return "wss://stream.bybit.com/v5/public/spot";

    case "inverse":
      return "wss://stream.bybit.com/v5/public/inverse";

    case "linear":
    default:
      return "wss://stream.bybit.com/v5/public/linear";
  }
}

function formatTime(
  timestamp: number,
  interval: string
): string {
  const date = new Date(timestamp);

  if (interval === "D") {
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
  }

  return date.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
}

export default function TradingChart({
  symbol = "BTCUSDT",
  category = "spot",
}: TradingChartProps) {
  const [period, setPeriod] = useState("15m");

  const [candles, setCandles] = useState<Candle[]>([]);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");

  const [liveConnected, setLiveConnected] =
    useState(false);

  const socketRef = useRef<WebSocket | null>(null);

  const reconnectTimerRef =
    useRef<ReturnType<typeof setTimeout> | null>(null);

  const heartbeatTimerRef =
    useRef<ReturnType<typeof setInterval> | null>(null);

  const mountedRef = useRef(false);

  const reconnectAttemptsRef = useRef(0);

  const selectedPeriod = useMemo(() => {
    return (
      PERIODS.find(
        (item) => item.label === period
      ) ?? PERIODS[2]
    );
  }, [period]);

  /*
  |--------------------------------------------------------------------------
  | LOAD HISTORICAL CANDLES
  |--------------------------------------------------------------------------
  */

  const loadCandles = useCallback(
    async (showLoading = true) => {
      try {
        if (showLoading) {
          setLoading(true);
        }

        setError("");

        const params = new URLSearchParams({
          symbol,
          category,
          interval: selectedPeriod.interval,
          limit: String(selectedPeriod.limit),
        });

        const response = await fetch(
          `/api/bybit/market/kline?${params.toString()}`,
          {
            method: "GET",
            cache: "no-store",
          }
        );

        let data: KlineResponse;

        try {
          data =
            (await response.json()) as KlineResponse;
        } catch {
          throw new Error(
            "Invalid response from market API."
          );
        }

        if (!response.ok || !data.success) {
          throw new Error(
            data.message ||
              "Unable to load chart data."
          );
        }

        const nextCandles = Array.isArray(
          data.candles
        )
          ? data.candles
              .filter((candle) => {
                return (
                  Number.isFinite(candle.time) &&
                  Number.isFinite(candle.open) &&
                  Number.isFinite(candle.high) &&
                  Number.isFinite(candle.low) &&
                  Number.isFinite(candle.close)
                );
              })
              .sort(
                (a, b) => a.time - b.time
              )
          : [];

        if (mountedRef.current) {
          setCandles(
            nextCandles.slice(
              -selectedPeriod.limit
            )
          );
        }
      } catch (err) {
        console.error(
          "TRADING CHART ERROR:",
          err
        );

        if (mountedRef.current) {
          setError(
            err instanceof Error
              ? err.message
              : "Unable to load market data."
          );
        }
      } finally {
        if (mountedRef.current) {
          setLoading(false);
        }
      }
    },
    [
      symbol,
      category,
      selectedPeriod.interval,
      selectedPeriod.limit,
    ]
  );

  /*
  |--------------------------------------------------------------------------
  | INITIAL LOAD
  |--------------------------------------------------------------------------
  */

  useEffect(() => {
    mountedRef.current = true;

    void loadCandles(true);

    return () => {
      mountedRef.current = false;
    };
  }, [loadCandles]);

  /*
  |--------------------------------------------------------------------------
  | WEBSOCKET
  |--------------------------------------------------------------------------
  */

  useEffect(() => {
    mountedRef.current = true;

    const websocketUrl =
      getWebSocketUrl(category);

    const topic = `kline.${selectedPeriod.interval}.${symbol}`;

    let stopped = false;

    const clearTimers = () => {
      if (
        reconnectTimerRef.current !== null
      ) {
        clearTimeout(
          reconnectTimerRef.current
        );

        reconnectTimerRef.current = null;
      }

      if (
        heartbeatTimerRef.current !== null
      ) {
        clearInterval(
          heartbeatTimerRef.current
        );

        heartbeatTimerRef.current = null;
      }
    };

    const closeSocket = () => {
      const socket = socketRef.current;

      socketRef.current = null;

      if (!socket) {
        return;
      }

      socket.onopen = null;
      socket.onmessage = null;
      socket.onerror = null;
      socket.onclose = null;

      if (
        socket.readyState ===
          WebSocket.OPEN ||
        socket.readyState ===
          WebSocket.CONNECTING
      ) {
        try {
          socket.close();
        } catch {
          // Ignore close errors.
        }
      }
    };

    const cleanup = () => {
      clearTimers();
      closeSocket();

      if (mountedRef.current) {
        setLiveConnected(false);
      }
    };

    const scheduleReconnect = () => {
      if (stopped) {
        return;
      }

      if (!mountedRef.current) {
        return;
      }

      if (
        reconnectTimerRef.current !== null
      ) {
        return;
      }

      reconnectAttemptsRef.current += 1;

      const delay = Math.min(
        1000 *
          Math.pow(
            2,
            reconnectAttemptsRef.current - 1
          ),
        10000
      );

      console.log(
        `BYBIT: reconnecting in ${delay}ms`
      );

      reconnectTimerRef.current =
        setTimeout(() => {
          reconnectTimerRef.current = null;

          if (!stopped) {
            connect();
          }
        }, delay);
    };

    const connect = () => {
      if (stopped) {
        return;
      }

      if (!mountedRef.current) {
        return;
      }

      clearTimers();

      closeSocket();

      try {
        console.log(
          "BYBIT WEBSOCKET CONNECT:",
          websocketUrl
        );

        const socket =
          new WebSocket(websocketUrl);

        socketRef.current = socket;

        socket.onopen = () => {
          if (
            stopped ||
            !mountedRef.current
          ) {
            return;
          }

          console.log(
            "BYBIT WEBSOCKET CONNECTED"
          );

          reconnectAttemptsRef.current = 0;

          setLiveConnected(true);

          /*
          | Subscribe
          */

          socket.send(
            JSON.stringify({
              op: "subscribe",
              args: [topic],
            })
          );

          console.log(
            "BYBIT SUBSCRIBED:",
            topic
          );

          /*
          | Heartbeat
          */

          if (
            heartbeatTimerRef.current !==
            null
          ) {
            clearInterval(
              heartbeatTimerRef.current
            );
          }

          heartbeatTimerRef.current =
            setInterval(() => {
              if (
                socket.readyState ===
                WebSocket.OPEN
              ) {
                socket.send(
                  JSON.stringify({
                    op: "ping",
                  })
                );
              }
            }, 20000);
        };

        socket.onmessage = (event) => {
          if (
            stopped ||
            !mountedRef.current
          ) {
            return;
          }

          try {
            const message =
              JSON.parse(event.data) as {
                topic?: string;
                type?: string;
                success?: boolean;
                ret_msg?: string;
                data?: Array<{
                  start?: number | string;
                  timestamp?: number | string;
                  open?: number | string;
                  high?: number | string;
                  low?: number | string;
                  close?: number | string;
                  volume?: number | string;
                  turnover?: number | string;
                }>;
              };

            /*
            | Ignore pong / subscription messages
            */

            if (
              message.topic !== topic
            ) {
              return;
            }

            if (
              !Array.isArray(
                message.data
              ) ||
              message.data.length === 0
            ) {
              return;
            }

            const incoming =
              message.data[0];

            const time = Number(
              incoming.start ??
                incoming.timestamp ??
                0
            );

            const open = Number(
              incoming.open ?? 0
            );

            const high = Number(
              incoming.high ?? 0
            );

            const low = Number(
              incoming.low ?? 0
            );

            const close = Number(
              incoming.close ?? 0
            );

            const volume = Number(
              incoming.volume ?? 0
            );

            const turnover = Number(
              incoming.turnover ?? 0
            );

            if (
              !Number.isFinite(time) ||
              !Number.isFinite(open) ||
              !Number.isFinite(high) ||
              !Number.isFinite(low) ||
              !Number.isFinite(close)
            ) {
              return;
            }

            const liveCandle: Candle = {
              time,
              open,
              high,
              low,
              close,
              volume:
                Number.isFinite(volume)
                  ? volume
                  : 0,
              turnover:
                Number.isFinite(turnover)
                  ? turnover
                  : 0,
            };

            setCandles((previous) => {
              if (
                previous.length === 0
              ) {
                return [
                  liveCandle,
                ];
              }

              const last =
                previous[
                  previous.length - 1
                ];

              /*
              | Update current candle
              */

              if (
                last.time ===
                liveCandle.time
              ) {
                return [
                  ...previous.slice(
                    0,
                    -1
                  ),
                  liveCandle,
                ];
              }

              /*
              | New candle
              */

              if (
                liveCandle.time >
                last.time
              ) {
                return [
                  ...previous,
                  liveCandle,
                ].slice(
                  -selectedPeriod.limit
                );
              }

              return previous;
            });
          } catch (err) {
            console.error(
              "BYBIT WEBSOCKET MESSAGE ERROR:",
              err
            );
          }
        };

        socket.onerror = (event) => {
          console.error(
            "BYBIT WEBSOCKET ERROR:",
            event
          );

          if (
            mountedRef.current &&
            !stopped
          ) {
            setLiveConnected(false);
          }
        };

        socket.onclose = (
          event
        ) => {
          console.warn(
            "BYBIT WEBSOCKET CLOSED:",
            event.code,
            event.reason
          );

          if (
            socketRef.current ===
            socket
          ) {
            socketRef.current = null;
          }

          if (
            heartbeatTimerRef.current !==
            null
          ) {
            clearInterval(
              heartbeatTimerRef.current
            );

            heartbeatTimerRef.current =
              null;
          }

          if (
            mountedRef.current &&
            !stopped
          ) {
            setLiveConnected(false);

            scheduleReconnect();
          }
        };
      } catch (err) {
        console.error(
          "BYBIT WEBSOCKET CONNECTION ERROR:",
          err
        );

        if (
          mountedRef.current &&
          !stopped
        ) {
          setLiveConnected(false);

          scheduleReconnect();
        }
      }
    };

    /*
    | Start connection
    */

    connect();

    /*
    | Cleanup when symbol/category/timeframe changes
    */

    return () => {
      stopped = true;

      clearTimers();

      closeSocket();

      setLiveConnected(false);
    };
  }, [
    symbol,
    category,
    selectedPeriod.interval,
    selectedPeriod.limit,
  ]);

  /*
  |--------------------------------------------------------------------------
  | LATEST
  |--------------------------------------------------------------------------
  */

  const latest =
    candles.length > 0
      ? candles[candles.length - 1]
      : null;

  /*
  |--------------------------------------------------------------------------
  | PERFORMANCE
  |--------------------------------------------------------------------------
  */

  const change = useMemo(() => {
    if (candles.length < 2) {
      return 0;
    }

    const first =
      candles[0].close;

    const last =
      candles[candles.length - 1]
        .close;

    if (
      !Number.isFinite(first) ||
      !Number.isFinite(last) ||
      first === 0
    ) {
      return 0;
    }

    return (
      ((last - first) / first) *
      100
    );
  }, [candles]);

  /*
  |--------------------------------------------------------------------------
  | CHART
  |--------------------------------------------------------------------------
  */

  const chart = useMemo(() => {
    if (candles.length === 0) {
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
      width - left - right;

    const highs = candles.map(
      (candle) => candle.high
    );

    const lows = candles.map(
      (candle) => candle.low
    );

    const rawMax = Math.max(
      ...highs
    );

    const rawMin = Math.min(
      ...lows
    );

    const rawRange =
      rawMax - rawMin || 1;

    const padding =
      rawRange * 0.05;

    const maxPrice =
      rawMax + padding;

    const minPrice = Math.max(
      0,
      rawMin - padding
    );

    const priceRange =
      maxPrice - minPrice || 1;

    const getX = (
      index: number
    ) => {
      if (candles.length === 1) {
        return (
          left +
          chartWidth / 2
        );
      }

      return (
        left +
        (index /
          (candles.length - 1)) *
          chartWidth
      );
    };

    const getY = (
      price: number
    ) => {
      return (
        top +
        ((maxPrice - price) /
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
        (candle, index) => {
          const x = getX(index);

          const openY =
            getY(candle.open);

          const closeY =
            getY(candle.close);

          const highY =
            getY(candle.high);

          const lowY =
            getY(candle.low);

          return {
            time: candle.time,
            x,
            bodyX:
              x -
              candleWidth / 2,
            bodyY: Math.min(
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
              candles[i].close;
          }

          return (
            total / length
          );
        }
      );
    };

    const createPath = (
      values: (number | null)[]
    ) => {
      let path = "";

      values.forEach(
        (value, index) => {
          if (
            value === null ||
            !Number.isFinite(value)
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
        (candle, index) => {
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
            candles[index].time,
          x: getX(index),
          label: formatTime(
            candles[index].time,
            selectedPeriod.interval
          ),
        })
      );

    const currentPriceY =
      latest !== null
        ? getY(latest.close)
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
    selectedPeriod.interval,
  ]);

  const handleRetry = () => {
    void loadCandles(true);
  };

  return (
    <div className="bg-[#101A2C] border border-slate-800 rounded-3xl p-5">

      {/* HEADER */}

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
            {symbol} • Bybit
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
              : "● RECONNECTING..."}
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
              {change.toFixed(2)}%
            </p>

          </div>
        )}

      </div>

      {/* CHART */}

      <div className="mt-5 rounded-2xl bg-[#0B1220] border border-slate-700 overflow-hidden">

        {loading ? (
          <div className="h-80 flex items-center justify-center text-gray-500">
            Loading live market...
          </div>
        ) : error ? (
          <div className="h-80 flex items-center justify-center p-5 text-center">

            <div>

              <p className="text-red-400 text-sm">
                {error}
              </p>

              <button
                type="button"
                onClick={handleRetry}
                className="mt-4 px-4 py-2 rounded-xl bg-cyan-500 text-white font-semibold"
              >
                Retry
              </button>

            </div>

          </div>
        ) : !chart ? (
          <div className="h-80 flex items-center justify-center text-gray-500">
            No market data available.
          </div>
        ) : (
          <div className="w-full overflow-x-auto">

            <svg
              viewBox={`0 0 ${chart.width} ${chart.height}`}
              className="w-full min-w-[760px] h-[380px]"
              role="img"
              aria-label={`${symbol} live Bybit candlestick chart`}
            >

              {/* GRID */}

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

              {/* CANDLES */}

              {chart.candles.map(
                (item) => (
                  <g
                    key={item.time}
                  >

                    <line
                      x1={item.x}
                      x2={item.x}
                      y1={item.highY}
                      y2={item.lowY}
                      stroke={
                        item.bullish
                          ? "#22c55e"
                          : "#ef4444"
                      }
                      strokeWidth="1"
                    />

                    <rect
                      x={item.bodyX}
                      y={item.bodyY}
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

              {/* MA7 */}

              {chart.ma7Path && (
                <path
                  d={chart.ma7Path}
                  fill="none"
                  stroke="#facc15"
                  strokeWidth="1.5"
                />
              )}

              {/* MA25 */}

              {chart.ma25Path && (
                <path
                  d={chart.ma25Path}
                  fill="none"
                  stroke="#22d3ee"
                  strokeWidth="1.5"
                />
              )}

              {/* MA99 */}

              {chart.ma99Path && (
                <path
                  d={chart.ma99Path}
                  fill="none"
                  stroke="#a78bfa"
                  strokeWidth="1.5"
                />
              )}

              {/* VOLUME */}

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
                      bar.width / 2
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

              {/* CURRENT PRICE */}

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

              {/* PRICE SCALE */}

              {chart.priceLevels.map(
                (level) => (
                  <text
                    key={`price-${level.y}`}
                    x={
                      chart.width -
                      5
                    }
                    y={
                      level.y +
                      4
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

              {/* VOLUME LABEL */}

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

              {/* TIME */}

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

      {/* TIMEFRAMES */}

      <div className="flex gap-2 mt-4 overflow-x-auto pb-1">

        {PERIODS.map(
          (item) => (
            <button
              key={item.label}
              type="button"
              onClick={() =>
                setPeriod(
                  item.label
                )
              }
              disabled={loading}
              className={
                period ===
                item.label
                  ? "min-w-[58px] bg-cyan-500 rounded-xl py-2.5 px-3 font-semibold text-white disabled:opacity-50"
                  : "min-w-[58px] bg-[#0B1220] border border-slate-700 rounded-xl py-2.5 px-3 text-gray-300 disabled:opacity-50"
              }
            >
              {item.label}
            </button>
          )
        )}

      </div>

      {/* STATISTICS */}

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

      {/* LEGEND */}

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
            {liveConnected
              ? "LIVE"
              : "RECONNECTING"}
          </span>

        </div>

      </div>

    </div>
  );
}