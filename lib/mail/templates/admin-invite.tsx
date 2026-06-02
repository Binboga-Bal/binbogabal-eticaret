import * as React from "react";
import { palette } from "@/lib/theme";

interface Props {
  name: string;
  acceptUrl: string;
  adminPanelUrl: string;
}

export function AdminInviteTemplate({ name, acceptUrl, adminPanelUrl }: Props) {
  return (
    <div style={{ fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif", maxWidth: 600, margin: "0 auto", backgroundColor: "#f9fafb" }}>
      {/* Header */}
      <div style={{ background: palette.honeyDark, padding: "40px 32px", textAlign: "center" }}>
        <h1 style={{ margin: 0, color: "#fff", fontSize: 28, fontWeight: "bold" }}>Binboğa Admin</h1>
        <p style={{ margin: "8px 0 0 0", color: "rgba(255,255,255,0.9)", fontSize: 14 }}>Yönetim Paneli</p>
      </div>

      {/* Main Content */}
      <div style={{ padding: "40px 32px", background: "#fff", borderBottom: `1px solid ${palette.gray200}` }}>
        <h2 style={{ color: palette.honeyDark, fontSize: 20, fontWeight: "600", margin: "0 0 16px 0" }}>
          Hoş geldiniz, {name}! 👋
        </h2>

        <p style={{ color: palette.gray700, lineHeight: 1.6, margin: "0 0 16px 0", fontSize: 14 }}>
          Binboğa Kooperatif Balı Admin Paneline davet edildiniz. Aşağıdaki butona tıklayarak hesabınızı aktifleştirin ve şifrenizi belirleyin.
        </p>

        {/* CTA Button */}
        <div style={{ textAlign: "center", margin: "32px 0" }}>
          <a
            href={acceptUrl}
            style={{
              display: "inline-block",
              background: palette.honey,
              color: "#fff",
              padding: "14px 40px",
              borderRadius: "6px",
              textDecoration: "none",
              fontWeight: "600",
              fontSize: 15,
              boxShadow: "0 4px 12px rgba(249, 177, 11, 0.3)",
              transition: "all 0.3s ease",
            }}
          >
            Daveti Kabul Et
          </a>
        </div>

        {/* Info Box */}
        <div style={{ background: palette.honeyCream, border: `1px solid ${palette.honeyLight}`, borderRadius: "6px", padding: "16px", margin: "24px 0" }}>
          <p style={{ margin: 0, color: palette.honeyDark, fontSize: 13, lineHeight: 1.5 }}>
            <strong>ℹ️ Not:</strong> Bu davet bağlantısı <strong>48 saat</strong> geçerlidir. Lütfen bu süre içinde daveti kabul edin.
          </p>
        </div>

        {/* Details */}
        <div style={{ background: palette.gray50, borderRadius: "6px", padding: "16px", margin: "24px 0" }}>
          <h3 style={{ margin: "0 0 12px 0", color: palette.gray800, fontSize: 13, fontWeight: "600" }}>Admin Paneline Erişim</h3>
          <p style={{ margin: "0 0 8px 0", color: palette.gray600, fontSize: 13, lineHeight: 1.5 }}>
            Davetinizi kabul ettiğiniz sonra Admin Paneline erişebileceksiniz:
          </p>
          <a href={adminPanelUrl} style={{ color: palette.honeyDark, textDecoration: "none", wordBreak: "break-all", fontSize: 12 }}>
            {adminPanelUrl}
          </a>
        </div>

        {/* Security Note */}
        <div style={{ background: "#fef2f2", border: "1px solid #fecaca", borderRadius: "6px", padding: "14px", margin: "24px 0" }}>
          <p style={{ margin: 0, color: "#991b1b", fontSize: 12, lineHeight: 1.5 }}>
            🔒 <strong>Güvenlik Uyarısı:</strong> Başka birine bu daveti göstermeyin. Admin paneline erişim yüksek düzey izinler gerektirir.
          </p>
        </div>

        {/* Help Text */}
        <p style={{ color: palette.gray600, fontSize: 13, lineHeight: 1.5, margin: "24px 0 0 0" }}>
          Herhangi bir sorunuz varsa yöneticinize başvurun.
        </p>
      </div>

      {/* Footer */}
      <div style={{ padding: "24px 32px", background: palette.gray50, textAlign: "center", borderTop: `1px solid ${palette.gray200}` }}>
        <p style={{ margin: 0, color: palette.gray500, fontSize: 12, lineHeight: 1.6 }}>
          Bu e-posta otomatik olarak gönderilmiştir. Lütfen yanıtlamayınız.
        </p>
        <p style={{ margin: "8px 0 0 0", color: palette.gray400, fontSize: 11 }}>
          © 2024 Binboğa Kooperatif Balı. Tüm hakları saklıdır.
        </p>
      </div>
    </div>
  );
}
