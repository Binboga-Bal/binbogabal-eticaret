import { readFileSync, writeFileSync } from "fs";

const input = readFileSync("binbogabal_cpanel.sql", "utf8");

// Boolean sütunları tabloya göre tanımla
const BOOL_COLS = {
  addresses:                ["isDefault", "isBilling"],
  blog_posts:               ["isPublished"],
  campaign_ab_tests:        ["isWinner"],
  campaign_displays:        ["showCountdown", "isActive"],
  campaign_templates:       ["isSystem"],
  campaigns:                ["stackable", "requiresApproval"],
  categories:               ["isActive", "showOnHome"],
  consent_logs:             ["granted"],
  coupons:                  ["isActive", "isBulk"],
  erp_sync_logs:            [],
  faqs:                     ["isActive"],
  honey_types:              ["isActive"],
  notification_preferences: ["orderUpdates","favoriteDiscounts","couponReminders","reviewRequests","newsletter","smsNotifications"],
  order_items:              ["reviewed"],
  orders:                   ["reviewRequested"],
  product_variants:         ["isActive"],
  products:                 ["isActive","isFeatured","isBestseller","isNew"],
  reviews:                  ["isApproved"],
  users:                    ["isActive","phoneVerified"],
  volume_discounts:         ["isActive"],
};

// İşlenecek tablolar (sırasıyla — foreign key sırası önemli)
const TABLE_ORDER = [
  "users","categories","honey_types","products","product_variants",
  "_CategoryToProduct","_HoneyTypeToProduct",
  "addresses","accounts","sessions","verification_tokens",
  "blog_posts","faqs","site_settings","erp_sync_logs",
  "campaigns","campaign_conditions","campaign_actions","campaign_segments",
  "campaign_targets","campaign_displays","campaign_ab_tests",
  "campaign_notifications","campaign_translations","campaign_templates",
  "campaign_audit_logs",
  "coupons","customer_coupons","campaign_usages",
  "favorites","notification_preferences","consent_logs",
  "orders","order_items","payment_transactions","reviews",
  "volume_discounts","volume_discount_products",
];

// Her tablo için INSERT bloğunu çek
function extractInserts(sql, table) {
  const re = new RegExp(
    `INSERT INTO \`${table}\` VALUES ([\\s\\S]+?);(?=\\s*\\/\\*|\\s*UNLOCK|\\s*$)`,
    "g"
  );
  const blocks = [];
  let m;
  while ((m = re.exec(sql)) !== null) {
    blocks.push(`INSERT INTO \`${table}\` VALUES ${m[1]};`);
  }
  return blocks.join("\n");
}

// Tek bir VALUES satırını parse et (basit ama yeterince sağlam)
function parseValues(block) {
  // Tüm satır kümelerini bul: (...),(...)
  const rows = [];
  let depth = 0, cur = "", inStr = false, strChar = "", escape = false;

  for (let i = 0; i < block.length; i++) {
    const ch = block[i];

    if (escape) { cur += ch; escape = false; continue; }
    if (ch === "\\") { cur += ch; escape = true; continue; }

    if (!inStr && (ch === "'" || ch === '"')) { inStr = true; strChar = ch; cur += ch; continue; }
    if (inStr && ch === strChar) { inStr = false; cur += ch; continue; }
    if (inStr) { cur += ch; continue; }

    if (ch === "(") {
      depth++;
      if (depth === 1) { cur = ""; continue; }
    }
    if (ch === ")") {
      depth--;
      if (depth === 0) { rows.push(cur); cur = ""; continue; }
    }
    cur += ch;
  }
  return rows;
}

// Bir VALUES satırını sütun listesine göre boolean dönüşümü uygula
function convertRow(rowStr, boolCols, colNames) {
  if (!boolCols || boolCols.length === 0) return rowStr;
  // col indekslerini bul
  const boolIdxs = new Set(
    boolCols.map(c => colNames.indexOf(c)).filter(i => i >= 0)
  );
  if (boolIdxs.size === 0) return rowStr;

  // Değerleri parse et
  const vals = [];
  let inStr = false, strChar = "", cur = "", escape = false;
  for (let i = 0; i < rowStr.length; i++) {
    const ch = rowStr[i];
    if (escape) { cur += ch; escape = false; continue; }
    if (ch === "\\") { cur += ch; escape = true; continue; }
    if (!inStr && (ch === "'" || ch === '"')) { inStr = true; strChar = ch; cur += ch; continue; }
    if (inStr && ch === strChar) { inStr = false; cur += ch; continue; }
    if (inStr) { cur += ch; continue; }
    if (ch === ",") { vals.push(cur.trim()); cur = ""; continue; }
    cur += ch;
  }
  vals.push(cur.trim());

  const converted = vals.map((v, i) => {
    if (!boolIdxs.has(i)) return v;
    if (v === "0") return "false";
    if (v === "1") return "true";
    return v;
  });
  return converted.join(",");
}

