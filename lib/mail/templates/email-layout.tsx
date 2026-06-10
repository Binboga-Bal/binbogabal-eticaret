import * as React from "react";
import type { EmailInfographic, InfographicIconKey } from "../infographic-types";
import { DEFAULT_INFOGRAPHIC } from "../infographic-types";

const HONEY = "#F9B10B";
const HONEY_DARK = "#C57930";

interface EmailLayoutProps {
  children: React.ReactNode;
  appUrl: string;
  infographic?: EmailInfographic;
}

function SocialIcon({ href, title, children }: { href: string; title: string; children: React.ReactNode }) {
  return (
    <a
      href={href}
      title={title}
      style={{ display: "inline-block", margin: "0 4px", color: "#555", textDecoration: "none" }}
    >
      {children}
    </a>
  );
}

function InfographicSvg({ icon }: { icon: InfographicIconKey }) {
  const props = {
    width: 30,
    height: 30,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: HONEY_DARK,
    strokeWidth: "1.8",
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    xmlns: "http://www.w3.org/2000/svg",
  };
  switch (icon) {
    case "honey":
      return (
        <svg {...props}>
          <path d="M8 3h8l1 3H7z" />
          <rect x="6" y="6" width="12" height="14" rx="3" />
          <path d="M12 10v4M10 12h4" />
        </svg>
      );
    case "leaf":
      return (
        <svg {...props}>
          <path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10z" />
          <path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12" />
        </svg>
      );
    case "shield":
      return (
        <svg {...props}>
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
          <polyline points="9 12 11 14 15 10" />
        </svg>
      );
    case "truck":
      return (
        <svg {...props}>
          <rect x="1" y="3" width="15" height="13" />
          <polygon points="16 8 20 8 23 11 23 16 16 16 16 8" />
          <circle cx="5.5" cy="18.5" r="2.5" />
          <circle cx="18.5" cy="18.5" r="2.5" />
        </svg>
      );
    case "star":
      return (
        <svg {...props}>
          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
        </svg>
      );
    case "heart":
      return (
        <svg {...props}>
          <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
        </svg>
      );
    case "check":
      return (
        <svg {...props}>
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
          <polyline points="9 12 11 14 15 10" />
        </svg>
      );
    case "gift":
      return (
        <svg {...props}>
          <polyline points="20 12 20 22 4 22 4 12" />
          <rect x="2" y="7" width="20" height="5" />
          <line x1="12" y1="22" x2="12" y2="7" />
          <path d="M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7z" />
          <path d="M12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z" />
        </svg>
      );
    default:
      return (
        <svg {...props}>
          <circle cx="12" cy="12" r="10" />
          <polyline points="12 6 12 12 16 14" />
        </svg>
      );
  }
}

