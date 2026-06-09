"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { X, MessageCircle, Send, Headphones, Loader2 } from "lucide-react";

type MessageSender = "VISITOR" | "ADMIN" | "BOT";

interface ChatMessage {
  id: string;
  senderType: MessageSender;
  senderName: string | null;
  content: string;
  createdAt: string;
}

interface QuickReply {
  id: string;
  question: string;
  answer: string;
}

function getTime(iso?: string) {
  return new Date(iso ?? Date.now()).toLocaleTimeString("tr-TR", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function getOrCreateVisitorId(): string {
  let id = localStorage.getItem("chat_visitor_id");
  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem("chat_visitor_id", id);
  }
  return id;
}

const WELCOME: ChatMessage = {
  id: "welcome",
  senderType: "BOT",
  senderName: "Binboğa Destek",
  content: "Merhaba! 👋 Binboğa Bal'a hoş geldiniz.\nSize nasıl yardımcı olabiliriz?",
  createdAt: new Date().toISOString(),
};

export function SupportFAB({
  whatsappNumber = "",
  userName = null,
  userId = null,
}: {
  whatsappNumber?: string;
  userName?: string | null;
  userId?: string | null;
}) {
  const number = whatsappNumber.replace(/\D/g, "");
  const [isOpen, setIsOpen] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([WELCOME]);
  const [quickReplies, setQuickReplies] = useState<QuickReply[]>([]);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [sessionClosed, setSessionClosed] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const pollRef = useRef<NodeJS.Timeout | null>(null);
  const lastMsgTimeRef = useRef<string | null>(null);
  const initializedRef = useRef(false);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  // Load quick replies once
  useEffect(() => {
    fetch("/api/chat/quick-replies")
      .then((r) => r.json())
      .then((data) => { if (Array.isArray(data)) setQuickReplies(data); })
      .catch(() => {});
  }, []);

  // On chat open: restore existing session
  useEffect(() => {
    if (!chatOpen || initializedRef.current) return;
    initializedRef.current = true;

    const savedSessionId = localStorage.getItem("chat_session_id");
    if (!savedSessionId) return;

    const visitorId = getOrCreateVisitorId();

    fetch("/api/chat/session", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
          visitorId,
          visitorName: userName ?? undefined,
          userId: userId ?? undefined,
        }),
    })
      .then((r) => r.json())
      .then((data) => {
        if (!data?.id) return;
        if (data.status === "CLOSED") {
          localStorage.removeItem("chat_session_id");
          return;
        }
        setSessionId(data.id);
        localStorage.setItem("chat_session_id", data.id);
        if (data.messages?.length > 0) {
          setMessages([WELCOME, ...data.messages]);
          lastMsgTimeRef.current = data.messages[data.messages.length - 1]?.createdAt ?? null;
        }
      })
      .catch(() => {});
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chatOpen]);

  // Polling for new messages + session status
  const pollMessages = useCallback(async (sid: string) => {
    const after = lastMsgTimeRef.current;
    const url = `/api/chat/${sid}/messages${after ? `?after=${encodeURIComponent(after)}` : ""}`;
    const res = await fetch(url);
    const data: { messages: ChatMessage[]; sessionStatus: string } = await res.json();

    if (data.sessionStatus === "CLOSED") {
      setSessionClosed(true);
      setSessionId(null);
      localStorage.removeItem("chat_session_id");
    }

    if (data.messages.length > 0) {
      setMessages((prev) => {
        const existingIds = new Set(prev.map((m) => m.id));
        const newMsgs = data.messages.filter((m) => !existingIds.has(m.id));
        if (newMsgs.length === 0) return prev;
        lastMsgTimeRef.current = newMsgs[newMsgs.length - 1].createdAt;
        return [...prev, ...newMsgs];
      });
    }
  }, []);

  useEffect(() => {
    if (!chatOpen || !sessionId) {
      if (pollRef.current) clearInterval(pollRef.current);
      return;
    }
    pollRef.current = setInterval(() => pollMessages(sessionId), 3_000);
    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, [chatOpen, sessionId, pollMessages]);

  async function ensureSession(): Promise<string> {
    if (sessionId) return sessionId;

    const visitorId = getOrCreateVisitorId();
    const res = await fetch("/api/chat/session", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        visitorId,
        visitorName: userName ?? undefined,
        userId: userId ?? undefined,
      }),
    });
    const data = await res.json();
    setSessionId(data.id);
    localStorage.setItem("chat_session_id", data.id);
    return data.id;
  }

  async function sendMessage(text: string = input, botResponse?: string) {
    const trimmed = text.trim();
    if (!trimmed || sending) return;

    setSending(true);
    setInput("");

    // Optimistic UI: kullanıcı mesajını hemen göster
    const optimisticMsg: ChatMessage = {
      id: `opt-${Date.now()}`,
      senderType: "VISITOR",
      senderName: null,
      content: trimmed,
      createdAt: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, optimisticMsg]);

    if (botResponse) {
      setIsTyping(true);
    }

    try {
      const sid = await ensureSession();
      const visitorId = getOrCreateVisitorId();

      const res = await fetch(`/api/chat/${sid}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: trimmed, visitorId, botResponse }),
      });
      const created: ChatMessage[] = await res.json();

      // Replace optimistic message with real ones
      setMessages((prev) => {
        const filtered = prev.filter((m) => m.id !== optimisticMsg.id);
        return [...filtered, ...created];
      });

      if (created.length > 0) {
        lastMsgTimeRef.current = created[created.length - 1].createdAt;
      }
    } catch {
      // Keep optimistic message on error
    } finally {
      setIsTyping(false);
      setSending(false);
    }
  }

  function openChat() {
    setChatOpen(true);
    setIsOpen(false);
  }

  return (
    <>
      {/* ── Chat Paneli ─────────────────────────────────────────── */}
      {chatOpen && (
        <div
          className="fixed bottom-24 right-4 z-50 rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-slide-up"
          style={{ width: 400, maxHeight: 580 }}
        >
          {/* Header */}
          <div
            className="flex items-center gap-3 px-4 py-3 flex-shrink-0"
            style={{ background: "linear-gradient(135deg, #C57930 0%, #F9B10B 100%)" }}
          >
            <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0">
              <Headphones className="w-5 h-5 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-white font-semibold text-sm leading-tight">Binboğa Destek</p>
              <div className="flex items-center gap-1 mt-0.5">
                <span className="w-2 h-2 bg-green-300 rounded-full" />
                <span className="text-white/80 text-xs">Müşteri hizmetleri</span>
              </div>
            </div>
            <button
              onClick={() => setChatOpen(false)}
              className="text-white/70 hover:text-white transition-colors p-1"
              aria-label="Kapat"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-white" style={{ minHeight: 240 }}>
            {messages.map((msg) => {
              const isUser = msg.senderType === "VISITOR";
              return (
                <div
                  key={msg.id}
                  className={`flex ${isUser ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[82%] px-3.5 py-2.5 rounded-2xl text-sm ${
                      isUser
                        ? "rounded-br-none text-white"
                        : "rounded-bl-none bg-gray-100 text-gray-800"
                    }`}
                    style={
                      isUser
                        ? { background: "linear-gradient(135deg, #C57930, #F9B10B)" }
                        : undefined
                    }
                  >
                    {!isUser && msg.senderName && (
                      <p className="text-xs font-semibold text-amber-600 mb-0.5">
                        {msg.senderName}
                      </p>
                    )}
                    <p className="whitespace-pre-line leading-relaxed">{msg.content}</p>
                    <p
                      className={`text-xs mt-1 ${
                        isUser ? "text-white/60 text-right" : "text-gray-400"
                      }`}
                    >
                      {getTime(msg.createdAt)}
                    </p>
                  </div>
                </div>
              );
            })}

            {/* Typing indicator */}
            {isTyping && (
              <div className="flex justify-start">
                <div className="bg-gray-100 rounded-2xl rounded-bl-none px-4 py-3 flex gap-1 items-center">
                  {[0, 1, 2].map((i) => (
                    <span
                      key={i}
                      className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce"
                      style={{ animationDelay: `${i * 150}ms` }}
                    />
                  ))}
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Sohbet kapatıldı bildirimi */}
          {sessionClosed && (
            <div className="px-4 py-2.5 bg-amber-50 border-t border-amber-100 flex-shrink-0">
              <p className="text-xs text-amber-700 text-center">
                Sohbet sonlandırıldı. Yeni bir soru sormak için yazabilirsiniz.
              </p>
            </div>
          )}

          {/* Quick Replies */}
          {!sessionClosed && quickReplies.length > 0 && (
            <div className="px-3 py-2.5 bg-white border-t border-gray-100 flex gap-2 overflow-x-auto flex-shrink-0">
              {quickReplies.map((qr) => (
                <button
                  key={qr.id}
                  onClick={() => sendMessage(qr.question, qr.answer)}
                  className="whitespace-nowrap text-xs px-3 py-1.5 rounded-full border flex-shrink-0 transition-all hover:bg-honeyDark hover:text-white hover:border-honeyDark"
                  style={{ borderColor: "#C57930", color: "#C57930" }}
                >
                  {qr.question}
                </button>
              ))}
            </div>
          )}

          {/* Input */}
          <div className="flex items-center gap-2 px-3 py-3 bg-white border-t border-gray-100 flex-shrink-0">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  if (sessionClosed) setSessionClosed(false);
                  sendMessage();
                }
              }}
              placeholder={sessionClosed ? "Yeni sohbet başlatmak için yazın…" : "Mesajınızı yazın…"}
              className="flex-1 text-sm bg-gray-100 rounded-full px-4 py-2.5 outline-none focus:ring-2"
              style={{ "--tw-ring-color": "#F9B10B" } as React.CSSProperties}
              disabled={sending}
            />
            <button
              onClick={() => {
                if (sessionClosed) setSessionClosed(false);
                sendMessage();
              }}
              disabled={!input.trim() || sending}
              className="w-10 h-10 rounded-full flex items-center justify-center transition-opacity disabled:opacity-40 flex-shrink-0"
              style={{ background: "linear-gradient(135deg, #C57930, #F9B10B)" }}
              aria-label="Gönder"
            >
              {sending ? (
                <Loader2 className="w-4 h-4 text-white animate-spin" />
              ) : (
                <Send className="w-4 h-4 text-white" />
              )}
            </button>
          </div>
        </div>
      )}

      {/* ── FAB Grubu ─────────────────────────────────────────── */}
      <div className="fixed bottom-6 right-4 z-50 flex flex-col items-end gap-3">
        {isOpen && (
          <>
            {/* Canlı Destek */}
            <div className="flex items-center gap-3 animate-fade-in">
              <span className="bg-white text-gray-700 text-sm font-medium px-3 py-1.5 rounded-full shadow-md whitespace-nowrap">
                Canlı Destek
              </span>
              <button
                onClick={openChat}
                className="w-12 h-12 rounded-full shadow-lg flex items-center justify-center transition-transform hover:scale-110"
                style={{ background: "linear-gradient(135deg, #C57930, #F9B10B)" }}
                aria-label="Canlı destek"
              >
                <MessageCircle className="w-6 h-6 text-white" />
              </button>
            </div>

            {/* WhatsApp */}
            <div className="flex items-center gap-3 animate-fade-in">
              <span className="bg-white text-gray-700 text-sm font-medium px-3 py-1.5 rounded-full shadow-md whitespace-nowrap">
                WhatsApp
              </span>
              <a
                href={number ? `https://wa.me/${number}` : "#"}
                target="_blank"
                rel="noopener noreferrer"
                className="w-12 h-12 rounded-full shadow-lg flex items-center justify-center transition-transform hover:scale-110"
                style={{ backgroundColor: "#25D366" }}
                aria-label="WhatsApp ile iletişim"
              >
                <svg viewBox="0 0 24 24" className="w-6 h-6 fill-white">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
                </svg>
              </a>
            </div>
          </>
        )}

        {/* Ana FAB */}
        <button
          onClick={() => setIsOpen((p) => !p)}
          className="w-14 h-14 rounded-full shadow-xl flex items-center justify-center transition-all duration-300 hover:scale-110 relative"
          style={{
            background: isOpen
              ? "#374151"
              : "linear-gradient(135deg, #C57930 0%, #F9B10B 100%)",
          }}
          aria-label={isOpen ? "Menüyü kapat" : "Destek menüsünü aç"}
        >
          {isOpen ? (
            <X className="w-6 h-6 text-white" />
          ) : (
            <>
              <MessageCircle className="w-7 h-7 text-white" />
              <span
                className="absolute inset-0 rounded-full animate-ping opacity-25 pointer-events-none"
                style={{ backgroundColor: "#F9B10B" }}
              />
            </>
          )}
        </button>
      </div>
    </>
  );
}
