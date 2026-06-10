import * as React from "react";

const HONEY = "#F9B10B";
const HONEY_DARK = "#C57930";

interface EmailLayoutProps {
  children: React.ReactNode;
  appUrl: string;
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

export function EmailLayout({ children, appUrl }: EmailLayoutProps) {
  return (
    <div
      style={{
        fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif",
        maxWidth: 600,
        margin: "0 auto",
        background: "#f4f4f4",
      }}
    >
      {/* ── HEADER ── */}
      <div style={{ background: HONEY, textAlign: "center", padding: "28px 32px 0" }}>
        {/* Logo text — white on honey */}
        <div style={{ marginBottom: 0 }}>
          <div
            style={{
              display: "inline-block",
              border: "2px solid rgba(255,255,255,0.6)",
              borderRadius: 100,
              padding: "2px 12px",
              fontSize: 10,
              letterSpacing: 3,
              color: "rgba(255,255,255,0.9)",
              textTransform: "uppercase" as const,
              marginBottom: 6,
            }}
          >
            1973 · KOZAN
          </div>
        </div>
        <div
          style={{
            fontSize: 32,
            fontWeight: 900,
            color: "#fff",
            letterSpacing: 1,
            lineHeight: "1.05",
            fontFamily: "'Arial Black', 'Arial Bold', Arial, sans-serif",
            textTransform: "uppercase" as const,
          }}
        >
          KOOPERATİF
          <br />
          BALI
        </div>
        <div
          style={{
            fontSize: 17,
            fontWeight: 700,
            color: "#fff",
            marginTop: 4,
            marginBottom: 0,
            fontFamily: "Georgia, serif",
            fontStyle: "italic" as const,
          }}
        >
          Binboğa
          <span style={{ fontSize: 10, verticalAlign: "super" }}>®</span>
        </div>
      </div>

      {/* ── WAVE TRANSITION ── */}
      <div style={{ background: HONEY, lineHeight: 0, fontSize: 0 }}>
        <svg
          viewBox="0 0 600 50"
          width="600"
          height="50"
          xmlns="http://www.w3.org/2000/svg"
          style={{ display: "block", width: "100%" }}
        >
          <rect fill="#ffffff" width="600" height="50" />
          <path
            d="M0,0 L600,0 L600,18 Q450,12 300,48 Q150,12 0,18 Z"
            fill={HONEY}
          />
        </svg>
      </div>

      {/* ── BODY ── */}
      <div style={{ background: "#ffffff", padding: "0 40px 36px" }}>{children}</div>

      {/* ── FOOTER ── */}
      <div
        style={{
          background: "#ffffff",
          borderTop: "1px solid #f0f0f0",
          padding: "16px 40px 24px",
          display: "flex" as const,
        }}
      >
        <table width="100%" cellPadding="0" cellSpacing="0" style={{ borderCollapse: "collapse" }}>
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
              <td style={{ textAlign: "right" as const, verticalAlign: "middle", whiteSpace: "nowrap" as const }}>
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
        display: "flex" as const,
        justifyContent: "center" as const,
        alignItems: "center" as const,
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
