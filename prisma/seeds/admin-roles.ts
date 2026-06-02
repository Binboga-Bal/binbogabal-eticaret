import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

const SYSTEM_ROLES = [
  { name: "Süper Admin", slug: "super_admin", description: "Tüm sisteme tam erişim", color: "#ef4444", isSystem: true },
  { name: "Admin", slug: "admin", description: "Genel yönetim yetkisi", color: "#f97316", isSystem: true },
  { name: "Editör", slug: "editor", description: "İçerik ve ürün yönetimi", color: "#3b82f6", isSystem: true },
  { name: "Muhasebe", slug: "accounting", description: "Finans, fatura ve raporlar", color: "#22c55e", isSystem: true },
  { name: "Kargo Görevlisi", slug: "shipping", description: "Sipariş ve kargo yönetimi", color: "#a855f7", isSystem: true },
  { name: "Müşteri Hizmetleri", slug: "support", description: "Müşteri ve sipariş görüntüleme", color: "#06b6d4", isSystem: true },
];

// module, action, scope?, fieldGroup?
const ALL_PERMISSIONS = [
  // Dashboard
  { module: "dashboard", action: "view", description: "Dashboard görüntüle" },
  // Ürünler
  { module: "products", action: "view", description: "Ürün listesi görüntüle" },
  { module: "products", action: "create", description: "Ürün oluştur" },
  { module: "products", action: "update", description: "Ürün güncelle" },
  { module: "products", action: "delete", description: "Ürün sil" },
  { module: "products", action: "view", scope: "pricing", fieldGroup: "pricing", description: "Ürün fiyat bilgisi görüntüle" },
  // Siparişler
  { module: "orders", action: "view", description: "Sipariş görüntüle" },
  { module: "orders", action: "update", description: "Sipariş güncelle" },
  { module: "orders", action: "delete", description: "Sipariş sil" },
  { module: "orders", action: "export", description: "Sipariş dışa aktar" },
  // Müşteriler
  { module: "customers", action: "view", description: "Müşteri görüntüle" },
  { module: "customers", action: "view", scope: "personal_data", fieldGroup: "personal_data", description: "Müşteri kişisel veri görüntüle" },
  { module: "customers", action: "update", description: "Müşteri güncelle" },
  { module: "customers", action: "delete", description: "Müşteri sil" },
  // Kampanyalar
  { module: "campaigns", action: "view", description: "Kampanya görüntüle" },
  { module: "campaigns", action: "create", description: "Kampanya oluştur" },
  { module: "campaigns", action: "update", description: "Kampanya güncelle" },
  { module: "campaigns", action: "delete", description: "Kampanya sil" },
  // Finans
  { module: "finance", action: "view", description: "Finans raporları görüntüle" },
  { module: "finance", action: "export", description: "Finans raporu dışa aktar" },
  // Admin kullanıcılar
  { module: "admin_users", action: "view", description: "Admin kullanıcı görüntüle" },
  { module: "admin_users", action: "create", description: "Admin kullanıcı oluştur" },
  { module: "admin_users", action: "update", description: "Admin kullanıcı güncelle" },
  { module: "admin_users", action: "delete", description: "Admin kullanıcı sil" },
  // Rol yönetimi
  { module: "roles", action: "view", description: "Rol görüntüle" },
  { module: "roles", action: "create", description: "Rol oluştur" },
  { module: "roles", action: "update", description: "Rol güncelle" },
  { module: "roles", action: "delete", description: "Rol sil" },
  // Sistem ayarları
  { module: "settings", action: "view", description: "Sistem ayarları görüntüle" },
  { module: "settings", action: "update", description: "Sistem ayarları güncelle" },
  // Audit log
  { module: "audit_log", action: "view", description: "Audit log görüntüle" },
  { module: "audit_log", action: "export", description: "Audit log dışa aktar" },
  // İçerik
  { module: "content", action: "view", description: "İçerik görüntüle" },
  { module: "content", action: "create", description: "İçerik oluştur" },
  { module: "content", action: "update", description: "İçerik güncelle" },
  { module: "content", action: "delete", description: "İçerik sil" },
  // Kategoriler
  { module: "categories", action: "view", description: "Kategori görüntüle" },
  { module: "categories", action: "create", description: "Kategori oluştur" },
  { module: "categories", action: "update", description: "Kategori güncelle" },
  { module: "categories", action: "delete", description: "Kategori sil" },
  // Hacim indirimleri
  { module: "volume_discounts", action: "view", description: "Hacim indirimi görüntüle" },
  { module: "volume_discounts", action: "create", description: "Hacim indirimi oluştur" },
  { module: "volume_discounts", action: "update", description: "Hacim indirimi güncelle" },
  { module: "volume_discounts", action: "delete", description: "Hacim indirimi sil" },
  // ERP
  { module: "erp", action: "view", description: "ERP sync görüntüle" },
  { module: "erp", action: "sync", description: "ERP sync başlat" },
  // Görsel / Medya yönetimi
  { module: "media", action: "view", description: "Banner ve görsel yönetimi görüntüle" },
  { module: "media", action: "update", description: "Banner ve görsel yönetimi güncelle" },
];

