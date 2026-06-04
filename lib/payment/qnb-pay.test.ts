/**
 * QNBPay hash utilityleri için birim testleri.
 * Çalıştırmak: pnpm test:hash
 *
 * Test değerleri QNBpay dokümantasyonundaki örneklerden alınmıştır.
 */
import { test } from "node:test";
import assert from "node:assert/strict";
import { generateHashKey, decryptHash, verifyHash } from "./qnb-hash";

// QNBpay dokümantasyonundaki örnek değerler
const APP_SECRET = "61d97b2cac247069495be4b16f8604db";
const MERCHANT_KEY = "$2y$10$N9IJkgazXMUwCzpn7NJrZePy3v.dIFOQUyW4yGfT3eWry6m.KxanK";

test("hash bundle formatı: iv:salt:encrypted, '/' → '__'", () => {
  const data = `1.00|1|TRY|${MERCHANT_KEY}|BB-TEST-001`;
  const hash = generateHashKey(data, APP_SECRET);

  assert.ok(!hash.includes("/"), 'Ham "/" "__" ile değiştirilmiş olmalı');

  const bundle = hash.replaceAll("__", "/");
  const first = bundle.indexOf(":");
  const second = bundle.indexOf(":", first + 1);

  assert.ok(first !== -1, "Bundle en az bir ':' içermeli");
  assert.ok(second !== -1, "Bundle en az iki ':' içermeli");

  const iv = bundle.substring(0, first);
  const salt = bundle.substring(first + 1, second);
  const encrypted = bundle.substring(second + 1);

  assert.strictEqual(iv.length, 16, `iv 16 karakter olmalı, ${iv.length} geldi`);
  assert.strictEqual(salt.length, 4, `salt 4 karakter olmalı, ${salt.length} geldi`);
  assert.ok(encrypted.length > 0, "Şifreli kısım boş olmamalı");
});

test("decryptHash, generateHashKey'in tersini alır", () => {
  const data = `1.00|1|TRY|${MERCHANT_KEY}|BB-TEST-001`;
  const hash = generateHashKey(data, APP_SECRET);
  const decrypted = decryptHash(hash, APP_SECRET);
  assert.strictEqual(decrypted, data, "Şifre çözülen veri orijinalle eşleşmeli");
});

test("Her çalıştırmada farklı hash üretilir (rastgele iv/salt)", () => {
  const data = `1.00|1|TRY|${MERCHANT_KEY}|BB-TEST-001`;
  const hash1 = generateHashKey(data, APP_SECRET);
  const hash2 = generateHashKey(data, APP_SECRET);
  assert.notStrictEqual(hash1, hash2, "iv/salt rastgele olduğundan hashler farklı olmalı");
});

test("verifyHash doğru veri için true döner", () => {
  const data = `199.00|1|TRY|${MERCHANT_KEY}|BB-ORDER-123`;
  const hash = generateHashKey(data, APP_SECRET);
  assert.ok(verifyHash(hash, data, APP_SECRET), "verifyHash true dönmeli");
});

test("verifyHash tutarsız tutarda false döner (manipülasyon koruması)", () => {
  const original = `199.00|1|TRY|${MERCHANT_KEY}|BB-ORDER-123`;
  const tampered = `299.00|1|TRY|${MERCHANT_KEY}|BB-ORDER-123`;
  const hash = generateHashKey(original, APP_SECRET);
  assert.ok(!verifyHash(hash, tampered, APP_SECRET), "Değiştirilmiş tutar doğrulamayı geçememeli");
});

test("verifyHash yanlış app_secret için false döner", () => {
  const data = `199.00|1|TRY|${MERCHANT_KEY}|BB-ORDER-123`;
  const hash = generateHashKey(data, APP_SECRET);
  assert.ok(!verifyHash(hash, data, "yanlis-secret"), "Yanlış secret doğrulamayı geçememeli");
});

test("decryptHash bozuk bundle için null döner", () => {
  assert.strictEqual(decryptHash("gecersiz-bundle", APP_SECRET), null);
  assert.strictEqual(decryptHash("", APP_SECRET), null);
  assert.strictEqual(decryptHash("sadece:iki:kisim-ama-yanlis-iv-uzunlugu", APP_SECRET), null);
});

test("checkstatus hash formatı: invoice_id|merchant_key doğrulanabilir", () => {
  const invoiceId = "BB-SIPARIS-2024-001";
  const data = `${invoiceId}|${MERCHANT_KEY}`;
  const hash = generateHashKey(data, APP_SECRET);
  assert.ok(verifyHash(hash, data, APP_SECRET), "checkstatus hash doğrulanabilmeli");
});
