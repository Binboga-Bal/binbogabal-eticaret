-- Performans index'leri — PostgreSQL FK'lere otomatik index oluşturmaz.
-- Prisma isimlendirmesiyle birebir aynı (gelecekteki db push/migrate çakışmaz).
-- CONCURRENTLY = tablo kilidi YOK (sıfır kesinti). IF NOT EXISTS = tekrar çalıştırılabilir.
-- NOT: CONCURRENTLY transaction içinde çalışmaz. Supabase SQL Editor'da hata verirse
--      psql ile çalıştırın:  psql "$DIRECT_URL" -f prisma/sql/perf-indexes.sql

-- CreateIndex
CREATE INDEX CONCURRENTLY IF NOT EXISTS "accounts_userId_idx" ON "accounts"("userId");

-- CreateIndex
CREATE INDEX CONCURRENTLY IF NOT EXISTS "addresses_userId_idx" ON "addresses"("userId");

-- CreateIndex
CREATE INDEX CONCURRENTLY IF NOT EXISTS "admin_allowed_ips_userId_idx" ON "admin_allowed_ips"("userId");

-- CreateIndex
CREATE INDEX CONCURRENTLY IF NOT EXISTS "admin_role_permissions_permissionId_idx" ON "admin_role_permissions"("permissionId");

-- CreateIndex
CREATE INDEX CONCURRENTLY IF NOT EXISTS "admin_roles_parentId_idx" ON "admin_roles"("parentId");

-- CreateIndex
CREATE INDEX CONCURRENTLY IF NOT EXISTS "admin_sessions_userId_idx" ON "admin_sessions"("userId");

-- CreateIndex
CREATE INDEX CONCURRENTLY IF NOT EXISTS "admin_user_roles_roleId_idx" ON "admin_user_roles"("roleId");

-- CreateIndex
CREATE INDEX CONCURRENTLY IF NOT EXISTS "blog_posts_isPublished_publishedAt_idx" ON "blog_posts"("isPublished", "publishedAt");

-- CreateIndex
CREATE INDEX CONCURRENTLY IF NOT EXISTS "campaign_ab_tests_campaignId_idx" ON "campaign_ab_tests"("campaignId");

-- CreateIndex
CREATE INDEX CONCURRENTLY IF NOT EXISTS "campaign_actions_campaignId_idx" ON "campaign_actions"("campaignId");

-- CreateIndex
CREATE INDEX CONCURRENTLY IF NOT EXISTS "campaign_audit_logs_campaignId_idx" ON "campaign_audit_logs"("campaignId");

-- CreateIndex
CREATE INDEX CONCURRENTLY IF NOT EXISTS "campaign_conditions_campaignId_idx" ON "campaign_conditions"("campaignId");

-- CreateIndex
CREATE INDEX CONCURRENTLY IF NOT EXISTS "campaign_displays_campaignId_idx" ON "campaign_displays"("campaignId");

-- CreateIndex
CREATE INDEX CONCURRENTLY IF NOT EXISTS "campaign_notifications_campaignId_idx" ON "campaign_notifications"("campaignId");

-- CreateIndex
CREATE INDEX CONCURRENTLY IF NOT EXISTS "campaign_segments_campaignId_idx" ON "campaign_segments"("campaignId");

-- CreateIndex
CREATE INDEX CONCURRENTLY IF NOT EXISTS "campaign_targets_campaignId_idx" ON "campaign_targets"("campaignId");

-- CreateIndex
CREATE INDEX CONCURRENTLY IF NOT EXISTS "campaign_templates_campaignId_idx" ON "campaign_templates"("campaignId");

-- CreateIndex
CREATE INDEX CONCURRENTLY IF NOT EXISTS "campaigns_status_idx" ON "campaigns"("status");

-- CreateIndex
CREATE INDEX CONCURRENTLY IF NOT EXISTS "campaigns_status_startsAt_endsAt_idx" ON "campaigns"("status", "startsAt", "endsAt");

-- CreateIndex
CREATE INDEX CONCURRENTLY IF NOT EXISTS "categories_parentId_idx" ON "categories"("parentId");

-- CreateIndex
CREATE INDEX CONCURRENTLY IF NOT EXISTS "consent_logs_userId_idx" ON "consent_logs"("userId");

-- CreateIndex
CREATE INDEX CONCURRENTLY IF NOT EXISTS "coupons_campaignId_idx" ON "coupons"("campaignId");

-- CreateIndex
CREATE INDEX CONCURRENTLY IF NOT EXISTS "customer_coupons_couponId_idx" ON "customer_coupons"("couponId");

-- CreateIndex
CREATE INDEX CONCURRENTLY IF NOT EXISTS "favorites_productId_idx" ON "favorites"("productId");

-- CreateIndex
CREATE INDEX CONCURRENTLY IF NOT EXISTS "order_items_orderId_idx" ON "order_items"("orderId");

-- CreateIndex
CREATE INDEX CONCURRENTLY IF NOT EXISTS "order_items_variantId_idx" ON "order_items"("variantId");

-- CreateIndex
CREATE INDEX CONCURRENTLY IF NOT EXISTS "orders_userId_idx" ON "orders"("userId");

-- CreateIndex
CREATE INDEX CONCURRENTLY IF NOT EXISTS "orders_status_idx" ON "orders"("status");

-- CreateIndex
CREATE INDEX CONCURRENTLY IF NOT EXISTS "orders_paymentStatus_idx" ON "orders"("paymentStatus");

-- CreateIndex
CREATE INDEX CONCURRENTLY IF NOT EXISTS "orders_createdAt_idx" ON "orders"("createdAt");

-- CreateIndex
CREATE INDEX CONCURRENTLY IF NOT EXISTS "payment_transactions_orderId_idx" ON "payment_transactions"("orderId");

-- CreateIndex
CREATE INDEX CONCURRENTLY IF NOT EXISTS "product_variants_productId_idx" ON "product_variants"("productId");

-- CreateIndex
CREATE INDEX CONCURRENTLY IF NOT EXISTS "products_isActive_isFeatured_idx" ON "products"("isActive", "isFeatured");

-- CreateIndex
CREATE INDEX CONCURRENTLY IF NOT EXISTS "products_isActive_isBestseller_idx" ON "products"("isActive", "isBestseller");

-- CreateIndex
CREATE INDEX CONCURRENTLY IF NOT EXISTS "products_isActive_createdAt_idx" ON "products"("isActive", "createdAt");

-- CreateIndex
CREATE INDEX CONCURRENTLY IF NOT EXISTS "reviews_userId_idx" ON "reviews"("userId");

-- CreateIndex
CREATE INDEX CONCURRENTLY IF NOT EXISTS "sessions_userId_idx" ON "sessions"("userId");

-- CreateIndex
CREATE INDEX CONCURRENTLY IF NOT EXISTS "temporary_permissions_userId_idx" ON "temporary_permissions"("userId");

-- CreateIndex
CREATE INDEX CONCURRENTLY IF NOT EXISTS "users_role_idx" ON "users"("role");

-- CreateIndex
CREATE INDEX CONCURRENTLY IF NOT EXISTS "volume_discount_products_productId_idx" ON "volume_discount_products"("productId");