// Her tablo için sütun sırasını çek (CREATE TABLE'dan)
function extractColNames(sql, table) {
  const re = new RegExp(
    `CREATE TABLE \`${table}\` \\(([\\s\\S]+?)\\) ENGINE`,
  );
  const m = re.exec(sql);
  if (!m) return [];
  const body = m[1];
  const cols = [];
  for (const line of body.split("\n")) {
    const cm = line.trim().match(/^`(\w+)`/);
    if (cm && !line.trim().startsWith("PRIMARY") && !line.trim().startsWith("UNIQUE") &&
        !line.trim().startsWith("KEY") && !line.trim().startsWith("CONSTRAINT")) {
      cols.push(cm[1]);
    }
  }
  return cols;
}

// ------ Ana dönüşüm ------
const lines = [];

lines.push("-- PostgreSQL / Supabase data import");
lines.push("-- Generated from MariaDB dump");
lines.push("-- Run AFTER: pnpm db:push  (creates tables via Prisma)");
lines.push("");
lines.push("SET session_replication_role = 'replica'; -- FK kontrolünü geçici kapat");
lines.push("");

// MySQL dump'taki tablo adı → PostgreSQL tablo adı eşlemesi
const TABLE_MAP = {
  "_CategoryToProduct": "_categorytoproduct",
  "_HoneyTypeToProduct": "_honeytypetoproduct",
};

for (const table of TABLE_ORDER) {
  // MySQL dump'ta hangi isimle aranacak
  const mysqlTable = TABLE_MAP[table] ?? table;

  const block = extractInserts(input, mysqlTable);
  if (!block) continue;

  const colNames = extractColNames(input, mysqlTable);
  const boolCols = BOOL_COLS[table] || [];

  // INSERT INTO `table` VALUES (...),(...)  → satır satır parse
  const valuesMatch = block.match(/VALUES\s+([\s\S]+);$/s);
  if (!valuesMatch) continue;

  const rows = parseValues(valuesMatch[1]);
  if (rows.length === 0) continue;

  // Tablo adını çift tırnak ile, MySQL backtick'lerini temizle
  const pgTable = `"${table}"`;

  // Sütun listesi — sütun sırası uyumsuzluğunu önlemek için her zaman ekle
  const colList = colNames.length > 0
    ? `(${colNames.map(c => `"${c}"`).join(",")})`
    : "";

  lines.push(`-- ${table} (${rows.length} rows)`);
  // 500'er satırlık chunk'lar halinde ekle
  const chunkSize = 500;
  for (let i = 0; i < rows.length; i += chunkSize) {
    const chunk = rows.slice(i, i + chunkSize);
    const converted = chunk.map(r => `(${convertRow(r, boolCols, colNames)})`);
    lines.push(`INSERT INTO ${pgTable} ${colList} VALUES`);
    lines.push(converted.join(",\n") + ";");
  }
  lines.push("");
}

lines.push("SET session_replication_role = 'origin'; -- FK kontrolünü geri aç");
lines.push("");
lines.push("-- Import tamamlandı.");

let output = lines.join("\n");

// MySQL kaçış karakterlerini PostgreSQL standardına çevir
// 1) \\' → geçici yer tutucu (önce çift ters eğik çizgiyi koru)
// 2) \' → '' (tek tırnak kaçışı)
// 3) \" → " (JSON içindeki çift tırnak MySQL kaçışı kaldır)
// 4) \n \r \t → literal olarak bırak

// Önce \\\\ → gerçek çift backslash'i koru
output = output.replace(/\\\\/g, "\x00DBLBS\x00");
// \' → ''
output = output.replace(/\\'/g, "''");
// \" → " (MySQL JSON string içi escape)
output = output.replace(/\\"/g, '"');
// \x00DBLBS\x00 → \\
output = output.replace(/\x00DBLBS\x00/g, "\\\\");

writeFileSync("postgresql_import.sql", output, "utf8");
console.log("✅ postgresql_import.sql oluşturuldu.");
console.log(`   Toplam satır: ${lines.length}`);