// role_slug -> [{ module, action, scope?, granted }]
const ROLE_PERMISSIONS: Record<string, { module: string; action: string; scope?: string; granted: boolean }[]> = {
  super_admin: ALL_PERMISSIONS.map((p) => ({ module: p.module, action: p.action, scope: p.scope, granted: true })),
  admin: [
    { module: "dashboard", action: "view", granted: true },
    { module: "products", action: "view", granted: true },
    { module: "products", action: "create", granted: true },
    { module: "products", action: "update", granted: true },
    { module: "products", action: "delete", granted: true },
    { module: "products", action: "view", scope: "pricing", granted: true },
    { module: "orders", action: "view", granted: true },
    { module: "orders", action: "update", granted: true },
    { module: "orders", action: "export", granted: true },
    { module: "customers", action: "view", granted: true },
    { module: "customers", action: "view", scope: "personal_data", granted: true },
    { module: "customers", action: "update", granted: true },
    { module: "campaigns", action: "view", granted: true },
    { module: "campaigns", action: "create", granted: true },
    { module: "campaigns", action: "update", granted: true },
    { module: "finance", action: "view", granted: true },
    { module: "finance", action: "export", granted: true },
    { module: "audit_log", action: "view", granted: true },
    { module: "content", action: "view", granted: true },
    { module: "content", action: "create", granted: true },
    { module: "content", action: "update", granted: true },
    { module: "categories", action: "view", granted: true },
    { module: "categories", action: "create", granted: true },
    { module: "categories", action: "update", granted: true },
    { module: "volume_discounts", action: "view", granted: true },
    { module: "volume_discounts", action: "create", granted: true },
    { module: "volume_discounts", action: "update", granted: true },
    { module: "erp", action: "view", granted: true },
    { module: "erp", action: "sync", granted: true },
    { module: "media", action: "view", granted: true },
    { module: "media", action: "update", granted: true },
  ],
  editor: [
    { module: "dashboard", action: "view", granted: true },
    { module: "products", action: "view", granted: true },
    { module: "products", action: "create", granted: true },
    { module: "products", action: "update", granted: true },
    { module: "campaigns", action: "view", granted: true },
    { module: "campaigns", action: "create", granted: true },
    { module: "campaigns", action: "update", granted: true },
    { module: "content", action: "view", granted: true },
    { module: "content", action: "create", granted: true },
    { module: "content", action: "update", granted: true },
    { module: "categories", action: "view", granted: true },
    { module: "volume_discounts", action: "view", granted: true },
  ],
  accounting: [
    { module: "dashboard", action: "view", granted: true },
    { module: "orders", action: "view", granted: true },
    { module: "orders", action: "export", granted: true },
    { module: "customers", action: "view", granted: true },
    { module: "products", action: "view", granted: true },
    { module: "products", action: "view", scope: "pricing", granted: true },
    { module: "finance", action: "view", granted: true },
    { module: "finance", action: "export", granted: true },
  ],
  shipping: [
    { module: "dashboard", action: "view", granted: true },
    { module: "orders", action: "view", granted: true },
    { module: "orders", action: "update", granted: true },
  ],
  support: [
    { module: "dashboard", action: "view", granted: true },
    { module: "orders", action: "view", granted: true },
    { module: "customers", action: "view", granted: true },
    { module: "customers", action: "view", scope: "personal_data", granted: true },
  ],
};

