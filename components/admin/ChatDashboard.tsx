"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import {
  MessageSquare,
  User,
  Clock,
  CheckCheck,
  Send,
  X,
  Plus,
  Trash2,
  Edit2,
  Check,
  Circle,
  RefreshCw,
  Zap,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

// ─── Types ────────────────────────────────────────────────────────────────────

type SessionStatus = "WAITING" | "ACTIVE" | "CLOSED";
type SenderType = "VISITOR" | "ADMIN" | "BOT";

interface ChatMessage {
  id: string;
  sessionId: string;
  senderType: SenderType;
  senderName: string | null;
  content: string;
  isRead: boolean;
  createdAt: string;
}

interface ChatSession {
  id: string;
  visitorId: string;
  visitorName: string | null;
  visitorEmail: string | null;
  status: SessionStatus;
  adminName: string | null;
  createdAt: string;
  updatedAt: string;
  messages: ChatMessage[];
  _count: { messages: number };
}

type QuickReplyCategory = "GENEL" | "YENI_MUSTERI" | "MEVCUT_MUSTERI";

interface QuickReply {
  id: string;
  question: string;
  answer: string;
  category: QuickReplyCategory;
  order: number;
  isActive: boolean;
}

const CATEGORY_META: Record<QuickReplyCategory, { label: string; color: string }> = {
  GENEL:          { label: "Genel",          color: "bg-gray-100 text-gray-600" },
  YENI_MUSTERI:   { label: "Yeni Müşteri",   color: "bg-blue-100 text-blue-700" },
  MEVCUT_MUSTERI: { label: "Mevcut Müşteri", color: "bg-green-100 text-green-700" },
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function fmtTime(iso: string) {
  return new Date(iso).toLocaleTimeString("tr-TR", { hour: "2-digit", minute: "2-digit" });
}

function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString("tr-TR", { day: "2-digit", month: "2-digit", year: "2-digit" });
}

function statusLabel(s: SessionStatus) {
  if (s === "WAITING") return "Bekliyor";
  if (s === "ACTIVE") return "Aktif";
  return "Kapalı";
}

function statusColor(s: SessionStatus) {
  if (s === "WAITING") return "bg-amber-100 text-amber-700";
  if (s === "ACTIVE") return "bg-green-100 text-green-700";
  return "bg-gray-100 text-gray-500";
}

