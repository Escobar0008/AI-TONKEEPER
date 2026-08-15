import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

type ConversationMessage = {
  role: "user" | "assistant";
  content: string;
};

type AssistantRequest = {
  message?: string;
  conversation?: ConversationMessage[];
};

type AssistantResponse = {
  success: boolean;
  reply?: string;
  message?: string;
};

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const SYSTEM_PROMPT = `
You are AI TONKEEPER Assistant.

You are the intelligent assistant of the AI TONKEEPER crypto platform.

Your responsibilities:
- Help users understand crypto.
- Explain wallet concepts.
- Explain market concepts.
- Explain AI Trading information.
- Help users understand security.
- Explain staking concepts.
- Answer questions clearly and professionally.
- Speak in the same language as the user.
- Be concise but useful.

IMPORTANT SECURITY RULES:
- Never ask for a seed phrase.
- Never ask for a private key.
- Never ask for passwords.
- Never ask for authentication codes.
- Never request sensitive wallet credentials.
- Never invent balances, transactions, trades or wallet information.
- If real account information is not available, clearly say that it is not available.

IMPORTANT AI TRADING RULE:
AI Trading is handled by a separate dedicated trading engine.

The Assistant may:
- Explain AI Trading.
- Explain trading concepts.
- Explain market information.
- Help the user understand available AI Trading information.

The Assistant must NOT:
- Modify the AI Trading engine.
- Modify trading strategies.
- Execute trades.
- Cancel trades.
- Change trading configuration.
- Directly manipulate trading positions.
- Pretend that a trade was executed.

The AI Trading engine remains completely independent from this Assistant.

When the user asks for real account information that has not been provided to you, do not invent it.

You are an assistant, not a financial advisor. Avoid presenting uncertain predictions as guaranteed outcomes.
`;

export async function POST(
  request: NextRequest
): Promise<NextResponse<AssistantResponse>> {
  try {
    /*
     * ----------------------------------------------------------
     * CHECK API KEY
     * ----------------------------------------------------------
     */

    if (!process.env.OPENAI_API_KEY) {
      console.error(
        "OPENAI_API_KEY is not configured."
      );

      return NextResponse.json(
        {
          success: false,
          message:
            "AI Assistant is not configured yet. Please configure OPENAI_API_KEY.",
        },
        { status: 500 }
      );
    }

    /*
     * ----------------------------------------------------------
     * READ REQUEST
     * ----------------------------------------------------------
     */

    const body =
      (await request.json()) as AssistantRequest;

    const message =
      typeof body.message === "string"
        ? body.message.trim()
        : "";

    if (!message) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Please enter a message.",
        },
        { status: 400 }
      );
    }

    /*
     * ----------------------------------------------------------
     * SANITIZE CONVERSATION
     * ----------------------------------------------------------
     */

    const conversation: ConversationMessage[] =
      Array.isArray(body.conversation)
        ? body.conversation
            .filter(
              (item) =>
                item &&
                (item.role === "user" ||
                  item.role === "assistant") &&
                typeof item.content ===
                  "string" &&
                item.content.trim().length > 0
            )
            .slice(-20)
            .map((item) => ({
              role: item.role,
              content: item.content
                .trim()
                .slice(0, 8000),
            }))
        : [];

    /*
     * ----------------------------------------------------------
     * BUILD MESSAGES
     * ----------------------------------------------------------
     */

    const inputMessages = [
      ...conversation,
      {
        role: "user" as const,
        content: message,
      },
    ];

    /*
     * ----------------------------------------------------------
     * OPENAI
     * ----------------------------------------------------------
     *
     * The Assistant only communicates with the AI provider.
     *
     * It does NOT communicate with runner.ts.
     * It does NOT execute trades.
     * It does NOT modify AI Trading.
     * ----------------------------------------------------------
     */

    const response =
      await openai.responses.create({
        model:
          process.env.OPENAI_ASSISTANT_MODEL ||
          "gpt-5-mini",

        instructions: SYSTEM_PROMPT,

        input: inputMessages.map(
          (item) => ({
            role: item.role,
            content: item.content,
          })
        ),

        max_output_tokens: 700,
      });

    /*
     * ----------------------------------------------------------
     * GET AI RESPONSE
     * ----------------------------------------------------------
     */

    const reply =
      response.output_text?.trim();

    if (!reply) {
      throw new Error(
        "AI returned an empty response."
      );
    }

    /*
     * ----------------------------------------------------------
     * RETURN
     * ----------------------------------------------------------
     */

    return NextResponse.json(
      {
        success: true,
        reply,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error(
      "AI ASSISTANT API ERROR:",
      error
    );

    if (
      error instanceof Error
    ) {
      console.error(
        error.message
      );
    }

    return NextResponse.json(
      {
        success: false,
        message:
          "Unable to connect to AI Assistant right now.",
      },
      { status: 500 }
    );
  }
}