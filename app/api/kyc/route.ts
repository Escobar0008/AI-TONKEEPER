import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { KYCStatus } from "@prisma/client";

const documentSelect = {
  id: true,
  type: true,
  fileName: true,
  mimeType: true,
  fileSize: true,
  createdAt: true,
  updatedAt: true,
};

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
        include: {
          documents: {
            select: documentSelect,
            orderBy: {
              createdAt: "asc",
            },
          },
        },
      });

    return NextResponse.json({
      success: true,
      application,
    });
  } catch (error) {
    console.error("KYC GET ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        message:
          "Unable to retrieve KYC information.",
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
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
    // READ JSON
    // ============================================================

    let body: {
      fullName?: unknown;
      email?: unknown;
      phone?: unknown;
      birthDate?: unknown;
      country?: unknown;
    };

    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid JSON body.",
        },
        { status: 400 }
      );
    }

    // ============================================================
    // NORMALIZE VALUES
    // ============================================================

    const fullName =
      typeof body.fullName === "string"
        ? body.fullName.trim()
        : "";

    const email =
      typeof body.email === "string"
        ? body.email.trim().toLowerCase()
        : "";

    const phone =
      typeof body.phone === "string"
        ? body.phone.trim()
        : "";

    const birthDate =
      typeof body.birthDate === "string"
        ? body.birthDate.trim()
        : "";

    const country =
      typeof body.country === "string"
        ? body.country.trim()
        : "";

    // ============================================================
    // VALIDATION
    // ============================================================

    if (!fullName) {
      return NextResponse.json(
        {
          success: false,
          message: "Full name is required.",
        },
        { status: 400 }
      );
    }

    if (!email) {
      return NextResponse.json(
        {
          success: false,
          message: "Email address is required.",
        },
        { status: 400 }
      );
    }

    if (!email.includes("@")) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid email address.",
        },
        { status: 400 }
      );
    }

    if (!phone) {
      return NextResponse.json(
        {
          success: false,
          message: "Phone number is required.",
        },
        { status: 400 }
      );
    }

    if (!birthDate) {
      return NextResponse.json(
        {
          success: false,
          message: "Date of birth is required.",
        },
        { status: 400 }
      );
    }

    if (!country) {
      return NextResponse.json(
        {
          success: false,
          message: "Country is required.",
        },
        { status: 400 }
      );
    }

    const parsedBirthDate = new Date(birthDate);

    if (Number.isNaN(parsedBirthDate.getTime())) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid date of birth.",
        },
        { status: 400 }
      );
    }

    // ============================================================
    // FIND EXISTING APPLICATION
    // ============================================================

    const existingApplication =
      await prisma.kYCApplication.findUnique({
        where: {
          userId,
        },
      });

    // ============================================================
    // ALREADY PROCESSING
    // ============================================================

    if (
      existingApplication &&
      (
        existingApplication.status ===
          KYCStatus.PENDING ||
        existingApplication.status ===
          KYCStatus.UNDER_REVIEW
      )
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Your KYC application is already being processed.",
        },
        { status: 409 }
      );
    }

    // ============================================================
    // ALREADY VERIFIED
    // ============================================================

    if (
      existingApplication &&
      existingApplication.status ===
        KYCStatus.VERIFIED
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Your identity has already been verified.",
        },
        { status: 409 }
      );
    }

    // ============================================================
    // UPDATE EXISTING APPLICATION
    // ============================================================

    if (existingApplication) {
      const application =
        await prisma.kYCApplication.update({
          where: {
            userId,
          },
          data: {
            fullName,
            email,
            phone,
            birthDate: parsedBirthDate,
            country,
            status: KYCStatus.PENDING,
            rejectionReason: null,
            reviewedAt: null,
            reviewedBy: null,
          },
          include: {
            documents: {
              select: documentSelect,
              orderBy: {
                createdAt: "asc",
              },
            },
          },
        });

      return NextResponse.json(
        {
          success: true,
          message:
            "KYC information saved successfully.",
          application,
        },
        { status: 200 }
      );
    }

    // ============================================================
    // CREATE NEW APPLICATION
    // ============================================================

    const application =
      await prisma.kYCApplication.create({
        data: {
          userId,
          fullName,
          email,
          phone,
          birthDate: parsedBirthDate,
          country,
          status: KYCStatus.PENDING,
        },
        include: {
          documents: {
            select: documentSelect,
            orderBy: {
              createdAt: "asc",
            },
          },
        },
      });

    return NextResponse.json(
      {
        success: true,
        message:
          "KYC information saved successfully.",
        application,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("KYC POST ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        message:
          "An error occurred while saving KYC information.",
      },
      { status: 500 }
    );
  }
}