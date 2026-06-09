import * as React from "react";

interface Props {
  name: string;
  email: string;
  subject: string;
  message: string;
}

const HONEY  = "#C57930";
const DARK   = "#111827";
const MID    = "#6b7280";
const LIGHT  = "#f3f4f6";
const WHITE  = "#ffffff";

export function ContactFormTemplate({ name, email, subject, message }: Props) {
  const replySubject = encodeURIComponent(`Re: ${subject || "İletişim Formu"}`);
  const dateStr = new Date().toLocaleDateString("tr-TR", {
    day: "numeric", month: "long", year: "numeric",
    hour: "2-digit", minute: "2-digit",
  });
  const initial = name.charAt(0).toUpperCase();

  return (
    <div style={{ margin: 0, padding: 0, background: "#e8e8e8", fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif" }}>
      <table width="100%" cellPadding={0} cellSpacing={0} style={{ background: "#e8e8e8", padding: "40px 0" }}>
        <tbody>
          <tr>
            <td align="center">
              <table width="600" cellPadding={0} cellSpacing={0} style={{ maxWidth: 600, width: "100%" }}>
                <tbody>

                  {/* ── HEADER ── */}
                  <tr>
                    <td bgcolor={HONEY} style={{ padding: "28px 36px 24px", borderRadius: "12px 12px 0 0" }}>
                      <table width="100%" cellPadding={0} cellSpacing={0}>
                        <tbody>
                          {/* Brand row */}
                          <tr>
                            <td>
                              <table cellPadding={0} cellSpacing={0}>
                                <tbody>
                                  <tr>
                                    <td style={{ verticalAlign: "middle", color: "rgba(255,255,255,0.9)", fontSize: 14, fontWeight: 700 }}>
                                      Binboğa Kooperatif Balı
                                    </td>
                                  </tr>
                                </tbody>
                              </table>
                            </td>
                            <td align="right" style={{ verticalAlign: "middle" }}>
                              <span style={{
                                background: "rgba(255,255,255,0.25)",
                                color: WHITE,
                                fontSize: 10,
                                fontWeight: 800,
                                letterSpacing: "1.2px",
                                padding: "5px 12px",
                                borderRadius: 20,
                              }}>
                                YENİ MESAJ
                              </span>
                            </td>
                          </tr>
                          {/* Title row */}
                          <tr>
                            <td colSpan={2} style={{ paddingTop: 18, paddingBottom: 4 }}>
                              <div style={{ color: WHITE, fontSize: 30, fontWeight: 900, letterSpacing: "-0.5px" }}>
                                İletişim Formu
                              </div>
                              <div style={{ color: "rgba(255,255,255,0.8)", fontSize: 13, marginTop: 5 }}>
                                {dateStr}
                              </div>
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </td>
                  </tr>

                  {/* ── BODY ── */}
                  <tr>
                    <td bgcolor={WHITE} style={{ padding: "32px 36px 36px" }}>

                      {/* Gönderen */}
                      <table width="100%" cellPadding={0} cellSpacing={0} style={{ marginBottom: 28 }}>
                        <tbody>
                          <tr>
                            <td style={{ fontSize: 11, fontWeight: 700, color: MID, letterSpacing: "0.9px", textTransform: "uppercase", paddingBottom: 8 }}>
                              Gönderen
                            </td>
                          </tr>
                          <tr>
                            <td bgcolor={LIGHT} style={{ padding: "16px 20px", borderRadius: 8 }}>
                              <div style={{ fontWeight: 700, fontSize: 15, color: DARK, lineHeight: "1.3", marginBottom: 4 }}>
                                {name}
                              </div>
                              <a href={`mailto:${email}`} style={{ color: HONEY, fontSize: 13, textDecoration: "none" }}>
                                {email}
                              </a>
                            </td>
                          </tr>
                        </tbody>
                      </table>

                      {/* Konu */}
                      {subject ? (
                        <table width="100%" cellPadding={0} cellSpacing={0} style={{ marginBottom: 28 }}>
                          <tbody>
                            <tr>
                              <td style={{ fontSize: 11, fontWeight: 700, color: MID, letterSpacing: "0.9px", textTransform: "uppercase", paddingBottom: 8, paddingTop: 24 }}>
                                Konu
                              </td>
                            </tr>
                            <tr>
                              <td bgcolor={LIGHT} style={{ padding: "14px 20px", borderRadius: 8 }}>
                                <span style={{ fontSize: 15, fontWeight: 600, color: DARK }}>
                                  {subject}
                                </span>
                              </td>
                            </tr>
                          </tbody>
                        </table>
                      ) : null}

                      {/* Mesaj */}
                      <table width="100%" cellPadding={0} cellSpacing={0} style={{ marginBottom: 32 }}>
                        <tbody>
                          <tr>
                            <td style={{ fontSize: 11, fontWeight: 700, color: MID, letterSpacing: "0.9px", textTransform: "uppercase", paddingBottom: 8, paddingTop: 24 }}>
                              Mesaj
                            </td>
                          </tr>
                          <tr>
                            <td style={{ background: "#fffbf3", padding: "20px 24px", borderRadius: 8, borderLeft: `4px solid ${HONEY}` }}>
                              <div style={{ fontSize: 15, color: DARK, lineHeight: "1.85", whiteSpace: "pre-wrap" }}>
                                {message}
                              </div>
                            </td>
                          </tr>
                        </tbody>
                      </table>

                      {/* Ayırıcı */}
                      <table width="100%" cellPadding={0} cellSpacing={0} style={{ marginBottom: 28 }}>
                        <tbody>
                          <tr>
                            <td style={{ borderTop: `1px solid ${LIGHT}`, lineHeight: 0, fontSize: 0 }}>&nbsp;</td>
                          </tr>
                        </tbody>
                      </table>

                      {/* CTA */}
                      <table width="100%" cellPadding={0} cellSpacing={0}>
                        <tbody>
                          <tr>
                            <td align="center">
                              <a
                                href={`mailto:${email}?subject=${replySubject}`}
                                style={{
                                  display: "inline-block",
                                  background: HONEY,
                                  color: WHITE,
                                  padding: "18px 72px",
                                  borderRadius: 8,
                                  textDecoration: "none",
                                  fontWeight: 700,
                                  fontSize: 15,
                                  letterSpacing: "0.2px",
                                }}
                              >
                                Yanıtla
                              </a>
                            </td>
                          </tr>
                        </tbody>
                      </table>

                    </td>
                  </tr>

                  {/* ── FOOTER ── */}
                  <tr>
                    <td bgcolor="#f9fafb" style={{ padding: "18px 36px", borderRadius: "0 0 12px 12px", borderTop: `1px solid ${LIGHT}` }}>
                      <table width="100%" cellPadding={0} cellSpacing={0}>
                        <tbody>
                          <tr>
                            <td align="center">
                              <span style={{ fontSize: 12, color: "#9ca3af" }}>
                                Bu e-posta{" "}
                                <a href="https://binbogabal.com.tr" style={{ color: HONEY, textDecoration: "none" }}>
                                  binbogabal.com.tr
                                </a>{" "}
                                iletişim formundan otomatik olarak gönderilmiştir.
                              </span>
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </td>
                  </tr>

                </tbody>
              </table>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}
