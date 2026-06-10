import * as React from "react";
import { EmailLayout, EmailIcon, EmailTitle, EmailBody, HONEY } from "./email-layout";
import type { EmailTemplateContent } from "../template-content";

interface DiscountedProduct {
  name: string;
  oldPrice: number;
  newPrice: number;
  productUrl: string;
}

interface Props {
  name: string;
  products: DiscountedProduct[];
  content: EmailTemplateContent;
  appUrl: string;
}

export function FavoriteDiscountTemplate({ name, products, content, appUrl }: Props) {
  return (
    <EmailLayout appUrl={appUrl}>
      <EmailIcon>
        <svg width="80" height="80" viewBox="0 0 80 80" fill="none" stroke="#1a1a1a" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" xmlns="http://www.w3.org/2000/svg">
          {/* Heart */}
          <path d="M40 64 Q14 48 14 30 Q14 16 26 14 Q34 14 40 22 Q46 14 54 14 Q66 16 66 30 Q66 48 40 64 Z" />
          {/* Percent sign */}
          <line x1="34" y1="44" x2="46" y2="32" />
          <circle cx="34" cy="32" r="3" />
          <circle cx="46" cy="44" r="3" />
        </svg>
      </EmailIcon>
      <EmailTitle>{content.title}</EmailTitle>
      <EmailBody>
        <strong>Merhaba {name},</strong>
        <br />
        {content.body}
      </EmailBody>

      {products.map((p, i) => (
        <div
          key={i}
          style={{
            border: "1.5px solid #f0f0f0",
            borderRadius: 10,
            padding: "16px 20px",
            margin: "10px 0",
            background: "#fafafa",
          }}
        >
          <p style={{ margin: "0 0 8px", fontWeight: 700, color: "#1a1a1a", fontSize: 15 }}>{p.name}</p>
          <p style={{ margin: "0 0 10px", fontSize: 14 }}>
            <span style={{ textDecoration: "line-through", color: "#bbb", marginRight: 8 }}>
              {p.oldPrice.toFixed(2)} ₺
            </span>
            <span style={{ color: "#38a169", fontWeight: 800, fontSize: 17 }}>{p.newPrice.toFixed(2)} ₺</span>
          </p>
          <a
            href={p.productUrl}
            style={{
              display: "inline-block",
              background: HONEY,
              color: "#fff",
              padding: "8px 20px",
              borderRadius: 100,
              textDecoration: "none",
              fontWeight: 700,
              fontSize: 13,
            }}
          >
            Ürünü İncele
          </a>
        </div>
      ))}
    </EmailLayout>
  );
}
