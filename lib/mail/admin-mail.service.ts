import { resend, MAIL_FROM } from "./resend";
import { renderEmail } from "./render-email";
import { AdminInviteTemplate } from "./templates/admin-invite";
import { getTemplateContent } from "./template-content";
import * as React from "react";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
const APP_NAME = process.env.NEXT_PUBLIC_APP_NAME ?? "Binboğa Kooperatif";

type TemplateType =
  | "invite"
  | "password-reset"
  | "account-locked"
  | "suspicious-login"
  | "password-changed"
  | "role-changed"
  | "temp-permission-granted"
  | "temp-permission-expired"
  | "password-expiry-warning"
  | "new-admin-alert"
  | "high-risk-alert";

function buildSubject(type: TemplateType): string {
  const subjects: Record<TemplateType, string> = {
    invite: `${APP_NAME} Admin Paneline Davet Edildiniz`,
    "password-reset": "Şifre Sıfırlama Talebi",
    "account-locked": "Hesabınız Kilitlendi",
    "suspicious-login": "Şüpheli Giriş Denemesi Tespit Edildi",
    "password-changed": "Şifreniz Değiştirildi",
    "role-changed": "Rol Değişikliği Bildirimi",
    "temp-permission-granted": "Geçici Yetki Verildi",
    "temp-permission-expired": "Geçici Yetkinizin Süresi Doldu",
    "password-expiry-warning": "Şifrenizin Süresi Yakında Dolacak",
    "new-admin-alert": "Yeni Admin Kullanıcı Eklendi",
    "high-risk-alert": "Yüksek Riskli İşlem Tespit Edildi",
  };
  return subjects[type];
}

