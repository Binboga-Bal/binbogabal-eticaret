import crypto from "node:crypto";

/**
 * QNBPay AES-256-CBC hash üretimi.
 * Algoritma: iv:salt:encrypted, "/" → "__"
 */
export function generateHashKey(data: string, appSecret: string): string {
  const iv = crypto
    .createHash("sha1")
    .update(Math.random().toString())
    .digest("hex")
    .substring(0, 16);

  const salt = crypto
    .createHash("sha1")
    .update(Math.random().toString())
    .digest("hex")
    .substring(0, 4);

  const password = crypto.createHash("sha1").update(appSecret).digest("hex");
  const key = crypto
    .createHash("sha256")
    .update(password + salt)
    .digest("hex")
    .substring(0, 32);

  const cipher = crypto.createCipheriv(
    "aes-256-cbc",
    Buffer.from(key, "utf8"),
    Buffer.from(iv, "utf8"),
  );
  const encrypted =
    cipher.update(data, "utf8", "base64") + cipher.final("base64");

  return `${iv}:${salt}:${encrypted}`.replaceAll("/", "__");
}

/**
 * QNBPay'den dönen hash_key'i çözerek orijinal veriyi döndürür.
 * Başarısız veya hatalı formatta null döner.
 */
export function decryptHash(hashBundle: string, appSecret: string): string | null {
  try {
    const bundle = hashBundle.replaceAll("__", "/");
    const first = bundle.indexOf(":");
    const second = bundle.indexOf(":", first + 1);
    if (first === -1 || second === -1) return null;

    const iv = bundle.substring(0, first);
    const salt = bundle.substring(first + 1, second);
    const encrypted = bundle.substring(second + 1);

    const password = crypto.createHash("sha1").update(appSecret).digest("hex");
    const key = crypto
      .createHash("sha256")
      .update(password + salt)
      .digest("hex")
      .substring(0, 32);

    const decipher = crypto.createDecipheriv(
      "aes-256-cbc",
      Buffer.from(key, "utf8"),
      Buffer.from(iv, "utf8"),
    );
    return decipher.update(encrypted, "base64", "utf8") + decipher.final("utf8");
  } catch {
    return null;
  }
}

/**
 * QNBPay'den dönen hash_key'in beklenen veriyle eşleşip eşleşmediğini doğrular.
 */
export function verifyHash(
  hashBundle: string,
  expectedData: string,
  appSecret: string,
): boolean {
  return decryptHash(hashBundle, appSecret) === expectedData;
}
