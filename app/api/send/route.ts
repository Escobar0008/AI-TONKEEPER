import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/auth";
import { prisma } from "@/lib/prisma";

const FEES = {
  TON: 0.005,
  BTC: 0.00001,
  ETH: 0.0005,
  USDT: 1,
  BNB: 0.0005,
} as const;

type Coin = keyof typeof FEES;

function isCoin(value: unknown): value is Coin {
  return (
    typeof value === "string" &&
    value in FEES
  );
}

function isValidAddress(
  address: unknown
): address is string {
  return (
    typeof address === "string" &&
    address.trim().length >= 10 &&
    address.trim().length <= 200
  );
}

export async function POST(
  request: NextRequest
) {
  try {
    /*
     * =========================================================
     * 1. AUTHENTICATION
     * =========================================================
     */

    const session =
      await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        {
          success: false,
          message: "Not authenticated.",
        },
        { status: 401 }
      );
    }

    /*
     * =========================================================
     * 2. READ REQUEST
     * =========================================================
     */

    const body = await request.json();

    const coinValue =
      typeof body?.coin === "string"
        ? body.coin.trim().toUpperCase()
        : "";

    const address =
      typeof body?.address === "string"
        ? body.address.trim()
        : "";

    const amount =
      typeof body?.amount === "number"
        ? body.amount
        : Number(body?.amount);

    /*
     * =========================================================
     * 3. VALIDATE COIN
     * =========================================================
     */

    if (!isCoin(coinValue)) {
      return NextResponse.json(
        {
          success: false,
          message: "Unsupported asset.",
        },
        { status: 400 }
      );
    }

    /*
     * =========================================================
     * 4. VALIDATE ADDRESS
     * =========================================================
     */

    if (!isValidAddress(address)) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Invalid recipient address.",
        },
        { status: 400 }
      );
    }

    /*
     * =========================================================
     * 5. VALIDATE AMOUNT
     * =========================================================
     */

    if (
      !Number.isFinite(amount) ||
      amount <= 0
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid amount.",
        },
        { status: 400 }
      );
    }

    /*
     * =========================================================
     * 6. GET MAIN WALLET
     * =========================================================
     */

    const mainWallet =
      await prisma.mainWallet.findUnique({
        where: {
          coin: coinValue,
        },
      });

    if (
      !mainWallet ||
      !mainWallet.enabled
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Sending this asset is currently unavailable.",
        },
        { status: 503 }
      );
    }

    /*
     * =========================================================
     * 7. GET USER BALANCE
     * =========================================================
     */

    const balance =
      await prisma.balance.findUnique({
        where: {
          userId_coin: {
            userId: session.user.id,
            coin: coinValue,
          },
        },
      });

    const currentBalance =
      balance?.balance ?? 0;

    const fee = FEES[coinValue];

    const total = amount + fee;

    /*
     * =========================================================
     * 8. CHECK BALANCE
     * =========================================================
     */

    if (currentBalance < total) {
      return NextResponse.json(
        {
          success: false,
          message:
            `Insufficient ${coinValue} balance. ` +
            `Required: ${total} ${coinValue}. ` +
            `Available: ${currentBalance} ${coinValue}.`,
        },
        { status: 400 }
      );
    }

    /*
     * =========================================================
     * 9. PREVENT SENDING TO MAIN WALLET
     * =========================================================
     */

    if (
      address.toLowerCase() ===
      mainWallet.address.toLowerCase()
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "The recipient address cannot be the AI TONKEEPER main wallet.",
        },
        { status: 400 }
      );
    }

    /*
     * =========================================================
     * 10. CREATE WITHDRAWAL
     *     + TRANSACTION
     *     + NOTIFICATION
     *
     * IMPORTANT:
     *
     * The balance is NOT debited here.
     *
     * The blockchain transaction has not
     * been executed yet.
     *
     * The notification tells the user that
     * the withdrawal request is PENDING.
     * =========================================================
     */

    const result =
      await prisma.$transaction(
        async (tx) => {
          /*
           * WITHDRAWAL REQUEST
           */

          const withdrawal =
            await tx.withdrawalRequest.create({
              data: {
                userId: session.user.id,
                coin: coinValue,
                amount,
                fee,
                address,
                status: "PENDING",
              },
            });

          /*
           * TRANSACTION
           */

          const transaction =
            await tx.transaction.create({
              data: {
                userId: session.user.id,
                coin: coinValue,
                type: "WITHDRAW",
                amount,
                fee,
                fromAddress:
                  mainWallet.address,
                toAddress: address,
                status: "PENDING",
              },
            });

          /*
           * NOTIFICATION
           *
           * This uses the central Notification system:
           * /api/notifications
           *
           * It is NOT a fake frontend notification.
           * It is stored in the database.
           */

          const notification =
            await tx.notification.create({
              data: {
                userId: session.user.id,
                type: "WITHDRAWAL",
                title: "Withdrawal Pending",
                message:
                  `Your ${coinValue} withdrawal request of ` +
                  `${amount} ${coinValue} has been created ` +
                  `and is awaiting processing.`,
                actionUrl: "/transactions",
              },
            });

          return {
            withdrawal,
            transaction,
            notification,
          };
        }
      );

    /*
     * =========================================================
     * 11. RESPONSE
     * =========================================================
     */

    return NextResponse.json(
      {
        success: true,
        message:
          "Your send request has been created and is awaiting processing.",
        withdrawalId:
          result.withdrawal.id,
        transactionId:
          result.transaction.id,
        notificationId:
          result.notification.id,
        coin: coinValue,
        amount,
        fee,
        total,
        fromAddress:
          mainWallet.address,
        toAddress: address,
        status: "PENDING",
      },
      { status: 201 }
    );
  } catch (error) {
    console.error(
      "SEND API ERROR:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        message:
          "Unable to create send request.",
      },
      { status: 500 }
    );
  }
}