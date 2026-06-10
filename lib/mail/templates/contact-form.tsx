import * as React from "react";
import { EmailLayout, EmailTitle, HONEY, HONEY_DARK } from "./email-layout";
import type { EmailTemplateContent } from "../template-content";

interface Props {
  name: string;
  email: string;
  subject: string;
  message: string;
  content?: EmailTemplateContent;
  appUrl?: string;
}

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://binbogabal.com.tr";

export function ContactFormTemplate({ name, email, subject, message, content, appUrl }: Props) {
  const replySubject = encodeURIComponent(`Re: ${subject || "İletişim Formu"}`);
  const dateStr = new Date().toLocaleDateString("tr-TR", {
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <EmailLayout appUrl={appUrl ?? APP_URL}>
      {/* Badge */}
      <div style={{ textAlign: "center", margin: "16px 0 8px" }}>
        <span
          style={{
            display: "inline-block",
            background: `${HONEY}20`,
            color: HONEY_DARK,
            border: `1.5px solid ${HONEY}40`,
            borderRadius: 100,
            padding: "4px 14px",
            fontSize: 11,
            fontWeight: 700,
            letterSpacing: 1.5,
            textTransform: "uppercase" as const,
          }}
        >
          YENİ MESAJ
        </span>
      </div>

      <EmailTitle>{content?.title ?? "Yeni İletişim Mesajı"}</EmailTitle>

      <p style={{ fontSize: 12, color: "#aaa", textAlign: "center", margin: "0 0 20px" }}>{dateStr}</p>

      {/* Sender card */}
      <div
        style={{
          background: "#f3f4f6",
          borderRadius: 8,
          padding: "14px 18px",
          marginBottom: 16,
        }}
      >
        <p style={{ margin: "0 0 2px", fontSize: 11, color: "#999", textTransform: "uppercase" as const, letterSpacing: 1, fontWeight: 700 }}>
          Gönderen
        </p>
        <p style={{ margin: 0, fontWeight: 700, fontSize: 15, color: "#1a1a1a" }}>{name}</p>
        <a href={`mailto:${email}`} style={{ color: HONEY_DARK, fontSize: 13, textDecoration: "none" }}>
          {email}
        </a>
      </div>

      {/* Subject */}
      {subject && (
        <div style={{ background: "#f3f4f6", borderRadius: 8, padding: "12px 18px", marginBottom: 16 }}>
          <p style={{ margin: "0 0 2px", fontSize: 11, color: "#999", textTransform: "uppercase" as const, letterSpacing: 1, fontWeight: 700 }}>
            Konu
          </p>
          <p style={{ margin: 0, fontWeight: 600, fontSize: 15, color: "#1a1a1a" }}>{subject}</p>
        </div>
      )}

      {/* Message */}
      <div
        style={{
          background: "#fffbf3",
          borderLeft: `4px solid ${HONEY}`,
          borderRadius: "0 8px 8px 0",
          padding: "16px 20px",
          marginBottom: 24,
        }}
      >
        <p style={{ margin: "0 0 4px", fontSize: 11, color: "#999", textTransform: "uppercase" as const, letterSpacing: 1, fontWeight: 700 }}>
          Mesaj
        </p>
        <p style={{ margin: 0, fontSize: 14, color: "#333", lineHeight: "1.8", whiteSpace: "pre-wrap" as const }}>
          {message}
        </p>
      </div>

      {/* Reply button */}
      <div style={{ textAlign: "center", marginBottom: 8 }}>
        <a
          href={`mailto:${email}?subject=${replySubject}`}
          style={{
            display: "inline-block",
            background: HONEY,
            color: "#fff",
            padding: "13px 36px",
            borderRadius: 100,
            textDecoration: "none",
            fontWeight: 700,
            fontSize: 15,
          }}
        >
          Yanıtla
        </a>
      </div>
    </EmailLayout>
  );
}
