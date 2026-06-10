import { render } from "@react-email/render";
import type React from "react";

/**
 * React Email'in render() çıktısını alıp e-posta istemcileriyle tam uyumlu
 * HTML belgesi haline getirir.
 *
 * Eklenenler:
 *  - XHTML Transitional DOCTYPE
 *  - <html xmlns> + Outlook VML namespace'leri
 *  - <head> ile Content-Type, viewport, X-UA-Compatible meta etiketleri
 *  - MSO OfficeDocumentSettings (Outlook HiDPI için)
 *  - Global CSS reset (mso-table-lspace/rspace, -webkit-text-size-adjust vb.)
 *  - <body> ile tam genişlik arka plan
 *  - Outlook'ta yatay ortalama için MSO koşullu tablo sarmalayıcı
 */
export async function renderEmail(element: React.ReactElement): Promise<string> {
  const rendered = await render(element);

  // render() çıktısı: `<!DOCTYPE...><!--$-->..HTML..<!--/$-->`
  // DOCTYPE ve React Suspense marker'larını temizle
  const inner = rendered
    .replace(/^<!DOCTYPE[^>]*>\n?/, "")
    .replace(/<!--\$-->/g, "")
    .replace(/<!--\/\$-->/g, "");

  return `<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml"
      xmlns:v="urn:schemas-microsoft-com:vml"
      xmlns:o="urn:schemas-microsoft-com:office:office"
      lang="tr">
<head>
  <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <meta http-equiv="X-UA-Compatible" content="IE=edge" />
  <!--[if gte mso 9]><xml>
    <o:OfficeDocumentSettings>
      <o:AllowPNG/>
      <o:PixelsPerInch>96</o:PixelsPerInch>
    </o:OfficeDocumentSettings>
  </xml><![endif]-->
  <style type="text/css">
    body, #__email_wrap { margin:0; padding:0; background-color:#f4f4f4; }
    table { border-collapse:collapse; mso-table-lspace:0pt; mso-table-rspace:0pt; }
    td { border-collapse:collapse; }
    img { border:0; outline:none; text-decoration:none; }
    p { margin:0; padding:0; }
    a { color:#F9B10B; }
    * { -webkit-text-size-adjust:100%; -ms-text-size-adjust:100%; }
    @media only screen and (max-width:620px) {
      .email-wrap { width:100% !important; }
    }
  </style>
</head>
<body style="margin:0;padding:0;background-color:#f4f4f4;" id="__email_wrap">
  <!--[if mso]>
  <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" bgcolor="#f4f4f4">
  <tr><td align="center">
  <![endif]-->
  ${inner}
  <!--[if mso]>
  </td></tr></table>
  <![endif]-->
</body>
</html>`;
}
