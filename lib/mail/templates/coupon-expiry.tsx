import * as React from "react";
import { EmailLayout, EmailIcon, EmailTitle, EmailBody, EmailButton, HONEY, HONEY_DARK } from "./email-layout";
import type { EmailTemplateContent } from "../template-content";

interface Props {
  name: string;
  couponCode: string;
  discountLabel: string;
  expiresAt: string;
  daysLeft: number;
  shopUrl: string;
  content: EmailTemplateContent;
  appUrl: string;
}

export function CouponExpiryTemplate({ name, couponCode, discountLabel, expiresAt, daysLeft, shopUrl, content, appUrl }: Props) {
  return (
    <EmailLayout appUrl={appUrl}>
      <EmailIcon>
        <svg width="80" height="80" viewBox="0 0 80 80" fill="none" stroke="#1a1a1a" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" xmlns="http://www.w3.org/2000/svg">
          {/* Ticket shape */}
          <path d="M10 26 L10 54 Q10 58 14 58 L66 58 Q70 58 70 54 L70 48 Q64 48 64 42 Q64 36 70 36 L70 30 Q70 26 66 26 L14 26 Q10 26 10 30 Z" />
          {/* Coupon lines */}
          <line x1="30" y1="38" x2="30" y2="50" strokeDasharray="3,3" />
          {/* Percent sign */}
          <line x1="38" y1="46" x2="48" y2="36" />
          <circle cx="38" cy="36" r="3" />
          <circle cx="48" cy="46" r="3" />
          {/* Clock hand */}
          <circle cx="18" cy="20" r="7" />
          <polyline points="18,15 18,20 22,22" />
        </svg>
      </EmailIcon>
      <EmailTitle>{content.title}</EmailTitle>
      <EmailBody>
        <strong>Merhaba {name},</strong>
        <br />
        <strong>{daysLeft} gün</strong> içinde süresi dolacak kuponunuz var.
        <br />
        {content.body}
      </EmailBody>

      {/* Coupon box */}
      <div
        style={{
          background: "#FFF8E7",
          border: `2px dashed ${HONEY}`,
          borderRadius: 12,
          padding: "20px",
          textAlign: "center",
          margin: "8px 0 20px",
        }}
      >
        <p style={{ margin: "0 0 4px", fontSize: 11, color: "#aaa", textTransform: "uppercase", letterSpacing: 2 }}>
          Kupon Kodu
        </p>
        <p style={{ margin: "0 0 8px", fontSize: 28, fontWeight: 900, letterSpacing: 6, color: HONEY_DARK }}>
          {couponCode}
        </p>
        <p style={{ margin: "0 0 6px", fontSize: 15, fontWeight: 600, color: "#333" }}>{discountLabel}</p>
        <p style={{ margin: 0, fontSize: 12, color: "#e53e3e" }}>Son kullanım: {expiresAt}</p>
      </div>

      <EmailButton href={shopUrl}>{content.buttonText ?? "Hemen Kullan"}</EmailButton>
    </EmailLayout>
  );
}
