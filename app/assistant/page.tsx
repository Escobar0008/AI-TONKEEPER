"use client";

import Link from "next/link";
import {
  ArrowLeft,
  Bot,
  Send,
  Mic,
  Paperclip,
  Sparkles,
  MessageCircle,
  Brain,
  Activity,
  Wallet,
  ShieldCheck,
  TrendingUp,
  Trash2,
} from "lucide-react";
import {
  useRef,
  useState,
  type ChangeEvent,
  type FormEvent,
  type KeyboardEvent,
} from "react";

type Message = {
  id: string;
  role: "assistant" | "user";
  content: string;
  createdAt: number;
};

type AssistantResponse = {
  success?: boolean;
  message?: string;
  reply?: string;
};

const QUICK_ACTIONS = [
  {
    label: "Analyze today's crypto market",
    icon: TrendingUp,
    message:
      "Analyze today's crypto market and explain the main opportunities and risks.",
  },
  {
    label: "Check my AI Trading status",
    icon: Activity,
    message:
      "Check my AI Trading status and explain what is currently happening.",
  },
  {
    label: "Check my wallet",
    icon: Wallet,
    message:
      "Show me what information is available about my connected wallet.",
  },
  {
    label: "Security check",
    icon: ShieldCheck,
    message:
      "Give me a security checklist for protecting my crypto wallet.",
  },
];

function createWelcomeMessage(): Message {
  return {
    id: `welcome-${Date.now()}`,
    role: "assistant",
    content:
      "👋 Welcome to AI TONKEEPER.\n\nI am your AI crypto assistant. I can help you understand the market, your wallet, AI Trading, security and crypto concepts.\n\nAsk me anything to get started.",
    createdAt: Date.now(),
  };
}

