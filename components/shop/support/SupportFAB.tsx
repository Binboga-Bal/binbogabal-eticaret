"use client";

import { useState, useRef, useEffect } from "react";
import { X, MessageCircle, Send, Headphones } from "lucide-react";

const WHATSAPP_NUMBER = (process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? "905XXXXXXXXX").replace(/\D/g, "");

type Message = {
  id: string;
  text: string;
  sender: "user" | "bot";
  time: string;
};

const QUICK_REPLIES = [
  "Siparişim nerede?",
  "Ürün bilgisi",
  "Kargo süresi",
  "İade / Değişim",
];

const BOT_RESPONSES: Record<string, string> = {
  "Siparişim nerede?":
    "Siparişinizi takip etmek için hesabınızdaki 'Siparişlerim' bölümünü inceleyebilirsiniz. Sipariş numaranızı WhatsApp hattımıza da iletebilirsiniz.",
  "Ürün bilgisi":
    "Hangi ürünümüz hakkında bilgi almak istediğinizi belirtir misiniz? Size en doğru bilgiyi vermekten memnuniyet duyarız. 🍯",
  "Kargo süresi":
    "Siparişleriniz ödeme onayından itibaren 1-3 iş günü içinde kargoya verilir. Kargo teslim süresi bölgenize göre 2-4 iş günüdür.",
  "İade / Değişim":
    "14 gün içinde yasal cayma hakkınızı kullanabilirsiniz. Detaylı bilgi için WhatsApp hattımızdan destek alabilirsiniz.",
  default:
    "Mesajınızı aldım! 😊 Müşteri temsilcimiz en kısa sürede sizinle iletişime geçecek. Acil konular için WhatsApp hattımızı kullanabilirsiniz.",
};

function getTime() {
  return new Date().toLocaleTimeString("tr-TR", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function SupportFAB() {
  const [isOpen, setIsOpen] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      text: "Merhaba! 👋 Binboğa Bal'a hoş geldiniz.\nSize nasıl yardımcı olabiliriz?",
      sender: "bot",
      time: getTime(),
    },
  ]);
  const [input, setInput] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  function sendMessage(text: string = input) {
    const trimmed = text.trim();
    if (!trimmed) return;

    setMessages((prev) => [
      ...prev,
      { id: Date.now().toString(), text: trimmed, sender: "user", time: getTime() },
    ]);
    setInput("");
    setIsTyping(true);

    setTimeout(() => {
      setIsTyping(false);
      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          text: BOT_RESPONSES[trimmed] ?? BOT_RESPONSES.default,
          sender: "bot",
          time: getTime(),
        },
      ]);
    }, 900);
  }

  function openChat() {
    setChatOpen(true);
    setIsOpen(false);
  }

  return (
    <>
      {/* ── Chatbot Paneli ────────────────────────────────────── */}
      {chatOpen && (
        <div
          className="fixed bottom-24 right-4 z-50 w-80 rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-slide-up"
          style={{ maxHeight: 500 }}
        >
          {/* Header */}
          <div
            className="flex items-center gap-3 px-4 py-3"
            style={{ background: "linear-gradient(135deg, #C57930 0%, #F9B10B 100%)" }}
          >
            <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0">
              <Headphones className="w-5 h-5 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-white font-semibold text-sm leading-tight">Binboğa Destek</p>
              <div className="flex items-center gap-1 mt-0.5">
                <span className="w-2 h-2 bg-green-300 rounded-full" />
                <span className="text-white/80 text-xs">Çevrimiçi</span>
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
          <div
            className="flex-1 overflow-y-auto p-4 space-y-3 bg-white"
            style={{ minHeight: 180, maxHeight: 240 }}
          >
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[82%] px-3 py-2 rounded-2xl text-sm ${
                    msg.sender === "user"
                      ? "rounded-br-none text-white"
                      : "rounded-bl-none bg-gray-100 text-gray-800"
                  }`}
                  style={
                    msg.sender === "user"
                      ? { background: "linear-gradient(135deg, #C57930, #F9B10B)" }
                      : undefined
                  }
                >
                  <p className="whitespace-pre-line leading-relaxed">{msg.text}</p>
                  <p
                    className={`text-xs mt-1 ${
                      msg.sender === "user" ? "text-white/60 text-right" : "text-gray-400"
                    }`}
                  >
                    {msg.time}
                  </p>
                </div>
              </div>
            ))}

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

          {/* Quick Replies */}
          <div className="px-3 py-2 bg-white border-t border-gray-100 flex gap-2 overflow-x-auto">
            {QUICK_REPLIES.map((reply) => (
              <button
                key={reply}
                onClick={() => sendMessage(reply)}
                className="whitespace-nowrap text-xs px-3 py-1.5 rounded-full border flex-shrink-0 transition-all hover:bg-honeyDark hover:text-white hover:border-honeyDark"
                style={{ borderColor: "#C57930", color: "#C57930" }}
              >
                {reply}
              </button>
            ))}
          </div>

          {/* Input */}
          <div className="flex items-center gap-2 px-3 py-3 bg-white border-t border-gray-100">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && sendMessage()}
              placeholder="Mesajınızı yazın..."
              className="flex-1 text-sm bg-gray-100 rounded-full px-4 py-2 outline-none focus:ring-2"
              style={{ "--tw-ring-color": "#F9B10B" } as React.CSSProperties}
            />
            <button
              onClick={() => sendMessage()}
              disabled={!input.trim()}
              className="w-9 h-9 rounded-full flex items-center justify-center transition-opacity disabled:opacity-40 flex-shrink-0"
              style={{ background: "linear-gradient(135deg, #C57930, #F9B10B)" }}
              aria-label="Gönder"
            >
              <Send className="w-4 h-4 text-white" />
            </button>
          </div>
        </div>
      )}

      {/* ── FAB Grubu ─────────────────────────────────────────── */}
      <div className="fixed bottom-6 right-4 z-50 flex flex-col items-end gap-3">
        {/* Sub-butonlar */}
        {isOpen && (
          <>
            {/* Canlı Destek / Chatbot */}
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
                href={`https://wa.me/${WHATSAPP_NUMBER}`}
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

        {/* Ana FAB butonu */}
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
            <X className="w-6 h-6 text-white transition-transform rotate-0" />
          ) : (
            <>
              <MessageCircle className="w-7 h-7 text-white" />
              {/* Pulse halkası */}
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
