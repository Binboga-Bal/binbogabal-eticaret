import * as React from "react";
import { EmailLayout, EmailIcon, EmailTitle, EmailBody, EmailButton, EmailNote, HONEY_DARK } from "./email-layout";
import type { EmailTemplateContent } from "../template-content";

interface Props {
  name: string;
  acceptUrl: string;
  adminPanelUrl: string;
  content: EmailTemplateContent;
  appUrl: string;
}

export function AdminInviteTemplate({ name, acceptUrl, adminPanelUrl, content, appUrl }: Props) {
  const lines = content.body.split("\n").filter(Boolean);
  return (
    <EmailLayout appUrl={appUrl}>
      <EmailIcon>
        <svg width="80" height="80" viewBox="0 0 80 80" fill="none" stroke="#1a1a1a" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" xmlns="http://www.w3.org/2000/svg">
          {/* Person */}
          <circle cx="40" cy="30" r="12" />
          <path d="M20 70 Q20 52 40 52 Q60 52 60 70" />
          {/* Crown */}
          <polyline points="28,24 32,16 40,22 48,16 52,24" />
          <line x1="28" y1="24" x2="52" y2="24" />
        </svg>
      </EmailIcon>
      <EmailTitle>{content.title}</EmailTitle>
      <EmailBody>
        <strong>Merhaba {name},</strong>
        <br />
        {lines.map((line, i) => (
          <React.Fragment key={i}>
            {line}
            {i < lines.length - 1 && <br />}
          </React.Fragment>
        ))}
      </EmailBody>
      <EmailButton href={acceptUrl}>{content.buttonText ?? "Daveti Kabul Et"}</EmailButton>
      {content.note && <EmailNote>{content.note}</EmailNote>}

      {/* Admin panel URL */}
      <div
        style={{
          background: "#f3f4f6",
          borderRadius: 8,
          padding: "12px 16px",
          margin: "16px 0 8px",
          textAlign: "center" as const,
        }}
      >
        <p style={{ margin: "0 0 4px", fontSize: 11, color: "#999", textTransform: "uppercase" as const, letterSpacing: 1 }}>
          Admin Panel Adresi
        </p>
        <a href={adminPanelUrl} style={{ color: HONEY_DARK, fontSize: 13, wordBreak: "break-all" as const, textDecoration: "none" }}>
          {adminPanelUrl}
        </a>
      </div>

      {/* Security note */}
      <div
        style={{
          background: "#fef2f2",
          border: "1px solid #fecaca",
          borderRadius: 8,
          padding: "12px 16px",
          margin: "12px 0 0",
        }}
      >
        <p style={{ margin: 0, color: "#991b1b", fontSize: 12, lineHeight: "1.6" }}>
          🔒 <strong>Güvenlik Uyarısı:</strong> Bu daveti başka biriyle paylaşmayın.
          Admin paneline erişim yüksek düzey izinler gerektirir.
        </p>
      </div>
    </EmailLayout>
  );
}
