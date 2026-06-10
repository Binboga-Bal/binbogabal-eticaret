import * as React from "react";
import { EmailLayout, EmailIcon, EmailTitle, EmailBody, EmailButton, HONEY, HONEY_DARK } from "./email-layout";
import type { EmailTemplateContent } from "../template-content";

interface Props {
  name: string;
  productName: string;
  reviewComment: string;
  adminReply: string;
  reviewUrl: string;
  content: EmailTemplateContent;
  appUrl: string;
}

export function ReviewReplyTemplate({ name, productName, reviewComment, adminReply, reviewUrl, content, appUrl }: Props) {
  return (
    <EmailLayout appUrl={appUrl}>
      <EmailIcon>
        <svg width="80" height="80" viewBox="0 0 80 80" fill="none" stroke="#1a1a1a" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" xmlns="http://www.w3.org/2000/svg">
          {/* First bubble */}
          <rect x="10" y="12" width="42" height="26" rx="8" />
          <path d="M14 38 L10 46 L22 40" />
          {/* Reply bubble */}
          <rect x="28" y="44" width="42" height="26" rx="8" />
          <path d="M66 70 L70 58 L58 64" />
          {/* Reply arrow */}
          <polyline points="34,57 38,52 34,47" strokeWidth="2" />
        </svg>
      </EmailIcon>
      <EmailTitle>{content.title}</EmailTitle>
      <EmailBody>
        <strong>Merhaba {name},</strong>
        <br />
        <strong>{productName}</strong> ürününe yazdığınız yoruma yanıt verildi.
        <br />
        {content.body}
      </EmailBody>

      {/* Original review */}
      <div
        style={{
          background: "#f9f9f9",
          borderLeft: "4px solid #ddd",
          borderRadius: "0 8px 8px 0",
          padding: "12px 16px",
          margin: "4px 0 12px",
        }}
      >
        <p style={{ margin: "0 0 4px", fontSize: 11, color: "#aaa", textTransform: "uppercase", letterSpacing: 1, fontWeight: 700 }}>
          Yorumunuz
        </p>
        <p style={{ margin: 0, color: "#666", fontStyle: "italic", fontSize: 14, lineHeight: "1.6" }}>{reviewComment}</p>
      </div>

      {/* Admin reply */}
      <div
        style={{
          background: "#FFF8E7",
          borderLeft: `4px solid ${HONEY}`,
          borderRadius: "0 8px 8px 0",
          padding: "12px 16px",
          margin: "0 0 20px",
        }}
      >
        <p style={{ margin: "0 0 4px", fontSize: 11, color: HONEY_DARK, textTransform: "uppercase", letterSpacing: 1, fontWeight: 700 }}>
          Satıcı Yanıtı
        </p>
        <p style={{ margin: 0, color: "#333", fontSize: 14, lineHeight: "1.6" }}>{adminReply}</p>
      </div>

      <EmailButton href={reviewUrl}>{content.buttonText ?? "Ürünü Görüntüle"}</EmailButton>
    </EmailLayout>
  );
}