function visitorLabel(s: ChatSession) {
  return s.visitorName || s.visitorEmail || `Ziyaretçi #${s.id.slice(-6)}`;
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function SessionListItem({
  session,
  isActive,
  onClick,
}: {
  session: ChatSession;
  isActive: boolean;
  onClick: () => void;
}) {
  const lastMsg = session.messages[0];
  const unread = session._count.messages;

  return (
    <button
      onClick={onClick}
      className={`w-full text-left px-4 py-3 border-b border-gray-100 hover:bg-gray-50 transition-colors ${
        isActive ? "bg-amber-50 border-l-4 border-l-amber-400" : ""
      }`}
    >
      <div className="flex items-center justify-between mb-1">
        <span className="font-medium text-sm text-gray-900 truncate flex-1">
          {visitorLabel(session)}
        </span>
        <div className="flex items-center gap-1.5 ml-2 flex-shrink-0">
          {unread > 0 && (
            <span className="bg-amber-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center font-bold">
              {unread > 9 ? "9+" : unread}
            </span>
          )}
          <span className={`text-xs px-1.5 py-0.5 rounded-full font-medium ${statusColor(session.status)}`}>
            {statusLabel(session.status)}
          </span>
        </div>
      </div>
      {lastMsg && (
        <p className="text-xs text-gray-500 truncate">
          {lastMsg.senderType === "ADMIN" ? "Siz: " : ""}
          {lastMsg.content}
        </p>
      )}
      <p className="text-xs text-gray-400 mt-0.5">{fmtDate(session.updatedAt)} {fmtTime(session.updatedAt)}</p>
    </button>
  );
}

function MessageBubble({ msg }: { msg: ChatMessage }) {
  const isAdmin = msg.senderType === "ADMIN";
  const isBot = msg.senderType === "BOT";

  return (
    <div className={`flex ${isAdmin ? "justify-end" : "justify-start"} mb-3`}>
      {!isAdmin && (
        <div className="w-7 h-7 rounded-full bg-gray-200 flex items-center justify-center mr-2 flex-shrink-0 self-end">
          {isBot ? (
            <Zap className="w-3.5 h-3.5 text-amber-600" />
          ) : (
            <User className="w-3.5 h-3.5 text-gray-500" />
          )}
        </div>
      )}
      <div className={`max-w-[70%]`}>
        {!isAdmin && (
          <p className="text-xs text-gray-400 mb-0.5 ml-1">
            {msg.senderName ?? (isBot ? "Bot" : "Ziyaretçi")}
          </p>
        )}
        <div
          className={`px-3.5 py-2.5 rounded-2xl text-sm leading-relaxed ${
            isAdmin
              ? "rounded-br-none text-white"
              : "rounded-bl-none bg-gray-100 text-gray-800"
          }`}
          style={
            isAdmin
              ? { background: "linear-gradient(135deg, #C57930, #F9B10B)" }
              : undefined
          }
        >
          <p className="whitespace-pre-line">{msg.content}</p>
          <p
            className={`text-xs mt-1 ${
              isAdmin ? "text-white/60 text-right" : "text-gray-400"
            }`}
          >
            {fmtTime(msg.createdAt)}
            {isAdmin && <CheckCheck className="inline ml-1 w-3 h-3" />}
          </p>
        </div>
      </div>
    </div>
  );
}

// ─── Quick Replies Tab ────────────────────────────────────────────────────────

function QuickRepliesTab() {
  const [replies, setReplies] = useState<QuickReply[]>([]);
  const [loading, setLoading] = useState(true);
  const [newQ, setNewQ] = useState("");
  const [newA, setNewA] = useState("");
  const [newCat, setNewCat] = useState<QuickReplyCategory>("GENEL");
  const [saving, setSaving] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [editQ, setEditQ] = useState("");
  const [editA, setEditA] = useState("");
  const [editCat, setEditCat] = useState<QuickReplyCategory>("GENEL");
  const [filterCat, setFilterCat] = useState<QuickReplyCategory | "TUMU">("TUMU");

  useEffect(() => {
    fetch("/api/admin/chat/quick-replies")
      .then((r) => r.json())
      .then((data) => { setReplies(data); setLoading(false); });
  }, []);

  async function addReply() {
    if (!newQ.trim() || !newA.trim()) return;
    setSaving(true);
    const res = await fetch("/api/admin/chat/quick-replies", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ question: newQ, answer: newA, category: newCat, order: replies.length }),
    });
    const reply = await res.json();
    setReplies((prev) => [...prev, reply]);
    setNewQ("");
    setNewA("");
    setNewCat("GENEL");
    setSaving(false);
  }

  async function deleteReply(id: string) {
    await fetch(`/api/admin/chat/quick-replies/${id}`, { method: "DELETE" });
    setReplies((prev) => prev.filter((r) => r.id !== id));
  }

  async function toggleActive(id: string, isActive: boolean) {
    await fetch(`/api/admin/chat/quick-replies/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isActive }),
    });
    setReplies((prev) => prev.map((r) => (r.id === id ? { ...r, isActive } : r)));
  }

  async function saveEdit(id: string) {
    await fetch(`/api/admin/chat/quick-replies/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ question: editQ, answer: editA, category: editCat }),
    });
    setReplies((prev) =>
      prev.map((r) => (r.id === id ? { ...r, question: editQ, answer: editA, category: editCat } : r))
    );
    setEditId(null);
  }

  const visibleReplies = filterCat === "TUMU" ? replies : replies.filter((r) => r.category === filterCat);

  if (loading) return <div className="p-8 text-center text-gray-400">Yükleniyor…</div>;

  return (
    <div className="p-6 space-y-6">
      {/* ── Yeni Ekle ── */}
      <div>
        <h3 className="font-semibold text-gray-800 mb-1">Hızlı Yanıt Ekle</h3>
        <p className="text-sm text-gray-500 mb-4">
          Chat penceresinde görünen hazır soru/cevap kartları. Kategori seçerek hangi müşteri grubuna gösterileceğini belirleyin.
        </p>
        <div className="bg-gray-50 rounded-xl p-4 space-y-3">
          {/* Kategori seçimi */}
          <div className="flex gap-2 flex-wrap">
            {(Object.keys(CATEGORY_META) as QuickReplyCategory[]).map((cat) => (
              <button
                key={cat}
                onClick={() => setNewCat(cat)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium border-2 transition-all ${
                  newCat === cat
                    ? "border-amber-400 " + CATEGORY_META[cat].color
                    : "border-transparent " + CATEGORY_META[cat].color + " opacity-50"
                }`}
              >
                {CATEGORY_META[cat].label}
              </button>
            ))}
          </div>
          <Input
            value={newQ}
            onChange={(e) => setNewQ(e.target.value)}
            placeholder="Soru (örn. Kargo süresi nedir?)"
          />
          <textarea
            value={newA}
            onChange={(e) => setNewA(e.target.value)}
            placeholder="Bot yanıtı…"
            rows={3}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 resize-none"
          />
          <Button
            onClick={addReply}
            disabled={saving || !newQ.trim() || !newA.trim()}
            className="flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Ekle
          </Button>
        </div>
      </div>

      {/* ── Liste ── */}
      <div>
        <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
          <h3 className="font-semibold text-gray-800">Mevcut Hızlı Yanıtlar ({replies.length})</h3>
          {/* Kategori filtresi */}
          <div className="flex gap-1.5 flex-wrap">
            <button
              onClick={() => setFilterCat("TUMU")}
              className={`px-2.5 py-1 rounded-full text-xs font-medium transition-colors ${filterCat === "TUMU" ? "bg-gray-800 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}
            >
              Tümü
            </button>
            {(Object.keys(CATEGORY_META) as QuickReplyCategory[]).map((cat) => (
              <button
                key={cat}
                onClick={() => setFilterCat(cat)}
                className={`px-2.5 py-1 rounded-full text-xs font-medium transition-colors ${
                  filterCat === cat
                    ? "ring-2 ring-offset-1 ring-amber-400 " + CATEGORY_META[cat].color
                    : CATEGORY_META[cat].color + " opacity-70 hover:opacity-100"
                }`}
              >
                {CATEGORY_META[cat].label}
              </button>
            ))}
          </div>
        </div>

        {visibleReplies.length === 0 && (
          <p className="text-sm text-gray-400 text-center py-8 border-2 border-dashed rounded-xl">
            {filterCat === "TUMU" ? "Henüz hızlı yanıt eklenmedi." : "Bu kategoride yanıt yok."}
          </p>
        )}
        <div className="space-y-3">
          {visibleReplies.map((r) => (
            <div
              key={r.id}
              className={`border rounded-xl p-4 transition-opacity ${r.isActive ? "border-gray-200 bg-white" : "border-gray-100 bg-gray-50 opacity-60"}`}
            >
              {editId === r.id ? (
                <div className="space-y-2">
                  {/* Düzenleme: kategori seçimi */}
                  <div className="flex gap-2 flex-wrap">
                    {(Object.keys(CATEGORY_META) as QuickReplyCategory[]).map((cat) => (
                      <button
                        key={cat}
                        onClick={() => setEditCat(cat)}
                        className={`px-2.5 py-1 rounded-full text-xs font-medium border-2 transition-all ${
                          editCat === cat
                            ? "border-amber-400 " + CATEGORY_META[cat].color
                            : "border-transparent " + CATEGORY_META[cat].color + " opacity-50"
                        }`}
                      >
                        {CATEGORY_META[cat].label}
                      </button>
                    ))}
                  </div>
                  <Input value={editQ} onChange={(e) => setEditQ(e.target.value)} />
                  <textarea
                    value={editA}
                    onChange={(e) => setEditA(e.target.value)}
                    rows={3}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 resize-none"
                  />
                  <div className="flex gap-2">
                    <Button onClick={() => saveEdit(r.id)} className="flex items-center gap-1">
                      <Check className="w-3.5 h-3.5" /> Kaydet
                    </Button>
                    <Button variant="secondary" onClick={() => setEditId(null)}>İptal</Button>
                  </div>
                </div>
              ) : (
                <div className="flex gap-3">
                  <div className="flex-1 min-w-0">
                    {/* Kategori badge */}
                    <span className={`inline-block text-xs font-medium px-2 py-0.5 rounded-full mb-1.5 ${CATEGORY_META[r.category]?.color ?? "bg-gray-100 text-gray-600"}`}>
                      {CATEGORY_META[r.category]?.label ?? r.category}
                    </span>
                    <p className="font-medium text-sm text-gray-900">{r.question}</p>
                    <p className="text-sm text-gray-500 mt-1 line-clamp-2">{r.answer}</p>
                  </div>
                  <div className="flex items-start gap-1 flex-shrink-0">
                    <button
                      onClick={() => { setEditId(r.id); setEditQ(r.question); setEditA(r.answer); setEditCat(r.category); }}
                      className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600"
                      title="Düzenle"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => toggleActive(r.id, !r.isActive)}
                      className={`p-1.5 rounded-lg hover:bg-gray-100 ${r.isActive ? "text-green-500" : "text-gray-400"}`}
                      title={r.isActive ? "Pasif yap" : "Aktif yap"}
                    >
                      <Circle className="w-4 h-4" fill={r.isActive ? "currentColor" : "none"} />
                    </button>
                    <button
                      onClick={() => deleteReply(r.id)}
                      className="p-1.5 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-500"
                      title="Sil"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Main Dashboard ───────────────────────────────────────────────────────────

export function ChatDashboard() {
  const [tab, setTab] = useState<"sessions" | "quick-replies">("sessions");
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [loadingMsgs, setLoadingMsgs] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const pollRef = useRef<NodeJS.Timeout | null>(null);
  const sessionPollRef = useRef<NodeJS.Timeout | null>(null);

  const selectedSession = sessions.find((s) => s.id === selectedId) ?? null;

  // ── Sessions polling ──────────────────────────────────────────────────────
  const loadSessions = useCallback(async (silent = false) => {
    if (!silent) setRefreshing(true);
    const res = await fetch("/api/admin/chat/sessions");
    const data = await res.json();
    setSessions(Array.isArray(data) ? data : []);
    if (!silent) setRefreshing(false);
  }, []);

  useEffect(() => {
    loadSessions();
    sessionPollRef.current = setInterval(() => loadSessions(true), 10_000);
    return () => {
      if (sessionPollRef.current) clearInterval(sessionPollRef.current);
    };
  }, [loadSessions]);

  // ── Messages polling ──────────────────────────────────────────────────────
  const loadMessages = useCallback(async (sessionId: string, silent = false) => {
    if (!silent) setLoadingMsgs(true);
    const res = await fetch(`/api/admin/chat/${sessionId}/messages`);
    const data = await res.json();
    setMessages(Array.isArray(data) ? data : []);
    if (!silent) setLoadingMsgs(false);
  }, []);

  useEffect(() => {
    if (pollRef.current) clearInterval(pollRef.current);
    if (!selectedId) return;

    loadMessages(selectedId);

    pollRef.current = setInterval(async () => {
      const res = await fetch(`/api/admin/chat/${selectedId}/messages`);
      const data = await res.json();
      if (Array.isArray(data)) {
        setMessages(data);
        // Update unread count in sessions list
        setSessions((prev) =>
          prev.map((s) => s.id === selectedId ? { ...s, _count: { messages: 0 } } : s)
        );
      }
    }, 3_000);

    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, [selectedId, loadMessages]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function sendMessage() {
    if (!input.trim() || !selectedId || sending) return;
    setSending(true);
    const content = input.trim();
    setInput("");

    const res = await fetch(`/api/admin/chat/${selectedId}/messages`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content }),
    });

    if (res.ok) {
      const msg = await res.json();
      setMessages((prev) => [...prev, msg]);
      setSessions((prev) =>
        prev.map((s) =>
          s.id === selectedId ? { ...s, status: "ACTIVE", messages: [msg] } : s
        )
      );
    }
    setSending(false);
  }

  async function closeSession(sessionId: string) {
    await fetch(`/api/admin/chat/${sessionId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "CLOSED" }),
    });
    setSessions((prev) =>
      prev.map((s) => (s.id === sessionId ? { ...s, status: "CLOSED" } : s))
    );
  }

  const waitingCount = sessions.filter((s) => s.status === "WAITING").length;

  return (
    <div className="flex flex-col h-full">
      {/* Tab bar */}
      <div className="flex items-center border-b border-gray-200 bg-white px-6 pt-2">
        <button
          onClick={() => setTab("sessions")}
          className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors mr-1 flex items-center gap-2 ${
            tab === "sessions"
              ? "border-amber-500 text-amber-600"
              : "border-transparent text-gray-500 hover:text-gray-700"
          }`}
        >
          <MessageSquare className="w-4 h-4" />
          Sohbetler
          {waitingCount > 0 && (
            <span className="bg-amber-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold animate-pulse">
              {waitingCount}
            </span>
          )}
        </button>
        <button
          onClick={() => setTab("quick-replies")}
          className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors flex items-center gap-2 ${
            tab === "quick-replies"
              ? "border-amber-500 text-amber-600"
              : "border-transparent text-gray-500 hover:text-gray-700"
          }`}
        >
          <Zap className="w-4 h-4" />
          Hızlı Yanıtlar
        </button>
        <div className="ml-auto pb-2">
          <button
            onClick={() => loadSessions()}
            className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100"
            title="Yenile"
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? "animate-spin" : ""}`} />
          </button>
        </div>
      </div>

      {/* Content */}
      {tab === "quick-replies" ? (
        <div className="flex-1 overflow-y-auto">
          <QuickRepliesTab />
        </div>
      ) : (
        <div className="flex flex-1 overflow-hidden">
          {/* Sessions list */}
          <div className="w-72 flex-shrink-0 border-r border-gray-200 overflow-y-auto bg-white">
            {sessions.length === 0 ? (
              <div className="p-8 text-center">
                <MessageSquare className="w-10 h-10 text-gray-200 mx-auto mb-3" />
                <p className="text-sm text-gray-400">Henüz sohbet yok</p>
              </div>
            ) : (
              sessions.map((s) => (
                <SessionListItem
                  key={s.id}
                  session={s}
                  isActive={s.id === selectedId}
                  onClick={() => setSelectedId(s.id)}
                />
              ))
            )}
          </div>

          {/* Chat area */}
          {!selectedSession ? (
            <div className="flex-1 flex items-center justify-center bg-gray-50">
              <div className="text-center">
                <MessageSquare className="w-14 h-14 text-gray-200 mx-auto mb-4" />
                <p className="text-gray-400 text-sm">Bir sohbet seçin</p>
              </div>
            </div>
          ) : (
            <div className="flex-1 flex flex-col bg-gray-50 overflow-hidden">
              {/* Session header */}
              <div className="px-5 py-3 bg-white border-b border-gray-200 flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-amber-100 flex items-center justify-center flex-shrink-0">
                  <User className="w-5 h-5 text-amber-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm text-gray-900">
                    {visitorLabel(selectedSession)}
                  </p>
                  {selectedSession.visitorEmail && (
                    <p className="text-xs text-gray-500">{selectedSession.visitorEmail}</p>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${statusColor(selectedSession.status)}`}>
                    {statusLabel(selectedSession.status)}
                  </span>
                  {selectedSession.status !== "CLOSED" && (
                    <button
                      onClick={() => closeSession(selectedSession.id)}
                      className="text-xs text-gray-400 hover:text-red-500 flex items-center gap-1 px-2 py-1 rounded-lg hover:bg-red-50"
                      title="Sohbeti kapat"
                    >
                      <X className="w-3.5 h-3.5" />
                      Kapat
                    </button>
                  )}
                </div>
                <div className="text-xs text-gray-400 flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {fmtDate(selectedSession.createdAt)}
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-5">
                {loadingMsgs ? (
                  <div className="text-center py-8 text-gray-400 text-sm">Yükleniyor…</div>
                ) : messages.length === 0 ? (
                  <div className="text-center py-8 text-gray-400 text-sm">Henüz mesaj yok</div>
                ) : (
                  messages.map((msg) => <MessageBubble key={msg.id} msg={msg} />)
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Input */}
              {selectedSession.status !== "CLOSED" ? (
                <div className="px-4 py-3 bg-white border-t border-gray-200">
                  <div className="flex gap-2">
                    <textarea
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && !e.shiftKey) {
                          e.preventDefault();
                          sendMessage();
                        }
                      }}
                      placeholder="Yanıtınızı yazın… (Enter: gönder, Shift+Enter: yeni satır)"
                      rows={2}
                      className="flex-1 border border-gray-300 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 resize-none"
                    />
                    <button
                      onClick={sendMessage}
                      disabled={!input.trim() || sending}
                      className="w-10 h-10 rounded-xl flex items-center justify-center transition-opacity disabled:opacity-40 flex-shrink-0 self-end"
                      style={{ background: "linear-gradient(135deg, #C57930, #F9B10B)" }}
                    >
                      <Send className="w-4 h-4 text-white" />
                    </button>
                  </div>
                </div>
              ) : (
                <div className="px-4 py-3 bg-gray-100 border-t border-gray-200 text-center text-sm text-gray-400">
                  Bu sohbet kapatıldı.
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
