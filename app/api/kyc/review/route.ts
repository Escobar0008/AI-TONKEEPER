import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { KYCStatus } from "@prisma/client";

const ADMIN_ROLE = "ADMIN";

const VALID_STATUSES = [
  KYCStatus.PENDING,
  KYCStatus.UNDER_REVIEW,
  KYCStatus.VERIFIED,
  KYCStatus.REJECTED,
] as const;

type ValidKYCStatus = (typeof VALID_STATUSES)[number];

function isValidKYCStatus(
  value: string
): value is ValidKYCStatus {
  return VALID_STATUSES.includes(
    value as ValidKYCStatus
  );
}

async function requireAdmin() {
  const session = await auth();

  if (!session?.user) {
    return {
      authorized: false as const,
      response: NextResponse.json(
        {
          success: false,
          message: "Non authentifié",
        },
        { status: 401 }
      ),
    };
  }

  const role = (session.user as { role?: string }).role;

  if (role !== ADMIN_ROLE) {
    return {
      authorized: false as const,
      response: NextResponse.json(
        {
          success: false,
          message: "Accès administrateur requis",
        },
        { status: 403 }
      ),
    };
  }

  return {
    authorized: true as const,
    session,
  };
}

/**
 * GET /api/kyc/review
 *
 * Récupère une demande KYC précise pour sa revue
 * administrative.
 *
 * Exemple :
 * /api/kyc/review?id=KYC_ID
 */
export async function GET(request: NextRequest) {
  try {
    const admin = await requireAdmin();

    if (!admin.authorized) {
      return admin.response;
    }

    const { searchParams } = new URL(request.url);

    const id = searchParams.get("id")?.trim() ?? "";

    if (!id) {
      return NextResponse.json(
        {
          success: false,
          message: "L'identifiant KYC est obligatoire",
        },
        { status: 400 }
      );
    }

    const application =
      await prisma.kYCApplication.findUnique({
        where: {
          id,
        },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              createdAt: true,
            },
          },
        },
      });

    if (!application) {
      return NextResponse.json(
        {
          success: false,
          message: "Demande KYC introuvable",
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      application,
    });
  } catch (error) {
    console.error("KYC REVIEW GET ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        message:
          "Erreur lors de la récupération de la demande KYC",
      },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/kyc/review
 *
 * Change le statut d'une demande KYC.
 *
 * Exemple :
 *
 * {
 *   "id": "KYC_ID",
 *   "status": "UNDER_REVIEW"
 * }
 *
 * ou :
 *
 * {
 *   "id": "KYC_ID",
 *   "status": "VERIFIED"
 * }
 *
 * ou :
 *
 * {
 *   "id": "KYC_ID",
 *   "status": "REJECTED",
 *   "rejectionReason": "Document invalide"
 * }
 */
export async function PATCH(request: NextRequest) {
  try {
    const admin = await requireAdmin();

    if (!admin.authorized) {
      return admin.response;
    }

    let body: {
      id?: unknown;
      status?: unknown;
      rejectionReason?: unknown;
    };

    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        {
          success: false,
          message: "Corps JSON invalide",
        },
        { status: 400 }
      );
    }

    const id =
      typeof body.id === "string"
        ? body.id.trim()
        : "";

    const status =
      typeof body.status === "string"
        ? body.status.trim().toUpperCase()
        : "";

    const rejectionReason =
      typeof body.rejectionReason === "string"
        ? body.rejectionReason.trim()
        : "";

    if (!id) {
      return NextResponse.json(
        {
          success: false,
          message: "L'identifiant KYC est obligatoire",
        },
        { status: 400 }
      );
    }

    if (!status || !isValidKYCStatus(status)) {
      return NextResponse.json(
        {
          success: false,
          message: "Statut KYC invalide",
          validStatuses: VALID_STATUSES,
        },
        { status: 400 }
      );
    }

    if (
      status === KYCStatus.REJECTED &&
      !rejectionReason
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Une raison est obligatoire pour rejeter un KYC",
        },
        { status: 400 }
      );
    }

    const existingApplication =
      await prisma.kYCApplication.findUnique({
        where: {
          id,
        },
      });

    if (!existingApplication) {
      return NextResponse.json(
        {
          success: false,
          message: "Demande KYC introuvable",
        },
        { status: 404 }
      );
    }

    const sessionUser = admin.session.user as {
      id?: string;
      email?: string;
    };

    const reviewedBy =
      sessionUser.id ||
      sessionUser.email ||
      ADMIN_ROLE;

    const application =
      await prisma.kYCApplication.update({
        where: {
          id,
        },
        data: {
          status,

          rejectionReason:
            status === KYCStatus.REJECTED
              ? rejectionReason
              : null,

          reviewedAt: new Date(),
          reviewedBy,
        },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              createdAt: true,
            },
          },
        },
      });

    return NextResponse.json({
      success: true,
      message:
        status === KYCStatus.VERIFIED
          ? "KYC vérifié avec succès"
          : status === KYCStatus.REJECTED
            ? "KYC rejeté avec succès"
            : status === KYCStatus.UNDER_REVIEW
              ? "KYC placé en cours de vérification"
              : "Statut KYC mis à jour avec succès",
      application,
    });
  } catch (error) {
    console.error("KYC REVIEW PATCH ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        message:
          "Erreur lors de la modification de la demande KYC",
      },
      { status: 500 }
    );
  }
}