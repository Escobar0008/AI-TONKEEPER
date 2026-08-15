import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { KYCFileType } from "@prisma/client";

const MAX_FILE_SIZE = 10 * 1024 * 1024;

const ALLOWED_DOCUMENT_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "application/pdf",
] as const;

const ALLOWED_SELFIE_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
] as const;

const DOCUMENT_TYPES = [
  "id",
  "selfie",
  "address",
] as const;

type DocumentType =
  (typeof DOCUMENT_TYPES)[number];

function isDocumentType(
  value: string
): value is DocumentType {
  return DOCUMENT_TYPES.includes(
    value as DocumentType
  );
}

function getKYCFileType(
  type: DocumentType
): KYCFileType {
  switch (type) {
    case "id":
      return KYCFileType.ID_DOCUMENT;

    case "selfie":
      return KYCFileType.SELFIE;

    case "address":
      return KYCFileType.ADDRESS_PROOF;
  }
}

function isAllowedFileType(
  type: DocumentType,
  mimeType: string
): boolean {
  if (type === "selfie") {
    return ALLOWED_SELFIE_TYPES.includes(
      mimeType as (typeof ALLOWED_SELFIE_TYPES)[number]
    );
  }

  return ALLOWED_DOCUMENT_TYPES.includes(
    mimeType as (typeof ALLOWED_DOCUMENT_TYPES)[number]
  );
}

export async function POST(
  request: NextRequest
) {
  try {
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
      session.user as { id?: unknown }
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

    const formData =
      await request.formData();

    const typeValue =
      formData.get("type");

    const file =
      formData.get("file");

    if (
      typeof typeValue !== "string"
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Le type de document est obligatoire.",
        },
        { status: 400 }
      );
    }

    if (
      !isDocumentType(typeValue)
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Type de document invalide.",
          validTypes:
            DOCUMENT_TYPES,
        },
        { status: 400 }
      );
    }

    if (!(file instanceof File)) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Aucun fichier fourni.",
        },
        { status: 400 }
      );
    }

    if (file.size <= 0) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Le fichier est vide.",
        },
        { status: 400 }
      );
    }

    if (
      file.size > MAX_FILE_SIZE
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Le fichier est trop volumineux. Taille maximale : 10 MB.",
        },
        { status: 400 }
      );
    }

    if (
      !isAllowedFileType(
        typeValue,
        file.type
      )
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            typeValue === "selfie"
              ? "Le selfie doit être au format JPG, PNG ou WEBP."
              : "Le document doit être au format JPG, PNG, WEBP ou PDF.",
        },
        { status: 400 }
      );
    }

    const originalName =
      file.name.trim();

    if (!originalName) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Nom de fichier invalide.",
        },
        { status: 400 }
      );
    }

    const application =
      await prisma.kYCApplication.findUnique(
        {
          where: {
            userId,
          },
        }
      );

    if (!application) {
      return NextResponse.json(
        {
          success: false,
          message:
            "KYC application not found. Please save your personal information first.",
        },
        { status: 404 }
      );
    }

    if (
      application.status ===
      "VERIFIED"
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

    if (
      application.status ===
      "UNDER_REVIEW"
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

    const arrayBuffer =
      await file.arrayBuffer();

    const fileData =
      Buffer.from(arrayBuffer);

    const documentType =
      getKYCFileType(
        typeValue
      );

    const document =
      await prisma.kYCDocument.upsert(
        {
          where: {
            applicationId_type: {
              applicationId:
                application.id,
              type: documentType,
            },
          },

          update: {
            fileName:
              originalName,
            mimeType:
              file.type,
            fileSize:
              file.size,
            fileData,
          },

          create: {
            applicationId:
              application.id,
            type:
              documentType,
            fileName:
              originalName,
            mimeType:
              file.type,
            fileSize:
              file.size,
            fileData,
          },

          select: {
            id: true,
            type: true,
            fileName: true,
            mimeType: true,
            fileSize: true,
            createdAt: true,
            updatedAt: true,
          },
        }
      );

    return NextResponse.json(
      {
        success: true,
        message:
          "Document KYC enregistré avec succès.",
        document,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error(
      "========== KYC UPLOAD ERROR =========="
    );

    console.error(error);

    console.error(
      "======================================"
    );

    return NextResponse.json(
      {
        success: false,
        message:
          "Une erreur serveur est survenue pendant l'enregistrement du document KYC.",
      },
      { status: 500 }
    );
  }
}