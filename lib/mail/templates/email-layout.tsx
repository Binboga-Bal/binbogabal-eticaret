import * as React from "react";
import type { EmailInfographic, InfographicIconKey } from "../infographic-types";
import { DEFAULT_INFOGRAPHIC } from "../infographic-types";

const HONEY = "#F9B10B";
const HONEY_DARK = "#C57930";
const FONT = "'Helvetica Neue', Helvetica, Arial, sans-serif";

interface EmailLayoutProps {
  children: React.ReactNode;
  appUrl: string;
  infographic?: EmailInfographic;
}

function SocialIcon({ href, title, children }: { href: string; title: string; children: React.ReactNode }) {
  return (
    <a href={href} title={title} style={{ display: "inline-block", margin: "0 3px", textDecoration: "none" }}>
      {children}
    </a>
  );
}

function InfographicSvg({ icon }: { icon: InfographicIconKey }) {
  const p = {
    width: 30,
    height: 30,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: HONEY_DARK,
    strokeWidth: "1.8",
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    xmlns: "http://www.w3.org/2000/svg",
    style: { display: "block" },
  };
  switch (icon) {
    case "honey":   return <svg {...p}><path d="M8 3h8l1 3H7z"/><rect x="6" y="6" width="12" height="14" rx="3"/><path d="M12 10v4M10 12h4"/></svg>;
    case "leaf":    return <svg {...p}><path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10z"/><path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12"/></svg>;
    case "shield":  return <svg {...p}><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><polyline points="9 12 11 14 15 10"/></svg>;
    case "truck":   return <svg {...p}><rect x="1" y="3" width="15" height="13"/><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></svg>;
    case "star":    return <svg {...p}><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>;
    case "heart":   return <svg {...p}><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>;
    case "check":   return <svg {...p}><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><polyline points="9 12 11 14 15 10"/></svg>;
    case "gift":    return <svg {...p}><polyline points="20 12 20 22 4 22 4 12"/><rect x="2" y="7" width="20" height="5"/><line x1="12" y1="22" x2="12" y2="7"/><path d="M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7z"/><path d="M12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z"/></svg>;
    default:        return <svg {...p}><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>;
  }
}

