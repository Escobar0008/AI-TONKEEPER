import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    // Vérification de la session
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json(
        {
          success: false,
          message: "Non authentifié",
        },
        { status: 401 }
      );
    }

    // Vérification du rôle ADMIN
    const role = (session.user as { role?: string }).role;

    if (role !== "ADMIN") {
      return NextResponse.json(
        {
          success: false,
          message: "Accès administrateur requis",
        },
        { status: 403 }
      );
    }

    // ID de la KYC Application
    const { id } = await context.params;

    if (!id) {
      return NextResponse.json(
        {
          success: false,
          message: "Identifiant KYC manquant",
        },
        { status: 400 }
      );
    }

    // Type demandé dans l'URL
    const typeParam = request.nextUrl.searchParams.get("type");

    if (
      typeParam !== "ID_DOCUMENT" &&
      typeParam !== "SELFIE" &&
      typeParam !== "ADDRESS_PROOF"
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "Type de document KYC invalide",
        },
        { status: 400 }
      );
    }

    // On cherche le document avec applicationId + type
    const document = await prisma.kYCDocument.findUnique({
      where: {
        applicationId_type: {
          applicationId: id,
          type: typeParam,
        },
      },
      select: {
        fileData: true,
        mimeType: true,
        fileName: true,
      },
    });

    if (!document) {
      return NextResponse.json(
        {
          success: false,
          message: "Document KYC introuvable",
        },
        { status: 404 }
      );
    }

    // Retourner directement le fichier
    return new NextResponse(document.fileData, {
      status: 200,
      headers: {
        "Content-Type":
          document.mimeType || "application/octet-stream",

        "Content-Disposition": `inline; filename="${encodeURIComponent(
          document.fileName
        )}"`,

        "Cache-Control": "private, no-store",
      },
    });
  } catch (error) {
    console.error(
      "ADMIN KYC DOCUMENT ERROR:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        message:
          "Erreur lors de l'affichage du document KYC",
      },
      { status: 500 }
    );
  }
}