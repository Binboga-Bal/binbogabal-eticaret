import * as React from "react";

interface Props {
  name: string;
}

export function PasswordChangedTemplate({ name }: Props) {
  return (
    <div style={{ fontFamily: "sans-serif", maxWidth: 600, margin: "0 auto" }}>
      <div style={{ background: "#F9B10B", padding: "24px 32px" }}>
        <h1 style={{ margin: 0, color: "#fff", fontSize: 24 }}>Binboğa Kooperatif Balı</h1>
      </div>
      <div style={{ padding: "32px", background: "#fff" }}>
        <h2 style={{ color: "#1a1a1a" }}>Şifreniz Değiştirildi</h2>
        <p style={{ color: "#555", lineHeight: 1.6 }}>
          Merhaba {name}, hesabınızın şifresi başarıyla değiştirildi.
        </p>
        <p style={{ color: "#e53e3e", lineHeight: 1.6 }}>
          Bu işlemi siz yapmadıysanız lütfen hemen destek ekibimizle iletişime geçin.
        </p>
      </div>
    </div>
  );
}
