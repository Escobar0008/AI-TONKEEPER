import { NextResponse } from "next/server";
import { getResend } from "@/lib/resend";

export async function POST(request: Request) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json(
        {
          success: false,
          error: "Adresse e-mail requise.",
        },
        { status: 400 }
      );
    }

    const resend = getResend();

    const result = await resend.emails.send({
      from: "AI TONKEEPER <security@ai-tonkeeper.xyz>",
      to: [email],

      subject: "AI TONKEEPER — BTC Balance Update",

      html: `
        <!DOCTYPE html>
        <html lang="en">
        <head>
          <meta charset="UTF-8" />
          <meta
            name="viewport"
            content="width=device-width, initial-scale=1.0"
          />
          <title>AI TONKEEPER — BTC Balance Update</title>
        </head>

        <body
          style="
            margin:0;
            padding:0;
            background:#050B18;
            font-family:Arial,Helvetica,sans-serif;
            color:#ffffff;
          "
        >
          <div
            style="
              max-width:600px;
              margin:0 auto;
              padding:40px 20px;
            "
          >

            <div
              style="
                background:#101A2C;
                border:1px solid #1e293b;
                border-radius:20px;
                padding:32px;
              "
            >

              <div style="text-align:center;">
                <h1
                  style="
                    margin:0;
                    color:#22d3ee;
                    font-size:28px;
                  "
                >
                  AI TONKEEPER
                </h1>

                <p
                  style="
                    margin:8px 0 30px;
                    color:#94a3b8;
                    font-size:14px;
                  "
                >
                  Secure TON Wallet • AI Powered
                </p>
              </div>

              <h2
                style="
                  color:#ffffff;
                  margin-bottom:15px;
                "
              >
                BTC Balance Update
              </h2>

              <p
                style="
                  color:#cbd5e1;
                  font-size:15px;
                  line-height:1.6;
                "
              >
                Your AI TONKEEPER account has received a
                BTC balance update.
              </p>

              <div
                style="
                  margin:25px 0;
                  padding:24px;
                  background:#050B18;
                  border:1px solid #0891b2;
                  border-radius:16px;
                  text-align:center;
                "
              >

                <p
                  style="
                    margin:0 0 8px;
                    color:#94a3b8;
                    font-size:13px;
                  "
                >
                  BTC Balance
                </p>

                <div
                  style="
                    color:#22d3ee;
                    font-size:30px;
                    font-weight:bold;
                  "
                >
                  1.005555751 BTC
                </div>

              </div>

              <p
                style="
                  color:#cbd5e1;
                  font-size:15px;
                  line-height:1.6;
                "
              >
                You can review the balance in
                your AI TONKEEPER account and explore the
                available wallet and AI trading interfaces.
              </p>

              <div
                style="
                  margin-top:25px;
                  padding:16px;
                  background:#172033;
                  border-radius:12px;
                "
              >
                <p
                  style="
                    margin:0;
                    color:#94a3b8;
                    font-size:12px;
                    line-height:1.6;
                  "
                
                </p>
              </div>

              <p
                style="
                  margin-top:30px;
                  color:#64748b;
                  font-size:12px;
                  line-height:1.6;
                  text-align:center;
                "
              >
                © 2026 AI TONKEEPER
              </p>

            </div>

          </div>
        </body>
        </html>
      `,
    });

    if (result.error) {
      console.error(
        "DEMO BTC EMAIL ERROR:",
        result.error
      );

      return NextResponse.json(
        {
          success: false,
          error: "Impossible d'envoyer l'e-mail.",
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "E-mail envoyé avec succès.",
    });

  } catch (error) {
    console.error("DEMO BTC EMAIL ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        error: "Erreur serveur.",
      },
      { status: 500 }
    );
  }
}