export function EmailLayout({ children, appUrl, infographic }: EmailLayoutProps) {
  const infog = infographic ?? DEFAULT_INFOGRAPHIC;

  return (
    <div
      style={{
        fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif",
        maxWidth: 600,
        margin: "0 auto",
        background: "#f4f4f4",
      }}
    >
      {/* ── HEADER: bal sarısı arka plan + logo ── */}
      <div
        style={{
          background: HONEY,
          textAlign: "center",
          padding: "28px 32px 0",
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={`${appUrl}/images/logo.png`}
          alt="Binboğa Kooperatif Balı"
          width={210}
          height={149}
          style={{
            display: "block",
            margin: "0 auto",
            maxWidth: 210,
            height: "auto",
          }}
        />
      </div>

      {/* ── DAMLACIK GEÇİŞİ ── */}
      <div style={{ background: HONEY, lineHeight: 0, fontSize: 0 }}>
        <svg
          viewBox="0 0 600 66"
          width="600"
          height="66"
          xmlns="http://www.w3.org/2000/svg"
          style={{ display: "block", width: "100%" }}
        >
          {/* Beyaz zemin */}
          <rect fill="#ffffff" width="600" height="66" />
          {/* Bal sarısı damlacık */}
          <path
            d="M 0,0 L 600,0 L 600,18 C 545,18 440,15 375,38 C 352,50 333,62 300,65 C 267,62 248,50 225,38 C 160,15 55,18 0,18 Z"
            fill={HONEY}
          />
        </svg>
      </div>

      {/* ── BODY ── */}
      <div style={{ background: "#ffffff", padding: "0 40px 36px" }}>{children}</div>

      {/* ── İNFOGRAFİK ── */}
      {infog.show && infog.items.length > 0 && (
        <div
          style={{
            background: "#ffffff",
            borderTop: "1px solid #f5f5f5",
            padding: "16px 24px 20px",
          }}
        >
          <table
            width="100%"
            cellPadding={0}
            cellSpacing={0}
            style={{ borderCollapse: "collapse" }}
          >
            <tbody>
              <tr>
                {infog.items.map((item, i) => (
                  <td
                    key={i}
                    align="center"
                    style={{
                      padding: "8px 6px",
                      width: `${Math.floor(100 / infog.items.length)}%`,
                      verticalAlign: "top",
                    }}
                  >
                    <div
                      style={{
                        display: "inline-block",
                        textAlign: "center",
                        padding: "10px 12px",
                        background: "#fffbf0",
                        borderRadius: 12,
                        border: `1px solid ${HONEY}33`,
                      }}
                    >
                      <InfographicSvg icon={item.icon} />
                      <div
                        style={{
                          fontSize: 11,
                          color: "#444",
                          marginTop: 6,
                          fontWeight: 700,
                          letterSpacing: 0.2,
                          lineHeight: "1.3",
                        }}
                      >
                        {item.text}
                      </div>
                    </div>
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
      )}

      {/* ── FOOTER ── */}
      <div
        style={{
          background: "#ffffff",
          borderTop: "1px solid #f0f0f0",
          padding: "16px 40px 24px",
        }}
      >
        <table width="100%" cellPadding={0} cellSpacing={0} style={{ borderCollapse: "collapse" }}>
          <tbody>
            <tr>
              <td
                style={{
                  fontSize: 11,
                  color: "#aaa",
                  verticalAlign: "middle",
                  paddingRight: 12,
                  lineHeight: "1.5",
                }}
              >
                Bu e-posta otomatik olarak gönderilmiştir,
                <br />
                lütfen yanıtlamayın.
              </td>
              <td
                style={{
                  textAlign: "right",
                  verticalAlign: "middle",
                  whiteSpace: "nowrap",
                }}
              >
                <SocialIcon href={`${appUrl}/redirect/facebook`} title="Facebook">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="#555" xmlns="http://www.w3.org/2000/svg">
                    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
                  </svg>
                </SocialIcon>
                <SocialIcon href={`${appUrl}/redirect/linkedin`} title="LinkedIn">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="#555" xmlns="http://www.w3.org/2000/svg">
                    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-4 0v7h-4v-7a6 6 0 0 1 6-6z" />
                    <rect x="2" y="9" width="4" height="12" />
                    <circle cx="4" cy="4" r="2" />
                  </svg>
                </SocialIcon>
                <SocialIcon href={`${appUrl}/redirect/instagram`} title="Instagram">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#555" strokeWidth="2" strokeLinecap="round" xmlns="http://www.w3.org/2000/svg">
                    <rect x="2" y="2" width="20" height="20" rx="5" />
                    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
                  </svg>
                </SocialIcon>
                <SocialIcon href={`${appUrl}/redirect/twitter`} title="X">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="#555" xmlns="http://www.w3.org/2000/svg">
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                  </svg>
                </SocialIcon>
                <SocialIcon href={`${appUrl}/redirect/whatsapp`} title="WhatsApp">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="#555" xmlns="http://www.w3.org/2000/svg">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                  </svg>
                </SocialIcon>
                <div style={{ fontSize: 10, color: "#aaa", marginTop: 4 }}>/binbogabal</div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* ─── Shared sub-components ─── */

export function EmailIcon({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ textAlign: "center", margin: "20px 0 8px" }}>
      {children}
    </div>
  );
}

export function EmailTitle({ children }: { children: React.ReactNode }) {
  return (
    <h1
      style={{
        fontSize: 22,
        fontWeight: 800,
        color: "#1a1a1a",
        textAlign: "center",
        margin: "4px 0 16px",
        lineHeight: "1.3",
      }}
    >
      {children}
    </h1>
  );
}

export function EmailBody({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        fontSize: 15,
        color: "#555",
        lineHeight: "1.7",
        textAlign: "center",
        margin: "0 0 24px",
      }}
    >
      {children}
    </div>
  );
}

export function EmailButton({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <div style={{ textAlign: "center", margin: "24px 0" }}>
      <a
        href={href}
        style={{
          display: "inline-block",
          background: HONEY,
          color: "#fff",
          padding: "14px 36px",
          borderRadius: 100,
          textDecoration: "none",
          fontWeight: 700,
          fontSize: 15,
          letterSpacing: 0.3,
        }}
      >
        {children}
      </a>
    </div>
  );
}

export function EmailNote({ children }: { children: React.ReactNode }) {
  return (
    <p
      style={{
        fontSize: 12,
        color: "#aaa",
        textAlign: "center",
        margin: "0 0 8px",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        gap: 4,
      }}
    >
      <svg
        width="13"
        height="13"
        viewBox="0 0 24 24"
        fill="none"
        stroke="#aaa"
        strokeWidth="2"
        strokeLinecap="round"
        xmlns="http://www.w3.org/2000/svg"
        style={{ flexShrink: 0 }}
      >
        <circle cx="12" cy="12" r="10" />
        <polyline points="12 6 12 12 16 14" />
      </svg>
      {children}
    </p>
  );
}

export function EmailDivider() {
  return (
    <hr
      style={{
        border: "none",
        borderTop: "1px solid #f0f0f0",
        margin: "24px 0",
      }}
    />
  );
}

export { HONEY, HONEY_DARK };
