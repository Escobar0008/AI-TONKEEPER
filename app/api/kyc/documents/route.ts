import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { KYCFileType, KYCStatus } from "@prisma/client";

const MAX_FILE_SIZE = 10 * 1024 * 1024;

const IMAGE_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
];

const DOCUMENT_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "application/pdf",
];

function getFileType(value: string): KYCFileType | null {
  switch (value) {
    case "ID_DOCUMENT":
      return KYCFileType.ID_DOCUMENT;

    case "SELFIE":
      return KYCFileType.SELFIE;

    case "ADDRESS_PROOF":
      return KYCFileType.ADDRESS_PROOF;

    default:
      return null;
  }
}

function validateFile(
  file: File,
  type: KYCFileType
): string | null {
  if (file.size <= 0) {
    return "The uploaded file is empty.";
  }

  if (file.size > MAX_FILE_SIZE) {
    return "File is too large. Maximum size is 10 MB.";
  }

  if (type === KYCFileType.SELFIE) {
    if (!IMAGE_TYPES.includes(file.type)) {
      return "Selfie must be JPG, PNG or WEBP.";
    }

    return null;
  }

  if (!DOCUMENT_TYPES.includes(file.type)) {
    return "Document must be JPG, PNG, WEBP or PDF.";
  }

  return null;
}

/**
 * GET /api/kyc/documents
 *
 * Returns KYC document metadata.
 *
 * IMPORTANT:
 * fileData is never returned by this endpoint.
 */
export async function GET() {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json(
        {
          success: false,
          message: "Not authenticated.",
        },
        { status: 401 }
      );
    }

    const userId = (session.user as { id?: string }).id;

    if (!userId) {
      return NextResponse.json(
        {
          success: false,
          message: "User ID not found.",
        },
        { status: 401 }
      );
    }

    const application =
      await prisma.kYCApplication.findUnique({
        where: {
          userId,
        },
      });

    if (!application) {
      return NextResponse.json(
        {
          success: false,
          message: "KYC application not found.",
        },
        { status: 404 }
      );
    }

    const documents =
      await prisma.kYCDocument.findMany({
        where: {
          applicationId: application.id,
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
        orderBy: {
          createdAt: "asc",
        },
      });

    return NextResponse.json({
      success: true,
      documents,
    });
  } catch (error) {
    console.error("KYC DOCUMENTS GET ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Unable to retrieve documents.",
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/kyc/documents
 *
 * Uploads or replaces one KYC document.
 *
 * multipart/form-data:
 *
 * type = ID_DOCUMENT | SELFIE | ADDRESS_PROOF
 * file = uploaded file
 */
export async function POST(
  request: NextRequest
) {
  try {
    // ============================================================
    // AUTHENTICATION
    // ============================================================

    const session = await auth();

    if (!session?.user) {
      return NextResponse.json(
        {
          success: false,
          message: "Not authenticated.",
        },
        { status: 401 }
      );
    }

    const userId = (session.user as { id?: string }).id;

    if (!userId) {
      return NextResponse.json(
        {
          success: false,
          message: "User ID not found.",
        },
        { status: 401 }
      );
    }

    // ============================================================
    // FIND KYC APPLICATION
    // ============================================================

    const application =
      await prisma.kYCApplication.findUnique({
        where: {
          userId,
        },
      });

    if (!application) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Please create your KYC application first.",
        },
        { status: 404 }
      );
    }

    // ============================================================
    // KYC STATUS CHECK
    // ============================================================

    if (application.status === KYCStatus.VERIFIED) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Your identity has already been verified.",
        },
        { status: 409 }
      );
    }

    if (
      application.status === KYCStatus.UNDER_REVIEW
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Your KYC application is already under review.",
        },
        { status: 409 }
      );
    }

    // ============================================================
    // READ MULTIPART FORM DATA
    // ============================================================

    let formData: FormData;

    try {
      formData = await request.formData();
    } catch (error) {
      console.error(
        "KYC DOCUMENT FORM DATA ERROR:",
        error
      );

      return NextResponse.json(
        {
          success: false,
          message: "Invalid multipart form data.",
        },
        { status: 400 }
      );
    }

    const typeValue = formData.get("type");
    const fileValue = formData.get("file");

    // ============================================================
    // VALIDATE DOCUMENT TYPE
    // ============================================================

    if (typeof typeValue !== "string") {
      return NextResponse.json(
        {
          success: false,
          message: "Document type is required.",
        },
        { status: 400 }
      );
    }

    const documentType = getFileType(typeValue);

    if (!documentType) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid document type.",
        },
        { status: 400 }
      );
    }

    // ============================================================
    // VALIDATE FILE
    // ============================================================

    if (!(fileValue instanceof File)) {
      return NextResponse.json(
        {
          success: false,
          message: "Please upload a file.",
        },
        { status: 400 }
      );
    }

    const validationError = validateFile(
      fileValue,
      documentType
    );

    if (validationError) {
      return NextResponse.json(
        {
          success: false,
          message: validationError,
        },
        { status: 400 }
      );
    }

    // ============================================================
    // CONVERT FILE TO BINARY DATA
    // ============================================================

    const fileBuffer = Buffer.from(
      await fileValue.arrayBuffer()
    );

    // ============================================================
    // SAVE DOCUMENT IN SQL DATABASE
    // ============================================================

    const document =
      await prisma.kYCDocument.upsert({
        where: {
          applicationId_type: {
            applicationId: application.id,
            type: documentType,
          },
        },

        update: {
          fileName: fileValue.name,
          mimeType: fileValue.type,
          fileSize: fileValue.size,
          fileData: fileBuffer,
        },

        create: {
          applicationId: application.id,
          type: documentType,
          fileName: fileValue.name,
          mimeType: fileValue.type,
          fileSize: fileValue.size,
          fileData: fileBuffer,
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
      });

    // ============================================================
    // RESPONSE
    // ============================================================

    return NextResponse.json({
      success: true,
      message: "Document uploaded successfully.",
      document,
    });
  } catch (error) {
    console.error(
      "KYC DOCUMENT UPLOAD ERROR:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        message:
          "An error occurred while uploading the document.",
      },
      { status: 500 }
    );
  }
}