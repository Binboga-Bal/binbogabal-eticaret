import * as React from "react";

interface OrderItem {
  productName: string;
  variantInfo: string;
  quantity: number;
  price: number;
}

interface Props {
  name: string;
  orderNumber: string;
  items: OrderItem[];
  total: number;
  orderUrl: string;
}

export function OrderConfirmedTemplate({ name, orderNumber, items, total, orderUrl }: Props) {
  return (
    <div style={{ fontFamily: "sans-serif", maxWidth: 600, margin: "0 auto" }}>
      <div style={{ background: "#F9B10B", padding: "24px 32px" }}>
        <h1 style={{ margin: 0, color: "#fff", fontSize: 24 }}>Binboğa Kooperatif Balı</h1>
      </div>
      <div style={{ padding: "32px", background: "#fff" }}>
        <h2 style={{ color: "#1a1a1a" }}>Siparişiniz Alındı!</h2>
        <p style={{ color: "#555" }}>Merhaba {name}, <strong>{orderNumber}</strong> numaralı siparişiniz başarıyla oluşturuldu.</p>
        <table style={{ width: "100%", borderCollapse: "collapse", margin: "24px 0" }}>
          <thead>
            <tr style={{ background: "#FFF8E7" }}>
              <th style={{ padding: "8px 12px", textAlign: "left", fontSize: 13, color: "#555" }}>Ürün</th>
              <th style={{ padding: "8px 12px", textAlign: "right", fontSize: 13, color: "#555" }}>Adet</th>
              <th style={{ padding: "8px 12px", textAlign: "right", fontSize: 13, color: "#555" }}>Tutar</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item, i) => (
              <tr key={i} style={{ borderBottom: "1px solid #f0f0f0" }}>
                <td style={{ padding: "10px 12px", fontSize: 14 }}>
                  {item.productName}<br />
                  <span style={{ color: "#999", fontSize: 12 }}>{item.variantInfo}</span>
                </td>
                <td style={{ padding: "10px 12px", textAlign: "right", fontSize: 14 }}>{item.quantity}</td>
                <td style={{ padding: "10px 12px", textAlign: "right", fontSize: 14, fontWeight: "bold" }}>
                  {(item.price * item.quantity).toFixed(2)} ₺
                </td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr>
              <td colSpan={2} style={{ padding: "12px", textAlign: "right", fontWeight: "bold" }}>Toplam:</td>
              <td style={{ padding: "12px", textAlign: "right", fontWeight: "bold", color: "#F9B10B", fontSize: 16 }}>
                {total.toFixed(2)} ₺
              </td>
            </tr>
          </tfoot>
        </table>
        <div style={{ textAlign: "center" }}>
          <a href={orderUrl} style={{ background: "#F9B10B", color: "#fff", padding: "12px 28px", borderRadius: 8, textDecoration: "none", fontWeight: "bold" }}>
            Siparişimi Görüntüle
          </a>
        </div>
      </div>
    </div>
  );
}