function buildHtml(type: TemplateType, data: Record<string, unknown>): string {
  const base = (content: string) => `
<!DOCTYPE html>
<html lang="tr">
<head><meta charset="UTF-8"><style>
body{font-family:Arial,sans-serif;background:#f5f5f5;margin:0;padding:0}
.container{max-width:600px;margin:40px auto;background:#fff;border-radius:8px;padding:40px;border:1px solid #e0e0e0}
.header{background:#F9B10B;padding:20px;border-radius:6px 6px 0 0;text-align:center;margin:-40px -40px 30px}
.header h1{color:#fff;margin:0;font-size:20px}
.btn{display:inline-block;padding:12px 24px;background:#F9B10B;color:#fff;text-decoration:none;border-radius:6px;font-weight:bold;margin:20px 0}
.alert{background:#fef2f2;border:1px solid #fecaca;padding:12px;border-radius:4px;color:#dc2626}
.info{background:#eff6ff;border:1px solid #bfdbfe;padding:12px;border-radius:4px;color:#1d4ed8}
.footer{margin-top:30px;font-size:12px;color:#9ca3af;text-align:center}
</style></head>
<body><div class="container">
<div class="header"><h1>${APP_NAME} Admin</h1></div>
${content}
<div class="footer">Bu mail otomatik gönderilmiştir. Yanıtlamayınız.</div>
</div></body></html>`;

  switch (type) {
    case "invite":
      // Handled separately with React Email template
      return "";

    case "password-reset":
      return base(`
<p>Merhaba <strong>${data.name}</strong>,</p>
<p>Şifre sıfırlama talebinde bulundunuz.</p>
<a class="btn" href="${APP_URL}/admin/auth/reset-password?token=${data.token}">Şifremi Sıfırla</a>
<p class="info">Bu bağlantı 2 saat geçerlidir. Talep siz tarafından yapılmadıysa bu maili görmezden gelin.</p>`);

    case "account-locked":
      return base(`
<p>Merhaba <strong>${data.name}</strong>,</p>
<p class="alert">Hesabınız art arda ${data.attempts} başarısız giriş denemesi nedeniyle <strong>${data.minutes} dakika</strong> süreliğine kilitlendi.</p>
<p>Bu işlem siz tarafından yapılmadıysa yöneticinize bildirin.</p>`);

    case "suspicious-login":
      return base(`
<p>Merhaba <strong>${data.name}</strong>,</p>
<p class="alert">Hesabınıza şüpheli bir giriş denemesi tespit edildi.</p>
<ul>
<li>IP: ${data.ip}</li>
<li>Tarih: ${data.date}</li>
<li>Konum: ${data.location ?? "Bilinmiyor"}</li>
</ul>
<p>Bu işlem siz tarafından yapılmadıysa şifrenizi değiştirin ve yöneticinize bildirin.</p>`);

    case "password-changed":
      return base(`
<p>Merhaba <strong>${data.name}</strong>,</p>
<p>Şifreniz başarıyla değiştirildi.</p>
<p class="info">Tarih: ${data.date}</p>
<p>Bu işlem siz tarafından yapılmadıysa hemen yöneticinize bildirin.</p>`);

    case "role-changed":
      return base(`
<p>Merhaba <strong>${data.name}</strong>,</p>
<p>Rolünüz güncellendi.</p>
<ul>
<li>Yeni roller: <strong>${data.roles}</strong></li>
<li>Değiştiren: ${data.changedBy}</li>
</ul>`);

    case "temp-permission-granted":
      return base(`
<p>Merhaba <strong>${data.name}</strong>,</p>
<p>Size geçici yetki verildi.</p>
<ul>
<li>Yetki: <strong>${data.permission}</strong></li>
<li>Geçerlilik: ${data.validUntil}</li>
<li>Veren: ${data.grantedBy}</li>
<li>Sebep: ${data.reason ?? "-"}</li>
</ul>`);

    case "temp-permission-expired":
      return base(`
<p>Merhaba <strong>${data.name}</strong>,</p>
<p>Geçici yetkinizin süresi doldu: <strong>${data.permission}</strong></p>`);

    case "password-expiry-warning":
      return base(`
<p>Merhaba <strong>${data.name}</strong>,</p>
<p class="alert">Şifrenizin süresi <strong>${data.daysLeft} gün</strong> içinde dolacak.</p>
<a class="btn" href="${APP_URL}/admin/auth/change-password">Şifremi Değiştir</a>`);

    case "new-admin-alert":
      return base(`
<p>Yeni bir admin kullanıcı eklendi:</p>
<ul>
<li>Ad: <strong>${data.name}</strong></li>
<li>Email: ${data.email}</li>
<li>Roller: ${data.roles}</li>
<li>Ekleyen: ${data.addedBy}</li>
</ul>`);

    case "high-risk-alert":
      return base(`
<p class="alert">Yüksek riskli bir işlem tespit edildi (Risk skoru: ${data.riskScore}/100)</p>
<ul>
<li>Admin: ${data.adminName}</li>
<li>İşlem: ${data.action}</li>
<li>Modül: ${data.module}</li>
<li>Tarih: ${data.date}</li>
<li>IP: ${data.ip}</li>
</ul>`);

    default:
      return base(`<p>${JSON.stringify(data)}</p>`);
  }
}

export async function sendAdminMail(
  type: TemplateType,
  to: string,
  data: Record<string, unknown>
): Promise<void> {
  try {
    let html: string;

    if (type === "invite") {
      const name = data.name as string;
      const token = data.token as string;
      const acceptUrl = `${APP_URL}/admin/auth/accept-invite?token=${token}`;
      const adminPanelUrl = `${APP_URL}/admin`;
      const content = await getTemplateContent("admin-invite");
      html = await renderEmail(
        React.createElement(AdminInviteTemplate, {
          name,
          acceptUrl,
          adminPanelUrl,
          content,
          appUrl: APP_URL,
        })
      );
    } else {
      html = buildHtml(type, data);
    }

    await resend.emails.send({
      from: MAIL_FROM,
      to,
      subject: buildSubject(type),
      html,
    });
  } catch (err) {
    console.error(`[AdminMail] Failed to send ${type} to ${to}:`, err);
  }
}
