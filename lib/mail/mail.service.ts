import { resend, MAIL_FROM } from "./resend";
import { prisma } from "@/lib/prisma";
import { render } from "@react-email/render";
import { VerifyEmailTemplate } from "./templates/verify-email";
import { WelcomeTemplate } from "./templates/welcome";
import { PasswordResetTemplate } from "./templates/password-reset";
import { PasswordChangedTemplate } from "./templates/password-changed";
import { OrderConfirmedTemplate } from "./templates/order-confirmed";
import { OrderStatusChangedTemplate } from "./templates/order-status-changed";
import { FavoriteDiscountTemplate } from "./templates/favorite-discount";
import { CouponExpiryTemplate } from "./templates/coupon-expiry";
import { ReviewRequestTemplate } from "./templates/review-request";
import { ReviewReplyTemplate } from "./templates/review-reply";
import * as React from "react";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
const APP_NAME = process.env.NEXT_PUBLIC_APP_NAME ?? "Binboğa Kooperatif Balı";

async function getPreference(userId: string, key: keyof {
  orderUpdates: boolean;
  favoriteDiscounts: boolean;
  couponReminders: boolean;
  reviewRequests: boolean;
  newsletter: boolean;
  smsNotifications: boolean;
}): Promise<boolean> {
  if (!userId) return true; // misafir kullanıcı — her zaman gönder
  const pref = await prisma.notificationPreference.findUnique({ where: { userId } });
  if (!pref) return true;
  return pref[key];
}

export async function sendVerifyEmail(to: string, name: string, token: string) {
  const verifyUrl = `${APP_URL}/api/auth/verify-email?token=${token}`;
  const html = await render(React.createElement(VerifyEmailTemplate, { name, verifyUrl }));
  await resend.emails.send({
    from: MAIL_FROM,
    to,
    subject: `${APP_NAME} — E-postanızı Doğrulayın`,
    html,
  });
}

export async function sendWelcomeEmail(to: string, name: string) {
  const html = await render(React.createElement(WelcomeTemplate, { name, shopUrl: `${APP_URL}/urunlerimiz` }));
  await resend.emails.send({
    from: MAIL_FROM,
    to,
    subject: `${APP_NAME}'ne Hoş Geldiniz!`,
    html,
  });
}

export async function sendPasswordResetEmail(to: string, name: string, token: string) {
  const resetUrl = `${APP_URL}/hesabim/sifre-sifirla?token=${token}`;
  const html = await render(React.createElement(PasswordResetTemplate, { name, resetUrl }));
  await resend.emails.send({
    from: MAIL_FROM,
    to,
    subject: `${APP_NAME} — Şifre Sıfırlama`,
    html,
  });
}

export async function sendPasswordChangedEmail(to: string, name: string) {
  const html = await render(React.createElement(PasswordChangedTemplate, { name }));
  await resend.emails.send({
    from: MAIL_FROM,
    to,
    subject: `${APP_NAME} — Şifreniz Değiştirildi`,
    html,
  });
}

export async function sendOrderConfirmedEmail(
  userId: string,
  to: string,
  name: string,
  orderNumber: string,
  orderId: string,
  items: { productName: string; variantInfo: string; quantity: number; price: number }[],
  total: number,
) {
  const allowed = await getPreference(userId, "orderUpdates");
  if (!allowed) return;
  const orderUrl = `${APP_URL}/hesabim/siparislerim/${orderId}`;
  const html = await render(React.createElement(OrderConfirmedTemplate, { name, orderNumber, items, total, orderUrl }));
  await resend.emails.send({
    from: MAIL_FROM,
    to,
    subject: `${APP_NAME} — Siparişiniz Alındı: ${orderNumber}`,
    html,
  });
}

export async function sendOrderStatusChangedEmail(
  userId: string,
  to: string,
  name: string,
  orderNumber: string,
  orderId: string,
  status: string,
  cargoTrackingNo?: string,
  cargoCompany?: string,
) {
  const allowed = await getPreference(userId, "orderUpdates");
  if (!allowed) return;
  const orderUrl = `${APP_URL}/hesabim/siparislerim/${orderId}`;
  const html = await render(React.createElement(OrderStatusChangedTemplate, { name, orderNumber, status, cargoTrackingNo, cargoCompany, orderUrl }));
  await resend.emails.send({
    from: MAIL_FROM,
    to,
    subject: `${APP_NAME} — Sipariş Durumu Güncellendi: ${orderNumber}`,
    html,
  });
}

export async function sendFavoriteDiscountEmail(
  userId: string,
  to: string,
  name: string,
  products: { name: string; oldPrice: number; newPrice: number; productUrl: string }[],
) {
  const allowed = await getPreference(userId, "favoriteDiscounts");
  if (!allowed) return;
  const html = await render(React.createElement(FavoriteDiscountTemplate, { name, products }));
  await resend.emails.send({
    from: MAIL_FROM,
    to,
    subject: `${APP_NAME} — Favori Ürününüzde İndirim!`,
    html,
  });
}

export async function sendCouponExpiryEmail(
  userId: string,
  to: string,
  name: string,
  couponCode: string,
  discountLabel: string,
  expiresAt: string,
  daysLeft: number,
) {
  const allowed = await getPreference(userId, "couponReminders");
  if (!allowed) return;
  const html = await render(React.createElement(CouponExpiryTemplate, { name, couponCode, discountLabel, expiresAt, daysLeft, shopUrl: `${APP_URL}/urunlerimiz` }));
  await resend.emails.send({
    from: MAIL_FROM,
    to,
    subject: `${APP_NAME} — Kuponunuzun Süresi Dolmak Üzere`,
    html,
  });
}

export async function sendReviewReplyEmail(
  userId: string,
  to: string,
  name: string,
  productName: string,
  productSlug: string,
  reviewComment: string,
  adminReply: string,
) {
  const allowed = await getPreference(userId, "reviewRequests");
  if (!allowed) return;
  const reviewUrl = `${APP_URL}/urunlerimiz/${productSlug}`;
  const html = await render(React.createElement(ReviewReplyTemplate, { name, productName, reviewComment, adminReply, reviewUrl }));
  await resend.emails.send({
    from: MAIL_FROM,
    to,
    subject: `${APP_NAME} — Yorumunuza Yanıt Geldi`,
    html,
  });
}

export async function sendReviewRequestEmail(
  userId: string,
  to: string,
  name: string,
  orderNumber: string,
  items: { productName: string; variantInfo: string; reviewUrl: string }[],
) {
  const allowed = await getPreference(userId, "reviewRequests");
  if (!allowed) return;
  const html = await render(React.createElement(ReviewRequestTemplate, { name, orderNumber, items }));
  await resend.emails.send({
    from: MAIL_FROM,
    to,
    subject: `${APP_NAME} — Ürünlerimizi Değerlendirin`,
    html,
  });
}
