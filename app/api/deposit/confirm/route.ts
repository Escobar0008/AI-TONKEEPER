import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { NotificationType } from "@prisma/client";
import { getBybitDepositByTxHash } from "@/lib/bybit/client";

type ConfirmDepositBody = {
  coin?: string;
  txHash?: string;
};

/*
|--------------------------------------------------------------------------
| HELPERS
|--------------------------------------------------------------------------
*/

function normalize(value: string | null | undefined) {
  return typeof value === "string"
    ? value.trim().toLowerCase()
    : "";
}

function isValidCoin(value: string) {
  return /^[A-Z0-9]{2,20}$/.test(value);
}

/*
|--------------------------------------------------------------------------
| POST /api/deposit/confirm
|--------------------------------------------------------------------------
|
| Flow:
|
| Client
|   ↓
| TX Hash
|   ↓
| Authenticated user
|   ↓
| Bybit verification
|   ↓
| MainWallet verification
|   ↓
| Transaction
|   ↓
| Balance
|   ↓
| Notification
|
| The amount is NEVER trusted from the browser.
| The amount comes directly from Bybit.
|
|--------------------------------------------------------------------------
*/

export async function POST(request: NextRequest) {
  try {
    // ============================================================
    // AUTHENTICATION
    // ============================================================

    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        {
          success: false,
          message: "Unauthorized.",
        },
        {
          status: 401,
        },
      );
    }

    const userId = session.user.id;

    // ============================================================
    // BODY
    // ============================================================

    let body: ConfirmDepositBody;

    try {
      body = (await request.json()) as ConfirmDepositBody;
    } catch {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid request body.",
        },
        {
          status: 400,
        },
      );
    }

    const coin =
      typeof body.coin === "string"
        ? body.coin.trim().toUpperCase()
        : "";

    const txHash =
      typeof body.txHash === "string"
        ? body.txHash.trim()
        : "";

    // ============================================================
    // VALIDATION
    // ============================================================

    if (!coin) {
      return NextResponse.json(
        {
          success: false,
          message: "Coin is required.",
        },
        {
          status: 400,
        },
      );
    }

    if (!isValidCoin(coin)) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid coin.",
        },
        {
          status: 400,
        },
      );
    }

    if (!txHash) {
      return NextResponse.json(
        {
          success: false,
          message: "Transaction hash is required.",
        },
        {
          status: 400,
        },
      );
    }

    // ============================================================
    // VERIFY USER
    // ============================================================

    const user = await prisma.user.findUnique({
      where: {
        id: userId,
      },
      select: {
        id: true,
      },
    });

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          message: "User not found.",
        },
        {
          status: 404,
        },
      );
    }

    // ============================================================
    // CHECK LOCAL DUPLICATE
    // ============================================================

    const existingTransaction =
      await prisma.transaction.findFirst({
        where: {
          txHash,
        },
        select: {
          id: true,
          userId: true,
          coin: true,
          amount: true,
          status: true,
          createdAt: true,
        },
      });

    if (existingTransaction) {
      return NextResponse.json(
        {
          success: false,
          message:
            "This transaction has already been processed.",
          transactionId:
            existingTransaction.id,
        },
        {
          status: 409,
        },
      );
    }

    // ============================================================
    // VERIFY MAIN WALLET
    // ============================================================

    const mainWallet =
      await prisma.mainWallet.findUnique({
        where: {
          coin: coin as never,
        },
      });

    if (!mainWallet || !mainWallet.enabled) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Deposit wallet is unavailable.",
        },
        {
          status: 400,
        },
      );
    }

    // ============================================================
    // VERIFY REAL DEPOSIT WITH BYBIT
    // ============================================================

    const bybitResult =
      await getBybitDepositByTxHash(
        txHash,
        coin,
      );

    if (
      !bybitResult.success ||
      !bybitResult.deposit
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            bybitResult.message ||
            "Deposit could not be verified with Bybit.",
        },
        {
          status: 400,
        },
      );
    }

    const bybitDeposit =
      bybitResult.deposit;

    // ============================================================
    // VERIFY COIN
    // ============================================================

    const bybitCoin =
      typeof bybitDeposit.coin === "string"
        ? bybitDeposit.coin
            .trim()
            .toUpperCase()
        : "";

    if (bybitCoin !== coin) {
      return NextResponse.json(
        {
          success: false,
          message:
            "The deposit coin does not match the requested coin.",
        },
        {
          status: 400,
        },
      );
    }

    // ============================================================
    // VERIFY TRANSACTION HASH
    // ============================================================

    const bybitTxHash =
      typeof bybitDeposit.txID === "string"
        ? bybitDeposit.txID.trim()
        : "";

    if (!bybitTxHash) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Bybit did not return a valid transaction ID.",
        },
        {
          status: 400,
        },
      );
    }

    if (
      normalize(bybitTxHash) !==
      normalize(txHash)
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Transaction hash verification failed.",
        },
        {
          status: 400,
        },
      );
    }

    // ============================================================
    // VERIFY AMOUNT
    // ============================================================

    const amount = Number(
      bybitDeposit.amount,
    );

    if (
      !Number.isFinite(amount) ||
      amount <= 0
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Bybit returned an invalid deposit amount.",
        },
        {
          status: 400,
        },
      );
    }

    // ============================================================
    // VERIFY DESTINATION ADDRESS
    // ============================================================

    const bybitToAddress =
      typeof bybitDeposit.toAddress ===
      "string"
        ? bybitDeposit.toAddress.trim()
        : "";

    const mainWalletAddress =
      mainWallet.address.trim();

    if (
      !bybitToAddress ||
      normalize(bybitToAddress) !==
        normalize(mainWalletAddress)
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "The Bybit deposit destination does not match the configured main wallet.",
        },
        {
          status: 400,
        },
      );
    }

    // ============================================================
    // VERIFY BYBIT DEPOSIT STATUS
    // ============================================================
    //
    // Bybit uses numeric deposit status values.
    // We accept only status 3 (success).
    //
    // ============================================================

    const depositStatus =
      Number(bybitDeposit.status);

    if (depositStatus !== 3) {
      return NextResponse.json(
        {
          success: false,
          message:
            "The deposit is not confirmed by Bybit yet.",
          bybitStatus:
            depositStatus,
        },
        {
          status: 409,
        },
      );
    }

    // ============================================================
    // SOURCE ADDRESS
    // ============================================================

    const fromAddress =
      typeof bybitDeposit.fromAddress ===
      "string"
        ? bybitDeposit.fromAddress.trim()
        : null;

    // ============================================================
    // CREATE DEPOSIT + BALANCE + NOTIFICATION
    // ============================================================

    const result =
      await prisma.$transaction(
        async (tx) => {
          // ------------------------------------------------------
          // DOUBLE CHECK DUPLICATE INSIDE TRANSACTION
          // ------------------------------------------------------

          const duplicate =
            await tx.transaction.findFirst({
              where: {
                txHash: bybitTxHash,
              },
              select: {
                id: true,
              },
            });

          if (duplicate) {
            throw new Error(
              "DEPOSIT_ALREADY_PROCESSED",
            );
          }

          // ------------------------------------------------------
          // FIND OR CREATE BALANCE
          // ------------------------------------------------------

          const existingBalance =
            await tx.balance.findUnique({
              where: {
                userId_coin: {
                  userId,
                  coin: coin as never,
                },
              },
            });

          const balance =
            existingBalance
              ? await tx.balance.update({
                  where: {
                    id: existingBalance.id,
                  },
                  data: {
                    balance: {
                      increment: amount,
                    },
                  },
                })
              : await tx.balance.create({
                  data: {
                    userId,
                    coin: coin as never,
                    balance: amount,
                  },
                });

          // ------------------------------------------------------
          // CREATE TRANSACTION
          // ------------------------------------------------------

          const transaction =
            await tx.transaction.create({
              data: {
                userId,
                coin: coin as never,
                type: "DEPOSIT",
                amount,
                fee: 0,
                fromAddress,
                toAddress:
                  bybitToAddress ||
                  mainWalletAddress,
                txHash: bybitTxHash,
                status: "COMPLETED",
              },
            });

          // ------------------------------------------------------
          // CREATE NOTIFICATION
          // ------------------------------------------------------

          const notification =
            await tx.notification.create({
              data: {
                userId,
                type: NotificationType.DEPOSIT,
                title: "Deposit received",
                message: `Your ${coin} deposit of ${amount} ${coin} has been confirmed and credited to your balance.`,
                actionUrl: "/deposit",
              },
            });

          return {
            balance,
            transaction,
            notification,
          };
        },
      );

    // ============================================================
    // RESPONSE
    // ============================================================

    return NextResponse.json(
      {
        success: true,
        message:
          "Deposit verified and credited successfully.",

        deposit: {
          coin,
          amount,

          txHash:
            result.transaction.txHash,

          transactionId:
            result.transaction.id,

          userId,

          balance:
            result.balance.balance,

          notificationId:
            result.notification.id,

          status:
            result.transaction.status,
        },
      },
      {
        status: 201,
      },
    );
  } catch (error) {
    // ============================================================
    // DUPLICATE
    // ============================================================

    if (
      error instanceof Error &&
      error.message ===
        "DEPOSIT_ALREADY_PROCESSED"
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "This transaction has already been processed.",
        },
        {
          status: 409,
        },
      );
    }

    // ============================================================
    // ERROR
    // ============================================================

    console.error(
      "POST /api/deposit/confirm error:",
      error,
    );

    return NextResponse.json(
      {
        success: false,
        message:
          "Unable to confirm deposit.",
      },
      {
        status: 500,
      },
    );
  }
}