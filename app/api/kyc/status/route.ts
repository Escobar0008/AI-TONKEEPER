import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
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

            orderBy: {
              createdAt: "asc",
            },
          },
        },
      });

    if (!application) {
      return NextResponse.json(
        {
          success: true,
          application: null,
        },
        { status: 200 }
      );
    }

    return NextResponse.json(
      {
        success: true,

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

          createdAt:
            application.createdAt,

          updatedAt:
            application.updatedAt,

          documents:
            application.documents,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error(
      "========== KYC STATUS ERROR =========="
    );

    console.error(error);

    console.error(
      "======================================="
    );

    return NextResponse.json(
      {
        success: false,
        message:
          "Impossible de récupérer le statut KYC.",
      },
      { status: 500 }
    );
  }
}