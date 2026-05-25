/**
 * Mevcut `products.honeyTypeId` verilerini yeni many-to-many join tablosuna taşır.
 * Schema güncellenmeden ÖNCE çalıştırın:
 *   node scripts/migrate-honey-types.mjs
 */
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const rows = await prisma.$queryRaw`
    SELECT id, honeyTypeId FROM products WHERE honeyTypeId IS NOT NULL
  `;

  console.log(`${rows.length} üründe bal türü ataması bulundu.`);
  if (rows.length === 0) return;

  await prisma.$executeRawUnsafe(`
    CREATE TABLE IF NOT EXISTS \`_HoneyTypeToProduct\` (
      \`A\` varchar(191) NOT NULL,
      \`B\` varchar(191) NOT NULL,
      UNIQUE KEY \`_HoneyTypeToProduct_AB_unique\` (\`A\`,\`B\`),
      KEY \`_HoneyTypeToProduct_B_index\` (\`B\`),
      CONSTRAINT \`_HoneyTypeToProduct_A_fkey\`
        FOREIGN KEY (\`A\`) REFERENCES \`honey_types\`(\`id\`) ON DELETE CASCADE ON UPDATE CASCADE,
      CONSTRAINT \`_HoneyTypeToProduct_B_fkey\`
        FOREIGN KEY (\`B\`) REFERENCES \`products\`(\`id\`) ON DELETE CASCADE ON UPDATE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  `);

  await prisma.$executeRawUnsafe(`
    INSERT IGNORE INTO \`_HoneyTypeToProduct\` (\`A\`, \`B\`)
    SELECT honeyTypeId, id FROM products WHERE honeyTypeId IS NOT NULL
  `);

  console.log(`${rows.length} ilişki join tablosuna taşındı.`);
  console.log("Şimdi schema.prisma güncelleyin ve: npx prisma db push --accept-data-loss");
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
