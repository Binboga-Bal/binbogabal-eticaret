export const dynamic = "force-dynamic";

import { requirePermission } from "@/lib/rbac/guards";
import { getAllTemplateContents, EMAIL_TEMPLATE_DEFINITIONS } from "@/lib/mail/template-content";
import { EmailTemplateEditor } from "@/components/admin/EmailTemplateEditor";

export const metadata = { title: "E-posta Şablonları | Admin" };

export default async function EmailTemplatesPage() {
  await requirePermission("settings", "view");

  const contents = await getAllTemplateContents();

  const templates = EMAIL_TEMPLATE_DEFINITIONS.map((def) => ({
    key: def.key,
    name: def.name,
    description: def.description,
    hasButton: def.hasButton,
    hasNote: def.hasNote,
    content: contents[def.key] ?? def.defaults,
  }));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-gray-900">E-posta Şablonları</h1>
        <p className="text-sm text-gray-500 mt-1">
          Müşterilere ve yöneticilere gönderilen e-postaların konu, başlık, içerik ve buton metinlerini buradan düzenleyin.
          Tasarım (ikonlar, renkler, logo) koddan yönetilir; sadece metinler değiştirilebilir.
        </p>
      </div>
      <EmailTemplateEditor initialTemplates={templates} />
    </div>
  );
}