export default function AssistantPage() {
  const [messages, setMessages] = useState<Message[]>([
    createWelcomeMessage(),
  ]);

  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [recording, setRecording] = useState(false);
  const [attachmentName, setAttachmentName] = useState("");

  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const messagesRef = useRef<HTMLDivElement | null>(null);

  /*
   * ============================================================
   * SCROLL CHAT
   * ============================================================
   */

  const scrollMessagesToBottom = () => {
    requestAnimationFrame(() => {
      const container = messagesRef.current;

      if (!container) {
        return;
      }

      container.scrollTop = container.scrollHeight;
    });
  };

  /*
   * ============================================================
   * ADD MESSAGE
   * ============================================================
   */

  const addMessage = (
    role: Message["role"],
    content: string
  ) => {
    const message: Message = {
      id: `${role}-${Date.now()}-${Math.random()
        .toString(36)
        .slice(2)}`,
      role,
      content,
      createdAt: Date.now(),
    };

    setMessages((previous) => [
      ...previous,
      message,
    ]);

    return message;
  };

  /*
   * ============================================================
   * SEND MESSAGE
   * ============================================================
   */

  const sendMessage = async (
    messageOverride?: string
  ) => {
    const message =
      messageOverride?.trim() ||
      input.trim();

    if (!message || sending) {
      return;
    }

    const conversation = [
      ...messages,
      {
        role: "user" as const,
        content: message,
      },
    ].map((item) => ({
      role: item.role,
      content: item.content,
    }));

    setInput("");
    setAttachmentName("");

    addMessage("user", message);

    setSending(true);

    scrollMessagesToBottom();

    try {
      const response = await fetch(
        "/api/assistant",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            message,
            conversation,
          }),
        }
      );

      let data: AssistantResponse = {};

      try {
        data =
          (await response.json()) as AssistantResponse;
      } catch {
        data = {};
      }

      if (!response.ok || !data.success) {
        throw new Error(
          data.message ||
            "Unable to get a response from AI Assistant."
        );
      }

      addMessage(
        "assistant",
        data.reply ||
          "I received your message, but I could not generate a response."
      );
    } catch (error) {
      console.error(
        "AI ASSISTANT ERROR:",
        error
      );

      addMessage(
        "assistant",
        error instanceof Error
          ? error.message
          : "Unable to connect to AI Assistant right now."
      );
    } finally {
      setSending(false);

      scrollMessagesToBottom();

      window.setTimeout(() => {
        textareaRef.current?.focus();
      }, 100);
    }
  };

  /*
   * ============================================================
   * FORM
   * ============================================================
   */

  const handleSubmit = (
    event: FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    void sendMessage();
  };

  /*
   * ============================================================
   * ENTER KEY
   * ============================================================
   */

  const handleTextareaKeyDown = (
    event: KeyboardEvent<HTMLTextAreaElement>
  ) => {
    if (
      event.key === "Enter" &&
      !event.shiftKey
    ) {
      event.preventDefault();

      void sendMessage();
    }
  };

  /*
   * ============================================================
   * ATTACHMENT
   * ============================================================
   */

  const handleAttachment = (
    event: ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    setAttachmentName(file.name);
  };

  /*
   * ============================================================
   * VOICE
   * ============================================================
   */

  const toggleRecording = () => {
    setRecording((previous) => !previous);
  };

  /*
   * ============================================================
   * CLEAR CHAT
   * ============================================================
   */

  const clearConversation = () => {
    if (sending) {
      return;
    }

    setMessages([createWelcomeMessage()]);
    setInput("");
    setAttachmentName("");
    setRecording(false);

    requestAnimationFrame(() => {
      if (messagesRef.current) {
        messagesRef.current.scrollTop = 0;
      }
    });
  };

  return (
    <main className="min-h-[100dvh] w-full overflow-x-hidden bg-[#050B18] text-white">
      <div className="mx-auto flex min-h-[100dvh] w-full max-w-3xl flex-col px-4 pb-6 pt-4 sm:px-6 sm:pt-6">

        {/* =====================================================
            HEADER
        ====================================================== */}

        <header className="grid grid-cols-[48px_1fr_48px] items-center gap-3">

          <Link
            href="/dashboard"
            aria-label="Back to dashboard"
            className="flex h-12 w-12 items-center justify-center rounded-2xl border border-slate-800 bg-[#101A2C] transition hover:border-cyan-500"
          >
            <ArrowLeft size={21} />
          </Link>

          <div className="min-w-0 text-center">
            <h1 className="truncate text-lg font-bold sm:text-xl">
              AI Assistant
            </h1>

            <div className="mt-1 flex items-center justify-center gap-2">
              <span className="h-2 w-2 shrink-0 animate-pulse rounded-full bg-green-400" />

              <p className="truncate text-[11px] text-slate-400 sm:text-xs">
                AI TONKEEPER • Online
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={clearConversation}
            disabled={sending}
            aria-label="Clear conversation"
            className="flex h-12 w-12 items-center justify-center rounded-2xl border border-slate-800 bg-[#101A2C] transition hover:border-red-500 disabled:cursor-not-allowed disabled:opacity-40"
          >
            <Trash2
              size={19}
              className="text-slate-300"
            />
          </button>
        </header>

        {/* =====================================================
            AI CARD
        ====================================================== */}

        <section className="mt-5 w-full rounded-3xl bg-gradient-to-br from-cyan-500 to-blue-700 p-5 shadow-lg shadow-cyan-950/20 sm:p-6">

          <div className="flex items-center gap-4">

            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-white/15">
              <Brain
                size={31}
                className="text-white"
              />
            </div>

            <div className="min-w-0">
              <h2 className="text-lg font-bold sm:text-xl">
                AI TONKEEPER
              </h2>

              <p className="mt-1 max-w-xl text-xs leading-5 text-cyan-100 sm:text-sm">
                Your intelligent crypto assistant for
                wallet, markets, security and AI Trading.
              </p>
            </div>

          </div>

        </section>

        {/* =====================================================
            CHAT CONTAINER
        ====================================================== */}

        <section className="mt-5 flex w-full flex-col overflow-hidden rounded-3xl border border-slate-800 bg-[#0B1220]">

          {/* CHAT MESSAGES */}

          <div
            ref={messagesRef}
            className="h-[420px] min-h-[420px] w-full space-y-4 overflow-y-auto overscroll-contain p-4 sm:h-[450px] sm:min-h-[450px] sm:p-5"
          >

            {messages.map((message) => {
              const isUser =
                message.role === "user";

              return (
                <div
                  key={message.id}
                  className={`flex w-full ${
                    isUser
                      ? "justify-end"
                      : "justify-start"
                  }`}
                >

                  <div
                    className={`max-w-[88%] break-words rounded-3xl p-4 sm:max-w-[80%] ${
                      isUser
                        ? "rounded-br-md bg-cyan-500 text-black"
                        : "rounded-bl-md border border-slate-800 bg-[#101A2C]"
                    }`}
                  >

                    {!isUser && (
                      <div className="mb-2 flex items-center gap-2">
                        <Bot
                          size={17}
                          className="shrink-0 text-cyan-400"
                        />

                        <span className="text-xs font-bold text-cyan-400">
                          AI Assistant
                        </span>
                      </div>
                    )}

                    {isUser && (
                      <div className="mb-2 text-right text-[10px] font-bold uppercase opacity-60">
                        You
                      </div>
                    )}

                    <p className="whitespace-pre-line text-sm leading-6">
                      {message.content}
                    </p>

                  </div>

                </div>
              );
            })}

            {sending && (
              <div className="flex justify-start">
                <div className="rounded-3xl rounded-bl-md border border-slate-800 bg-[#101A2C] p-4">

                  <div className="flex items-center gap-2">
                    <Bot
                      size={17}
                      className="text-cyan-400"
                    />

                    <span className="text-xs font-semibold text-cyan-400">
                      AI Assistant
                    </span>
                  </div>

                  <div className="mt-3 flex gap-1">
                    <span className="h-2 w-2 animate-bounce rounded-full bg-cyan-400" />
                    <span className="h-2 w-2 animate-bounce rounded-full bg-cyan-400 [animation-delay:150ms]" />
                    <span className="h-2 w-2 animate-bounce rounded-full bg-cyan-400 [animation-delay:300ms]" />
                  </div>

                </div>
              </div>
            )}

          </div>

          {/* =================================================
              ATTACHMENT
          ================================================== */}

          {attachmentName && (
            <div className="border-t border-slate-800 px-3 py-3 sm:px-4">
              <div className="flex min-w-0 items-center justify-between gap-3 rounded-xl border border-cyan-900/50 bg-cyan-950/30 px-3 py-2">

                <div className="flex min-w-0 items-center gap-2">
                  <Paperclip
                    size={16}
                    className="shrink-0 text-cyan-400"
                  />

                  <span className="truncate text-xs text-slate-300">
                    {attachmentName}
                  </span>
                </div>

                <button
                  type="button"
                  onClick={() =>
                    setAttachmentName("")
                  }
                  className="shrink-0 text-xs text-red-400"
                >
                  Remove
                </button>

              </div>
            </div>
          )}

          {/* =================================================
              MESSAGE INPUT
          ================================================== */}

          <form
            onSubmit={handleSubmit}
            className="border-t border-slate-800 p-3 sm:p-4"
          >

            <textarea
              ref={textareaRef}
              value={input}
              onChange={(event) =>
                setInput(event.target.value)
              }
              onKeyDown={
                handleTextareaKeyDown
              }
              disabled={sending}
              rows={2}
              placeholder="Ask AI anything..."
              className="block h-14 w-full resize-none overflow-y-auto bg-transparent px-2 py-1 text-sm leading-6 outline-none placeholder:text-slate-600 disabled:opacity-50"
            />

            <div className="mt-3 flex items-center justify-between gap-3">

              <div className="flex shrink-0 gap-2">

                <input
                  ref={fileInputRef}
                  type="file"
                  className="hidden"
                  onChange={handleAttachment}
                  accept=".jpg,.jpeg,.png,.pdf,.txt"
                />

                <button
                  type="button"
                  onClick={() =>
                    fileInputRef.current?.click()
                  }
                  disabled={sending}
                  aria-label="Attach file"
                  className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-700 text-slate-300 transition hover:border-cyan-500 disabled:opacity-40"
                >
                  <Paperclip size={18} />
                </button>

                <button
                  type="button"
                  onClick={toggleRecording}
                  disabled={sending}
                  aria-label="Voice input"
                  className={`flex h-10 w-10 items-center justify-center rounded-xl border transition ${
                    recording
                      ? "border-red-500 bg-red-500/10 text-red-400"
                      : "border-slate-700 text-slate-300 hover:border-cyan-500"
                  } disabled:opacity-40`}
                >
                  <Mic size={18} />
                </button>

              </div>

              <button
                type="submit"
                disabled={
                  sending ||
                  !input.trim()
                }
                className="flex h-10 shrink-0 items-center gap-2 rounded-xl bg-cyan-500 px-4 text-sm font-bold text-black transition hover:bg-cyan-400 disabled:cursor-not-allowed disabled:opacity-40 sm:px-5"
              >
                <span>
                  {sending
                    ? "Sending..."
                    : "Send"}
                </span>

                <Send size={17} />
              </button>

            </div>

          </form>

        </section>

        {/* =====================================================
            QUICK ACTIONS
        ====================================================== */}

        <section className="mt-6 w-full">

          <div className="mb-3 flex items-center gap-2">
            <Sparkles
              size={18}
              className="text-cyan-400"
            />

            <h2 className="text-lg font-bold">
              Quick Actions
            </h2>
          </div>

          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">

            {QUICK_ACTIONS.map(
              (action) => {
                const Icon = action.icon;

                return (
                  <button
                    key={action.label}
                    type="button"
                    disabled={sending}
                    onClick={() =>
                      void sendMessage(
                        action.message
                      )
                    }
                    className="min-h-[68px] w-full rounded-2xl border border-slate-800 bg-[#101A2C] p-4 text-left transition hover:border-cyan-500 disabled:cursor-not-allowed disabled:opacity-50"
                  >

                    <div className="flex items-center gap-3">

                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-cyan-500/10">
                        <Icon
                          size={20}
                          className="text-cyan-400"
                        />
                      </div>

                      <span className="text-sm font-medium leading-5">
                        {action.label}
                      </span>

                    </div>

                  </button>
                );
              }
            )}

          </div>

        </section>

        {/* =====================================================
            AI TRADING
        ====================================================== */}

        <section className="mt-6 w-full rounded-3xl border border-slate-800 bg-[#101A2C] p-5">

          <div className="flex items-center gap-3">

            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-cyan-500/10">
              <Activity
                size={22}
                className="text-cyan-400"
              />
            </div>

            <div className="min-w-0">
              <h2 className="font-bold">
                AI Trading
              </h2>

              <p className="text-xs text-slate-500">
                Trading engine connection
              </p>
            </div>

          </div>

          <div className="mt-5 space-y-3">

            <div className="flex items-center justify-between gap-4">
              <span className="text-sm text-slate-400">
                AI Trading
              </span>

              <span className="flex shrink-0 items-center gap-2 text-sm font-bold text-green-400">
                <span className="h-2 w-2 animate-pulse rounded-full bg-green-400" />
                Available
              </span>
            </div>

            <div className="flex items-center justify-between gap-4">
              <span className="text-sm text-slate-400">
                Market Analysis
              </span>

              <span className="shrink-0 text-sm font-bold text-cyan-400">
                Available
              </span>
            </div>

            <div className="flex items-center justify-between gap-4">
              <span className="text-sm text-slate-400">
                Trading Engine
              </span>

              <span className="shrink-0 text-sm font-bold text-cyan-400">
                Connected
              </span>
            </div>

          </div>

          <div className="mt-4 rounded-2xl border border-cyan-900/40 bg-cyan-950/20 p-3">
            <p className="text-xs leading-5 text-slate-400">
              AI Assistant can explain AI Trading
              information without modifying the
              trading engine.
            </p>
          </div>

        </section>

        {/* =====================================================
            WALLET / SECURITY
        ====================================================== */}

        <section className="mt-4 grid w-full grid-cols-2 gap-3">

          <div className="min-w-0 rounded-2xl border border-slate-800 bg-[#101A2C] p-4">

            <Wallet
              size={20}
              className="text-cyan-400"
            />

            <p className="mt-3 text-xs text-slate-500">
              Wallet
            </p>

            <p className="mt-1 truncate text-sm font-bold">
              Connected
            </p>

          </div>

          <div className="min-w-0 rounded-2xl border border-slate-800 bg-[#101A2C] p-4">

            <ShieldCheck
              size={20}
              className="text-green-400"
            />

            <p className="mt-3 text-xs text-slate-500">
              Security
            </p>

            <p className="mt-1 truncate text-sm font-bold text-green-400">
              Protected
            </p>

          </div>

        </section>

        {/* =====================================================
            ASSISTANT STATUS
        ====================================================== */}

        <section className="mt-4 w-full rounded-3xl border border-slate-800 bg-[#101A2C] p-5">

          <div className="flex items-center gap-3">

            <Bot
              size={22}
              className="shrink-0 text-cyan-400"
            />

            <h2 className="font-bold">
              Assistant Status
            </h2>

          </div>

          <div className="mt-5 space-y-3">

            <div className="flex items-center justify-between gap-4">
              <span className="text-sm text-slate-400">
                AI Status
              </span>

              <span className="shrink-0 text-sm font-bold text-green-400">
                Online
              </span>
            </div>

            <div className="flex items-center justify-between gap-4">
              <span className="text-sm text-slate-400">
                Assistant
              </span>

              <span className="shrink-0 text-sm font-bold text-cyan-400">
                AI TONKEEPER
              </span>
            </div>

            <div className="flex items-center justify-between gap-4">
              <span className="text-sm text-slate-400">
                Version
              </span>

              <span className="shrink-0 text-sm font-bold">
                v1.0
              </span>
            </div>

          </div>

        </section>

        {/* =====================================================
            FOOTER
        ====================================================== */}

        <footer className="mt-8 pb-4 text-center">

          <div className="flex items-center justify-center gap-2">
            <MessageCircle
              size={15}
              className="text-cyan-400"
            />

            <p className="text-xs text-slate-500">
              AI TONKEEPER Assistant
            </p>
          </div>

          <p className="mt-2 text-xs text-slate-600">
            © 2026 AI TONKEEPER. All rights reserved.
          </p>

        </footer>

      </div>
    </main>
  );
}