export function EmailLayout({ children, appUrl, infographic }: EmailLayoutProps) {
  const infog = infographic ?? DEFAULT_INFOGRAPHIC;

  return (
    /* Dış tablo: tam genişlik + Outlook'ta yatay ortalama */
    <table
      width="100%"
      cellPadding={0}
      cellSpacing={0}
      border={0}
      role="presentation"
      style={{ width: "100%", backgroundColor: "#f4f4f4" }}
    >
      <tbody>
        <tr>
          <td align="center" valign="top" style={{ padding: "20px 0" }}>

            {/* ── 600 px iç tablo ── */}
            <table
              width="600"
              cellPadding={0}
              cellSpacing={0}
              border={0}
              role="presentation"
              className="email-wrap"
              style={{ width: "600px", maxWidth: "600px", fontFamily: FONT }}
            >
              <tbody>

                {/* ── HEADER ── */}
                <tr>
                  <td
                    align="center"
                    style={{ backgroundColor: HONEY, padding: "20px 32px" }}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={`${appUrl}/images/logo.png`}
                      alt="Binboğa Kooperatif Balı"
                      width={130}
                      height={92}
                      style={{ display: "block", margin: "0 auto", maxWidth: "130px", height: "auto", border: 0 }}
                    />
                  </td>
                </tr>

                {/* ── BODY ── */}
                <tr>
                  <td style={{ backgroundColor: "#ffffff", padding: "0 40px 36px" }}>
                    {children}
                  </td>
                </tr>

                {/* ── İNFOGRAFİK ── */}
                {infog.show && infog.items.length > 0 && (
                  <tr>
                    <td style={{ backgroundColor: "#ffffff", borderTop: "1px solid #f5f5f5", padding: "16px 24px 20px" }}>
                      <table width="100%" cellPadding={0} cellSpacing={0} border={0} role="presentation">
                        <tbody>
                          <tr>
                            {infog.items.map((item, i) => (
                              <td
                                key={i}
                                align="center"
                                valign="top"
                                style={{ padding: "0 6px", width: `${Math.floor(100 / infog.items.length)}%` }}
                              >
                                <table cellPadding={0} cellSpacing={0} border={0} role="presentation" style={{ margin: "0 auto" }}>
                                  <tbody>
                                    <tr>
                                      <td align="center" style={{ padding: "10px 12px", backgroundColor: "#fffbf0", border: `1px solid ${HONEY}33`, borderRadius: "12px" }}>
                                        <table cellPadding={0} cellSpacing={0} border={0} role="presentation">
                                          <tbody>
                                            <tr><td align="center"><InfographicSvg icon={item.icon} /></td></tr>
                                            <tr>
                                              <td align="center" style={{ paddingTop: "6px", fontSize: "11px", color: "#444", fontWeight: 700, fontFamily: FONT, letterSpacing: "0.2px", lineHeight: "1.3", whiteSpace: "nowrap" }}>
                                                {item.text}
                                              </td>
                                            </tr>
                                          </tbody>
                                        </table>
                                      </td>
                                    </tr>
                                  </tbody>
                                </table>
                              </td>
                            ))}
                          </tr>
                        </tbody>
                      </table>
                    </td>
                  </tr>
                )}

                {/* ── FOOTER ── */}
                <tr>
                  <td style={{ backgroundColor: "#ffffff", borderTop: "1px solid #f0f0f0", padding: "16px 40px 24px" }}>
                    <table width="100%" cellPadding={0} cellSpacing={0} border={0} role="presentation">
                      <tbody>
                        <tr>
                          <td valign="middle" style={{ fontSize: "11px", color: "#aaa", paddingRight: "12px", lineHeight: "1.5", fontFamily: FONT }}>
                            Bu e-posta otomatik olarak gönderilmiştir,<br />
                            lütfen yanıtlamayın.
                          </td>
                          <td align="right" valign="middle" style={{ whiteSpace: "nowrap" }}>
                            <SocialIcon href={`${appUrl}/redirect/facebook`} title="Facebook">
                              <svg width="20" height="20" viewBox="0 0 24 24" fill="#555" xmlns="http://www.w3.org/2000/svg" style={{ display: "inline-block", verticalAlign: "middle" }}>
                                <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
                              </svg>
                            </SocialIcon>
                            <SocialIcon href={`${appUrl}/redirect/linkedin`} title="LinkedIn">
                              <svg width="20" height="20" viewBox="0 0 24 24" fill="#555" xmlns="http://www.w3.org/2000/svg" style={{ display: "inline-block", verticalAlign: "middle" }}>
                                <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-4 0v7h-4v-7a6 6 0 0 1 6-6z" />
                                <rect x="2" y="9" width="4" height="12" /><circle cx="4" cy="4" r="2" />
                              </svg>
                            </SocialIcon>
                            <SocialIcon href={`${appUrl}/redirect/instagram`} title="Instagram">
                              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#555" strokeWidth="2" strokeLinecap="round" xmlns="http://www.w3.org/2000/svg" style={{ display: "inline-block", verticalAlign: "middle" }}>
                                <rect x="2" y="2" width="20" height="20" rx="5" />
                                <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                                <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
                              </svg>
                            </SocialIcon>
                            <SocialIcon href={`${appUrl}/redirect/twitter`} title="X">
                              <svg width="20" height="20" viewBox="0 0 24 24" fill="#555" xmlns="http://www.w3.org/2000/svg" style={{ display: "inline-block", verticalAlign: "middle" }}>
                                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                              </svg>
                            </SocialIcon>
                            <SocialIcon href={`${appUrl}/redirect/whatsapp`} title="WhatsApp">
                              <svg width="20" height="20" viewBox="0 0 24 24" fill="#555" xmlns="http://www.w3.org/2000/svg" style={{ display: "inline-block", verticalAlign: "middle" }}>
                                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                              </svg>
                            </SocialIcon>
                            <br />
                            <span style={{ fontSize: "10px", color: "#aaa", fontFamily: FONT }}>/binbogabal</span>
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </td>
                </tr>

              </tbody>
            </table>
            {/* /600px inner table */}

          </td>
        </tr>
      </tbody>
    </table>
  );
}

