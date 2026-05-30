import * as React from "react";

interface Props {
  name: string;
  resetUrl: string;
}

export function PasswordResetTemplate({ name, resetUrl }: Props) {
  return (
    <div style={{ fontFamily: "sans-serif", maxWidth: 600, margin: "0 auto" }}>
      <div style={{ background: "#F9B10B", padding: "24px 32px" }}>
        <h1 style={{ margin: 0, color: "#fff", fontSize: 24 }}>Binboğa Kooperatif Balı</h1>
      </div>
      <div style={{ padding: "32px", background: "#fff" }}>
        <h2 style={{ color: "#1a1a1a" }}>Şifre Sıfırlama</h2>
        <p style={{ color: "#555", lineHeight: 1.6 }}>
          Merhaba {name}, şifrenizi sıfırlamak için aşağıdaki butona tıklayın. Bu bağlantı <strong>1 saat</strong> geçerlidir.
        </p>
        <div style={{ textAlign: "center", margin: "32px 0" }}>
          <a
            href={resetUrl}
            style={{
              background: "#C57930",
              color: "#fff",
              padding: "14px 32px",
              borderRadius: 8,
              textDecoration: "none",
              fontWeight: "bold",
              fontSize: 16,
            }}
          >
            Şifremi Sıfırla
          </a>
        </div>
        <p style={{ color: "#999", fontSize: 13 }}>
          Bu isteği siz yapmadıysanız hesabınız güvende — bu e-postayı görmezden gelin.
        </p>
      </div>
    </div>
  );
}
