import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/auth";
import { prisma } from "@/lib/prisma";
import { getResend } from "@/lib/resend";

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

async function requireAdmin() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return {
      success: false as const,
      status: 401,
      message: "Not authenticated.",
    };
  }

  const admin = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { role: true },
  });

  if (!admin || admin.role !== "ADMIN") {
    return {
      success: false as const,
      status: 403,
      message: "Administrator access required.",
    };
  }

  return { success: true as const };
}

export async function POST(request: Request) {
  try {
    const admin = await requireAdmin();

    if (!admin.success) {
      return NextResponse.json(
        { success: false, message: admin.message },
        { status: admin.status }
      );
    }

    const body = await request.json();
    const userId = body?.userId;

    if (typeof userId !== "string" || !userId.trim()) {
      return NextResponse.json(
        { success: false, message: "A valid user ID is required." },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        name: true,
        email: true,
      },
    });

    if (!user || !user.email) {
      return NextResponse.json(
        {
          success: false,
          message: "User not found or email unavailable.",
        },
        { status: 404 }
      );
    }

    const name = user.name || "AI TONKEEPER user";
    const safeName = escapeHtml(name);

    const resend = getResend();

    const result = await resend.emails.send({
      from: "AI TONKEEPER <security@ai-tonkeeper.xyz>",
      to: [user.email],
      subject: "AI TONKEEPER — Rewards Notification",

      text: `
Dear ${name},

We are pleased to inform you that your rewards information on AI-TONKEEPER is ready for review.

No additional deposit is required. You do not need to make any further payments to review your account.

To proceed:

1. Open your AI-TONKEEPER account.
2. Review your rewards information in your dashboard.
3. Follow the withdrawal instructions displayed in your account, if your rewards have been verified as eligible.
4. Contact the AI-TONKEEPER support team if you need assistance.

Any withdrawal is subject to account verification and confirmation of the eligible funds.

Important Security Notice: AI-TONKEEPER will never ask for your wallet recovery phrase, private keys, password, or an upfront deposit to release your rewards.

Thank you for being part of AI-TONKEEPER.

Best regards,
AI TONKEEPER Administration Team.
      `.trim(),

      html: `
        <div style="background:#050B18;padding:30px 15px;font-family:Arial,sans-serif;color:#ffffff;">
          <div style="max-width:560px;margin:auto;background:#101A2C;border:1px solid #263449;border-radius:18px;padding:28px;">

            <h1 style="margin-top:0;color:#ffffff;">
              AI TONKEEPER
            </h1>

            <h2 style="color:#22d3ee;">
              Rewards Notification
            </h2>

            <p style="color:#cbd5e1;">
              Dear ${safeName},
            </p>

            <p style="color:#cbd5e1;line-height:1.7;">
              We are pleased to inform you that your rewards information
              on AI-TONKEEPER is ready for review.
            </p>

            <p style="color:#cbd5e1;line-height:1.7;">
              No additional deposit is required. You do not need to make
              any further payments to review your account.
            </p>

            <h3 style="color:#22d3ee;">
              To proceed:
            </h3>

            <ol style="color:#cbd5e1;line-height:2;padding-left:22px;">
              <li>Open your AI-TONKEEPER account.</li>
              <li>Review your rewards information in your dashboard.</li>
              <li>Follow the withdrawal instructions displayed in your account, if your rewards have been verified as eligible.</li>
              <li>Contact the AI-TONKEEPER support team if you need assistance.</li>
            </ol>

            <p style="color:#cbd5e1;line-height:1.7;">
              Any withdrawal is subject to account verification and
              confirmation of the eligible funds.
            </p>

            <div style="background:#0B1220;border:1px solid #334155;border-radius:12px;padding:18px;margin:22px 0;">
              <h3 style="color:#fbbf24;margin-top:0;">
                Important Security Notice
              </h3>

              <p style="color:#fde68a;line-height:1.7;margin-bottom:0;">
                AI-TONKEEPER will never ask for your wallet recovery
                phrase, private keys, password, or an upfront deposit
                to release your rewards.
              </p>
            </div>

            <p style="color:#cbd5e1;line-height:1.7;">
              Thank you for being part of AI-TONKEEPER.
            </p>

            <p style="color:#cbd5e1;line-height:1.7;">
              Best regards,<br />
              AI TONKEEPER Administration Team.
            </p>

            <hr style="border:0;border-top:1px solid #334155;margin:25px 0;" />

            <p style="color:#64748b;font-size:12px;">
              AI TONKEEPER — Official Notification.
            </p>

          </div>
        </div>
      `,
    });

    if (result.error) {
      console.error("DEMO REWARDS RESEND ERROR:", result.error);

      return NextResponse.json(
        {
          success: false,
          message: "The email provider could not send the notification.",
        },
        { status: 502 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: "Rewards notification sent successfully.",
        email: user.email,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("DEMO REWARDS API ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Unable to send the rewards notification.",
      },
      { status: 500 }
    );
  }
}