/* ─── Shared sub-components ─── */

export function EmailIcon({ children }: { children: React.ReactNode }) {
  return (
    <table width="100%" cellPadding={0} cellSpacing={0} border={0} role="presentation">
      <tbody>
        <tr>
          <td align="center" style={{ padding: "20px 0 8px" }}>
            {children}
          </td>
        </tr>
      </tbody>
    </table>
  );
}

export function EmailTitle({ children }: { children: React.ReactNode }) {
  return (
    <table width="100%" cellPadding={0} cellSpacing={0} border={0} role="presentation">
      <tbody>
        <tr>
          <td align="center" style={{ paddingBottom: "16px" }}>
            <h1 style={{ fontSize: "22px", fontWeight: 800, color: "#1a1a1a", textAlign: "center", margin: "4px 0 0", lineHeight: "1.3", fontFamily: FONT }}>
              {children}
            </h1>
          </td>
        </tr>
      </tbody>
    </table>
  );
}

export function EmailBody({ children }: { children: React.ReactNode }) {
  return (
    <table width="100%" cellPadding={0} cellSpacing={0} border={0} role="presentation">
      <tbody>
        <tr>
          <td align="center" style={{ paddingBottom: "24px" }}>
            <div style={{ fontSize: "15px", color: "#555", lineHeight: "1.7", textAlign: "center", fontFamily: FONT }}>
              {children}
            </div>
          </td>
        </tr>
      </tbody>
    </table>
  );
}

export function EmailButton({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <table width="100%" cellPadding={0} cellSpacing={0} border={0} role="presentation">
      <tbody>
        <tr>
          <td align="center" style={{ padding: "24px 0" }}>
            {/*
              Outlook'ta border-radius çalışmaz; buton kare köşeli görünür ama
              işlevseldir. VML roundrect olmadan da okunabilir.
            */}
            <a
              href={href}
              style={{
                display: "inline-block",
                backgroundColor: HONEY,
                color: "#ffffff",
                padding: "14px 36px",
                borderRadius: "100px",
                textDecoration: "none",
                fontWeight: 700,
                fontSize: "15px",
                letterSpacing: "0.3px",
                fontFamily: FONT,
                msoHide: "all",
              } as React.CSSProperties}
            >
              {children}
            </a>
          </td>
        </tr>
      </tbody>
    </table>
  );
}

export function EmailNote({ children }: { children: React.ReactNode }) {
  return (
    <table width="100%" cellPadding={0} cellSpacing={0} border={0} role="presentation">
      <tbody>
        <tr>
          <td align="center" style={{ paddingBottom: "8px" }}>
            {/* flex yerine inline-block + verticalAlign — tüm istemcilerde çalışır */}
            <p style={{ margin: 0, padding: 0, fontSize: "12px", color: "#aaa", textAlign: "center", fontFamily: FONT }}>
              <svg
                width="13"
                height="13"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#aaa"
                strokeWidth="2"
                strokeLinecap="round"
                xmlns="http://www.w3.org/2000/svg"
                style={{ display: "inline-block", verticalAlign: "middle", marginRight: "4px" }}
              >
                <circle cx="12" cy="12" r="10" />
                <polyline points="12 6 12 12 16 14" />
              </svg>
              <span style={{ verticalAlign: "middle" }}>{children}</span>
            </p>
          </td>
        </tr>
      </tbody>
    </table>
  );
}

export function EmailDivider() {
  return (
    <table width="100%" cellPadding={0} cellSpacing={0} border={0} role="presentation">
      <tbody>
        <tr>
          <td style={{ borderTop: "1px solid #f0f0f0", padding: "0", margin: "24px 0", height: "1px", fontSize: "1px", lineHeight: "1px" }}>&nbsp;</td>
        </tr>
      </tbody>
    </table>
  );
}

export { HONEY, HONEY_DARK };