export async function seedAdminRoles() {
  console.log("🔐 Admin rolleri oluşturuluyor...");

  // Default password policy
  const existingPolicy = await prisma.passwordPolicy.findFirst();
  if (!existingPolicy) {
    await prisma.passwordPolicy.create({
      data: {
        minLength: 8,
        requireUppercase: true,
        requireLowercase: true,
        requireNumbers: true,
        requireSpecialChars: true,
        preventReuse: 5,
        maxFailedAttempts: 5,
        lockoutDuration: 30,
        sessionTimeoutMinutes: 480,
        require2FAForRoles: ["super_admin"],
      },
    });
    console.log("✅ Şifre politikası oluşturuldu");
  }

  // Upsert all permissions
  for (const p of ALL_PERMISSIONS) {
    await prisma.permission.upsert({
      where: { module_action_scope: { module: p.module, action: p.action, scope: p.scope ?? "" } },
      create: {
        module: p.module,
        action: p.action,
        scope: p.scope ?? "",
        fieldGroup: p.fieldGroup ?? null,
        description: p.description,
        isSystem: true,
      },
      update: { description: p.description },
    });
  }
  console.log(`✅ ${ALL_PERMISSIONS.length} izin tanımı oluşturuldu`);

  // Upsert roles
  for (const role of SYSTEM_ROLES) {
    await prisma.adminRole.upsert({
      where: { slug: role.slug },
      create: role,
      update: { name: role.name, description: role.description, color: role.color },
    });
  }
  console.log("✅ Sistem rolleri oluşturuldu");

  // Assign permissions to roles
  for (const [slug, perms] of Object.entries(ROLE_PERMISSIONS)) {
    const role = await prisma.adminRole.findUnique({ where: { slug } });
    if (!role) continue;

    for (const p of perms) {
      const permission = await prisma.permission.findUnique({
        where: { module_action_scope: { module: p.module, action: p.action, scope: p.scope ?? "" } },
      });
      if (!permission) continue;

      await prisma.adminRolePermission.upsert({
        where: { roleId_permissionId: { roleId: role.id, permissionId: permission.id } },
        create: { roleId: role.id, permissionId: permission.id, granted: p.granted },
        update: { granted: p.granted },
      });
    }
  }
  console.log("✅ Rol izinleri atandı");

  // Create super admin user
  const superAdminRole = await prisma.adminRole.findUnique({ where: { slug: "super_admin" } });
  if (!superAdminRole) throw new Error("super_admin role not found");

  const passwordHash = await bcrypt.hash("Admin123!@#", 12);
  const superAdmin = await prisma.adminUser.upsert({
    where: { email: "superadmin@binbogabal.com.tr" },
    create: {
      email: "superadmin@binbogabal.com.tr",
      passwordHash,
      name: "Süper Admin",
      status: "ACTIVE",
      isSuperAdmin: true,
      passwordChangedAt: new Date(),
    },
    update: {},
  });

  await prisma.adminUserRole.upsert({
    where: { userId_roleId: { userId: superAdmin.id, roleId: superAdminRole.id } },
    create: { userId: superAdmin.id, roleId: superAdminRole.id },
    update: {},
  });

  console.log("✅ Süper Admin kullanıcısı oluşturuldu (superadmin@binbogabal.com.tr / Admin123!@#)");
}
