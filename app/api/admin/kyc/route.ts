import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/auth";
import { prisma } from "@/lib/prisma";
import type { KYCStatus } from "@prisma/client";
/*
|--------------------------------------------------------------------------
| ADMIN SESSION
|--------------------------------------------------------------------------
*/
async function getAdminSession() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return null;
  }
  return session;
}
/*
|--------------------------------------------------------------------------
| REQUIRE ADMIN
|--------------------------------------------------------------------------
*/
async function requireAdmin() {
  const session = await getAdminSession();
  if (!session?.user?.id) {
    return {
      success: false as const,
      status: 401,
      message: "Not authenticated.",
    };
  }
  const user = await prisma.user.findUnique({
    where: {
      id: session.user.id,
    },
  });
  if (!user) {
    return {
      success: false as const,
      status: 401,
      message: "User account not found.",
    };
  }
  /*
  |--------------------------------------------------------------------------
  | ADMIN CHECK
  |--------------------------------------------------------------------------
  |
  | Your Prisma schema uses:
  |
  | enum Role {
  |   USER
  |   ADMIN
  | }
  |
  */
  if (user.role !== "ADMIN") {
    return {
      success: false as const,
      status: 403,
      message: "Administrator access required.",
    };
  }
  return {
    success: true as const,
    status: 200,
    session,
    user,
  };
}
/*
|--------------------------------------------------------------------------
| DOCUMENT SELECT
|--------------------------------------------------------------------------
|
| IMPORTANT:
|
| KYCDocument.fileData is stored as Bytes in PostgreSQL.
|
| We do NOT return fileData in the normal application list.
| This avoids sending potentially large binary documents every
| time the admin loads the KYC dashboard.
|
|--------------------------------------------------------------------------
*/
const documentMetadataSelect = {
  id: true,
  applicationId: true,
  type: true,
  fileName: true,
  mimeType: true,
  fileSize: true,
  createdAt: true,
  updatedAt: true,
} as const;
/*
|--------------------------------------------------------------------------
| GET
|--------------------------------------------------------------------------
|
| GET /api/admin/kyc
|
| GET /api/admin/kyc?applicationId=xxxxx
|
|--------------------------------------------------------------------------
*/
export async function GET(request: NextRequest) {
  try {
    const admin = await requireAdmin();
    if (!admin.success) {
      return NextResponse.json(
        {
          success: false,
          message: admin.message,
        },
        {
          status: admin.status,
        }
      );
    }
    const { searchParams } = new URL(request.url);
    const applicationId =
      searchParams.get("applicationId")?.trim() || "";
    /*
    |--------------------------------------------------------------------------
    | SINGLE APPLICATION
    |--------------------------------------------------------------------------
    */
    if (applicationId) {
      const application =
        await prisma.kYCApplication.findUnique({
          where: {
            id: applicationId,
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
            documents: {
              select: documentMetadataSelect,
              orderBy: {
                createdAt: "asc",
              },
            },
          },
        });
      if (!application) {
        return NextResponse.json(
          {
            success: false,
            message: "KYC application not found.",
          },
          {
            status: 404,
          }
        );
      }
      return NextResponse.json(
        {
          success: true,
          application,
        },
        {
          status: 200,
        }
      );
    }
    /*
    |--------------------------------------------------------------------------
    | ALL APPLICATIONS
    |--------------------------------------------------------------------------
    */
    const applications =
      await prisma.kYCApplication.findMany({
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              createdAt: true,
            },
          },
          documents: {
            select: documentMetadataSelect,
            orderBy: {
              createdAt: "asc",
            },
          },
        },
        orderBy: {
          createdAt: "desc",
        },
      });
    return NextResponse.json(
      {
        success: true,
        applications,
      },
      {
        status: 200,
      }
    );
  } catch (error) {
    console.error("ADMIN KYC GET ERROR:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Unable to retrieve KYC applications.",
      },
      {
        status: 500,
      }
    );
  }
}
/*
|--------------------------------------------------------------------------
| PATCH
|--------------------------------------------------------------------------
|
| Update KYC application status.
|
| PATCH /api/admin/kyc
|
| Body:
|
| {
|   "id": "...",
|   "status": "UNDER_REVIEW"
| }
|
| OR:
|
| {
|   "id": "...",
|   "status": "VERIFIED"
| }
|
| OR:
|
| {
|   "id": "...",
|   "status": "REJECTED",
|   "rejectionReason": "..."
| }
|
|--------------------------------------------------------------------------
*/
export async function PATCH(request: NextRequest) {
  try {
    const admin = await requireAdmin();
    if (!admin.success) {
      return NextResponse.json(
        {
          success: false,
          message: admin.message,
        },
        {
          status: admin.status,
        }
      );
    }
    /*
    |--------------------------------------------------------------------------
    | READ BODY
    |--------------------------------------------------------------------------
    */
    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid JSON body.",
        },
        {
          status: 400,
        }
      );
    }
    if (
      typeof body !== "object" ||
      body === null
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid request body.",
        },
        {
          status: 400,
        }
      );
    }
    const requestBody = body as {
      id?: unknown;
      status?: unknown;
      rejectionReason?: unknown;
    };
    /*
    |--------------------------------------------------------------------------
    | ID
    |--------------------------------------------------------------------------
    */
    const id =
      typeof requestBody.id === "string"
        ? requestBody.id.trim()
        : "";
    if (!id) {
      return NextResponse.json(
        {
          success: false,
          message: "KYC application ID is required.",
        },
        {
          status: 400,
        }
      );
    }
    /*
    |--------------------------------------------------------------------------
    | STATUS
    |--------------------------------------------------------------------------
    */
    const status =
      typeof requestBody.status === "string"
        ? requestBody.status.trim().toUpperCase()
        : "";
    const validStatuses: KYCStatus[] = [
      "PENDING",
      "UNDER_REVIEW",
      "VERIFIED",
      "REJECTED",
    ];
    if (
      !validStatuses.includes(
        status as KYCStatus
      )
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid KYC status.",
        },
        {
          status: 400,
        }
      );
    }
    /*
    |--------------------------------------------------------------------------
    | REJECTION REASON
    |--------------------------------------------------------------------------
    */
    const rejectionReason =
      typeof requestBody.rejectionReason === "string"
        ? requestBody.rejectionReason.trim()
        : "";
    if (
      status === "REJECTED" &&
      !rejectionReason
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "A rejection reason is required.",
        },
        {
          status: 400,
        }
      );
    }
    /*
    |--------------------------------------------------------------------------
    | FIND APPLICATION
    |--------------------------------------------------------------------------
    */
    const existingApplication =
      await prisma.kYCApplication.findUnique({
        where: {
          id,
        },
        select: {
          id: true,
          status: true,
        },
      });
    if (!existingApplication) {
      return NextResponse.json(
        {
          success: false,
          message: "KYC application not found.",
        },
        {
          status: 404,
        }
      );
    }
    /*
    |--------------------------------------------------------------------------
    | UPDATE
    |--------------------------------------------------------------------------
    */
    const updatedApplication =
      await prisma.kYCApplication.update({
        where: {
          id,
        },
        data: {
          status: status as KYCStatus,
          rejectionReason:
            status === "REJECTED"
              ? rejectionReason
              : null,
          reviewedAt: new Date(),
          reviewedBy:
            admin.session.user.id,
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
          documents: {
            select: documentMetadataSelect,
            orderBy: {
              createdAt: "asc",
            },
          },
        },
      });
    /*
    |--------------------------------------------------------------------------
    | SUCCESS
    |--------------------------------------------------------------------------
    */
    return NextResponse.json(
      {
        success: true,
        message: "KYC application updated successfully.",
        application: updatedApplication,
      },
      {
        status: 200,
      }
    );
  } catch (error) {
    console.error("ADMIN KYC PATCH ERROR:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Unable to update KYC application.",
      },
      {
        status: 500,
      }
    );
  }
}