import * as React from "react";
import { EmailLayout, EmailIcon, EmailTitle, EmailBody, HONEY } from "./email-layout";
import type { EmailTemplateContent } from "../template-content";

interface OrderItem {
  productName: string;
  variantInfo: string;
  reviewUrl: string;
}

interface Props {
  name: string;
  orderNumber: string;
  items: OrderItem[];
  content: EmailTemplateContent;
  appUrl: string;
}

export function ReviewRequestTemplate({ name, orderNumber, items, content, appUrl }: Props) {
  return (
    <EmailLayout appUrl={appUrl}>
      <EmailIcon>
        <svg width="80" height="80" viewBox="0 0 80 80" fill="none" stroke="#1a1a1a" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" xmlns="http://www.w3.org/2000/svg">
          {/* Star */}
          <polygon points="40,10 47,30 70,30 52,45 58,66 40,52 22,66 28,45 10,30 33,30" />
          {/* Pencil */}
          <path d="M60 55 L68 47 L73 52 L65 60 Z" />
          <line x1="62" y1="57" x2="70" y2="49" />
          <line x1="60" y1="60" x2="65" y2="60" />
        </svg>
      </EmailIcon>
      <EmailTitle>{content.title}</EmailTitle>
      <EmailBody>
        <strong>Merhaba {name},</strong>
        <br />
        <strong>{orderNumber}</strong> siparişinizdeki ürünler için{" "}
        {content.body}
      </EmailBody>

      {items.map((item, i) => (
        <div
          key={i}
          style={{
            border: "1.5px solid #f0f0f0",
            borderRadius: 10,
            padding: "14px 18px",
            margin: "10px 0",
            background: "#fafafa",
            display: "flex" as const,
            justifyContent: "space-between" as const,
            alignItems: "center" as const,
          }}
        >
          <div style={{ flex: 1, paddingRight: 12 }}>
            <p style={{ margin: "0 0 3px", fontWeight: 700, color: "#1a1a1a", fontSize: 14 }}>{item.productName}</p>
            {item.variantInfo && (
              <p style={{ margin: 0, fontSize: 12, color: "#aaa" }}>{item.variantInfo}</p>
            )}
          </div>
          <a
            href={item.reviewUrl}
            style={{
              display: "inline-block",
              background: HONEY,
              color: "#fff",
              padding: "8px 18px",
              borderRadius: 100,
              textDecoration: "none",
              fontWeight: 700,
              fontSize: 12,
              whiteSpace: "nowrap" as const,
            }}
          >
            Yorum Yaz
          </a>
        </div>
      ))}
    </EmailLayout>
  );
}
