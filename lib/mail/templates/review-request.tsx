import * as React from "react";
import { EmailLayout, EmailIcon, EmailTitle, EmailBody, HONEY } from "./email-layout";
import type { EmailTemplateContent } from "../template-content";

interface OrderItem {
  productName: string;
  variantInfo: string;
  reviewUrl: string;
  imageUrl?: string;
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
        <table key={i} width="100%" cellPadding={0} cellSpacing={0} border={0} role="presentation"
          style={{ borderCollapse: "collapse", border: "1.5px solid #f0f0f0", borderRadius: "10px", margin: "10px 0", backgroundColor: "#fafafa" }}>
          <tbody>
            <tr>
              {/* Küçük ürün fotoğrafı */}
              <td style={{ padding: "12px 8px 12px 14px", width: "60px", verticalAlign: "middle" }}>
                {item.imageUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={item.imageUrl}
                    alt={item.productName}
                    width={48}
                    height={48}
                    style={{ display: "block", width: "48px", height: "48px", border: "1px solid #eeeeee", borderRadius: "6px", backgroundColor: "#ffffff" }}
                  />
                ) : (
                  <table cellPadding={0} cellSpacing={0} border={0} role="presentation" style={{ width: "48px", height: "48px" }}>
                    <tbody><tr><td style={{ backgroundColor: "#f0f0f0", borderRadius: "6px" }} /></tr></tbody>
                  </table>
                )}
              </td>
              {/* Ürün adı */}
              <td style={{ padding: "12px 8px 12px 6px", verticalAlign: "middle" }}>
                <p style={{ margin: "0 0 2px", fontWeight: 700, color: "#1a1a1a", fontSize: "14px", fontFamily: "'Helvetica Neue', Arial, sans-serif" }}>{item.productName}</p>
                {item.variantInfo && (
                  <p style={{ margin: 0, fontSize: "12px", color: "#aaa", fontFamily: "'Helvetica Neue', Arial, sans-serif" }}>{item.variantInfo}</p>
                )}
              </td>
              {/* Yorum butonu */}
              <td style={{ padding: "12px 14px 12px 8px", verticalAlign: "middle", whiteSpace: "nowrap" as const }}>
                <a
                  href={item.reviewUrl}
                  style={{
                    display: "inline-block",
                    backgroundColor: HONEY,
                    color: "#ffffff",
                    padding: "8px 18px",
                    borderRadius: "100px",
                    textDecoration: "none",
                    fontWeight: 700,
                    fontSize: "12px",
                    fontFamily: "'Helvetica Neue', Arial, sans-serif",
                  }}
                >
                  Yorum Yaz
                </a>
              </td>
            </tr>
          </tbody>
        </table>
      ))}
    </EmailLayout>
  );
}
