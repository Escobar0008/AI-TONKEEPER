import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import {
  KYCStatus,
  KYCFileType,
} from "@prisma/client";

export async function POST() {
  try {
    // ==========================================================
    // AUTHENTICATION
    // ==========================================================

    const session = await auth();

    if (!session?.user) {
      return NextResponse.json(
        {
          success: false,
          message: "Non authentifié.",
        },
        { status: 401 }
      );
    }

    const userId = (
      session.user as {
        id?: unknown;
      }
    ).id;

    if (
      typeof userId !== "string" ||
      !userId
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Impossible d'identifier le compte utilisateur.",
        },
        { status: 401 }
      );
    }

    // ==========================================================
    // FIND APPLICATION
    // ==========================================================

    const application =
      await prisma.kYCApplication.findUnique({
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
          },
        },
      });

    if (!application) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Demande KYC introuvable. Veuillez d'abord compléter vos informations personnelles.",
        },
        { status: 404 }
      );
    }

    // ==========================================================
    // ALREADY VERIFIED
    // ==========================================================

    if (
      application.status ===
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

    // ==========================================================
    // ALREADY UNDER REVIEW
    // ==========================================================

    if (
      application.status ===
      KYCStatus.UNDER_REVIEW
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Votre demande KYC est déjà en cours de vérification.",
          application,
        },
        { status: 409 }
      );
    }

    // ==========================================================
    // PERSONAL INFORMATION
    // ==========================================================

    if (
      !application.fullName?.trim() ||
      !application.email?.trim() ||
      !application.phone?.trim() ||
      !application.birthDate ||
      !application.country?.trim()
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Toutes les informations personnelles sont obligatoires avant la soumission.",
        },
        { status: 400 }
      );
    }

    // ==========================================================
    // REQUIRED DOCUMENTS
    // ==========================================================

    const requiredTypes: KYCFileType[] = [
      KYCFileType.ID_DOCUMENT,
      KYCFileType.SELFIE,
      KYCFileType.ADDRESS_PROOF,
    ];

    const uploadedTypes =
      application.documents.map(
        (document) => document.type
      );

    const missingTypes =
      requiredTypes.filter(
        (type) =>
          !uploadedTypes.includes(type)
      );

    if (
      missingTypes.length > 0
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Veuillez téléverser les trois documents KYC obligatoires avant de soumettre votre demande.",
          missingDocuments:
            missingTypes,
        },
        { status: 400 }
      );
    }

    // ==========================================================
    // SUBMIT APPLICATION
    // ==========================================================

    const updatedApplication =
      await prisma.kYCApplication.update({
        where: {
          id: application.id,
        },

        data: {
          status:
            KYCStatus.UNDER_REVIEW,

          rejectionReason: null,

          reviewedAt: null,

          reviewedBy: null,
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
          },
        },
      });

    // ==========================================================
    // RESPONSE
    // ==========================================================

    return NextResponse.json(
      {
        success: true,
        message:
          "Votre demande KYC a été soumise avec succès et est maintenant en cours de vérification.",

        application:
          updatedApplication,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error(
      "========== KYC SUBMIT ERROR =========="
    );

    console.error(error);

    console.error(
      "======================================"
    );

    return NextResponse.json(
      {
        success: false,
        message:
          "Une erreur est survenue lors de la soumission de votre demande KYC.",
      },
      { status: 500 }
    );
  }
}