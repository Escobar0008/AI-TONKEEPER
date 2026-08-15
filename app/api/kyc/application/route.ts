import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import {
  KYCStatus,
  KYCFileType,
} from "@prisma/client";

// ============================================================
// POST
// Enregistrer / resoumettre une demande KYC
// ============================================================

export async function POST(
  request: NextRequest
) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        {
          success: false,
          message: "Non authentifié.",
        },
        { status: 401 }
      );
    }

    const userId = String(
      session.user.id
    );

    let body: {
      fullName?: unknown;
      email?: unknown;
      phone?: unknown;
      birthDate?: unknown;
      country?: unknown;
    };

    try {
      body =
        await request.json();
    } catch {
      return NextResponse.json(
        {
          success: false,
          message:
            "Données JSON invalides.",
        },
        { status: 400 }
      );
    }

    const fullName =
      typeof body.fullName === "string"
        ? body.fullName.trim()
        : "";

    const email =
      typeof body.email === "string"
        ? body.email
            .trim()
            .toLowerCase()
        : "";

    const phone =
      typeof body.phone === "string"
        ? body.phone.trim()
        : "";

    const country =
      typeof body.country === "string"
        ? body.country.trim()
        : "";

    const birthDateValue =
      typeof body.birthDate ===
      "string"
        ? body.birthDate.trim()
        : "";

    // ========================================================
    // VALIDATION
    // ========================================================

    if (!fullName) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Le nom complet est obligatoire.",
        },
        { status: 400 }
      );
    }

    if (
      !email ||
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
        email
      )
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Adresse email invalide.",
        },
        { status: 400 }
      );
    }

    if (!phone) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Le numéro de téléphone est obligatoire.",
        },
        { status: 400 }
      );
    }

    if (!birthDateValue) {
      return NextResponse.json(
        {
          success: false,
          message:
            "La date de naissance est obligatoire.",
        },
        { status: 400 }
      );
    }

    const birthDate =
      new Date(birthDateValue);

    if (
      Number.isNaN(
        birthDate.getTime()
      )
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Date de naissance invalide.",
        },
        { status: 400 }
      );
    }

    if (!country) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Le pays est obligatoire.",
        },
        { status: 400 }
      );
    }

    // ========================================================
    // EXISTING APPLICATION
    // ========================================================

    const existing =
      await prisma.kYCApplication.findUnique(
        {
          where: {
            userId,
          },
        }
      );

    // ========================================================
    // VERIFIED
    // ========================================================

    if (
      existing?.status ===
      KYCStatus.VERIFIED
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Votre identité est déjà vérifiée.",
        },
        { status: 409 }
      );
    }

    // ========================================================
    // UNDER REVIEW
    // ========================================================

    if (
      existing?.status ===
      KYCStatus.UNDER_REVIEW
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Votre demande KYC est déjà en cours de vérification.",
        },
        { status: 409 }
      );
    }

    // ========================================================
    // CREATE / UPDATE
    // ========================================================

    const application =
      await prisma.kYCApplication.upsert(
        {
          where: {
            userId,
          },

          update: {
            fullName,
            email,
            phone,
            birthDate,
            country,

            status:
              KYCStatus.PENDING,

            rejectionReason:
              null,

            reviewedAt:
              null,

            reviewedBy:
              null,
          },

          create: {
            userId,
            fullName,
            email,
            phone,
            birthDate,
            country,

            status:
              KYCStatus.PENDING,
          },
        }
      );

    return NextResponse.json(
      {
        success: true,

        message:
          "Informations KYC enregistrées avec succès.",

        application: {
          id: application.id,
          fullName:
            application.fullName,
          email:
            application.email,
          phone:
            application.phone,
          birthDate:
            application.birthDate,
          country:
            application.country,
          status:
            application.status,
          rejectionReason:
            application.rejectionReason,
          reviewedAt:
            application.reviewedAt,
          reviewedBy:
            application.reviewedBy,
          createdAt:
            application.createdAt,
          updatedAt:
            application.updatedAt,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error(
      "========== KYC APPLICATION POST ERROR =========="
    );

    console.error(error);

    console.error(
      "================================================="
    );

    return NextResponse.json(
      {
        success: false,
        message:
          "Une erreur serveur est survenue pendant l'enregistrement de votre demande KYC.",
      },
      { status: 500 }
    );
  }
}

// ============================================================
// GET
//
// Utilisateur:
// GET /api/kyc/application
//
// Admin document:
// GET /api/kyc/application?applicationId=XXX&type=ID_DOCUMENT
// GET /api/kyc/application?applicationId=XXX&type=SELFIE
// GET /api/kyc/application?applicationId=XXX&type=ADDRESS_PROOF
// ============================================================

export async function GET(
  request: NextRequest
) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Non authentifié.",
        },
        { status: 401 }
      );
    }

    const userId = String(
      session.user.id
    );

    const { searchParams } =
      new URL(request.url);

    const applicationId =
      searchParams.get(
        "applicationId"
      );

    const documentType =
      searchParams.get("type");

    // ========================================================
    // ADMIN DOCUMENT ACCESS
    // ========================================================

    if (
      applicationId ||
      documentType
    ) {
      const role = (
        session.user as {
          role?: string;
        }
      ).role;

      if (role !== "ADMIN") {
        return NextResponse.json(
          {
            success: false,
            message:
              "Accès administrateur requis.",
          },
          { status: 403 }
        );
      }

      if (!applicationId) {
        return NextResponse.json(
          {
            success: false,
            message:
              "Identifiant de la demande KYC manquant.",
          },
          { status: 400 }
        );
      }

      const allowedTypes:
        KYCFileType[] = [
          KYCFileType.ID_DOCUMENT,
          KYCFileType.SELFIE,
          KYCFileType.ADDRESS_PROOF,
        ];

      if (
        !documentType ||
        !allowedTypes.includes(
          documentType as KYCFileType
        )
      ) {
        return NextResponse.json(
          {
            success: false,
            message:
              "Type de document KYC invalide.",
          },
          { status: 400 }
        );
      }

      const type =
        documentType as KYCFileType;

      // ------------------------------------------------------
      // VERIFY APPLICATION
      // ------------------------------------------------------

      const application =
        await prisma.kYCApplication.findUnique(
          {
            where: {
              id: applicationId,
            },

            select: {
              id: true,
            },
          }
        );

      if (!application) {
        return NextResponse.json(
          {
            success: false,
            message:
              "Demande KYC introuvable.",
          },
          { status: 404 }
        );
      }

      // ------------------------------------------------------
      // FIND DOCUMENT
      // ------------------------------------------------------

      const document =
        await prisma.kYCDocument.findUnique(
          {
            where: {
              applicationId_type: {
                applicationId,
                type,
              },
            },

            select: {
              id: true,
              fileName: true,
              mimeType: true,
              fileSize: true,
              fileData: true,
            },
          }
        );

      if (!document) {
        return NextResponse.json(
          {
            success: false,
            message:
              "Document KYC introuvable.",
          },
          { status: 404 }
        );
      }

      return new NextResponse(
        document.fileData,
        {
          status: 200,

          headers: {
            "Content-Type":
              document.mimeType ||
              "application/octet-stream",

            "Content-Disposition":
              `inline; filename="${encodeURIComponent(
                document.fileName
              )}"`,

            "Content-Length":
              String(
                document.fileSize
              ),

            "Cache-Control":
              "private, no-store, max-age=0",

            "X-Content-Type-Options":
              "nosniff",
          },
        }
      );
    }

    // ========================================================
    // NORMAL USER GET
    // ========================================================

    const application =
      await prisma.kYCApplication.findUnique(
        {
          where: {
            userId,
          },

          include: {
            documents: {
              select: {
                id: true,
                type: true,
                fileName: true,
                mimeType: true,
                fileSize: true,
                createdAt: true,
                updatedAt: true,
              },

              orderBy: {
                createdAt: "asc",
              },
            },
          },
        }
      );

    return NextResponse.json(
      {
        success: true,
        application,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error(
      "========== KYC APPLICATION GET ERROR =========="
    );

    console.error(error);

    console.error(
      "================================================"
    );

    return NextResponse.json(
      {
        success: false,
        message:
          "Une erreur est survenue lors de la récupération des informations KYC.",
      },
      { status: 500 }
    );
  }
}