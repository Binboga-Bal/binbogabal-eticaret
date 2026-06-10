import { prisma } from "@/lib/prisma";

export interface EmailTemplateContent {
  subject: string;
  title: string;
  body: string;
  buttonText?: string;
  note?: string;
}

export interface EmailTemplateDefinition {
  key: string;
  name: string;
  description: string;
  hasButton: boolean;
  hasNote: boolean;
  defaults: EmailTemplateContent;
}

export const EMAIL_TEMPLATE_DEFINITIONS: EmailTemplateDefinition[] = [
  {
    key: "verify-email",
    name: "E-posta Doğrulama",
    description: "Yeni kayıt sonrası e-posta doğrulama linki",
    hasButton: true,
    hasNote: true,
    defaults: {
      subject: "E-posta adresinizi doğrulayın",
      title: "E-postanızı doğrulayın",
      body: "Binboğa Kooperatif Balı ailesine hoş geldiniz.\nHesabınızı aktifleştirmek için e-posta adresinizi doğrulamanız gerekiyor.\nAşağıdaki butona tıklayarak e-posta adresinizi doğrulayabilirsiniz.",
      buttonText: "E-Postamı Doğrula",
      note: "Bu doğrulama bağlantısı 24 saat geçerlidir.",
    },
  },
  {
    key: "welcome",
    name: "Hoş Geldiniz",
    description: "Hesap doğrulandıktan sonra gönderilen karşılama maili",
    hasButton: true,
    hasNote: false,
    defaults: {
      subject: "Binboğa Kooperatif Balı'ne Hoş Geldiniz!",
      title: "Hoş geldiniz!",
      body: "Binboğa ailesine katıldığınız için teşekkür ederiz.\nDoğal ve saf bal ürünlerimizi keşfetmek için mağazamızı ziyaret edin.",
      buttonText: "Ürünleri Keşfet",
    },
  },
  {
    key: "password-reset",
    name: "Şifre Sıfırlama",
    description: "Şifre sıfırlama isteği sonrası gönderilen link",
    hasButton: true,
    hasNote: true,
    defaults: {
      subject: "Şifrenizi sıfırlayın",
      title: "Şifre Sıfırlama",
      body: "Şifrenizi sıfırlamak için aşağıdaki butona tıklayın.\nBu isteği siz yapmadıysanız hesabınız güvende — bu e-postayı görmezden gelin.",
      buttonText: "Şifremi Sıfırla",
      note: "Bu bağlantı 1 saat geçerlidir.",
    },
  },
  {
    key: "password-changed",
    name: "Şifre Değiştirildi",
    description: "Şifre başarıyla değiştirildiğinde bildirim",
    hasButton: false,
    hasNote: false,
    defaults: {
      subject: "Şifreniz değiştirildi",
      title: "Şifreniz Güncellendi",
      body: "Hesabınızın şifresi başarıyla değiştirildi.\nBu değişikliği siz yapmadıysanız lütfen hemen bizimle iletişime geçin.",
    },
  },
  {
    key: "order-confirmed",
    name: "Sipariş Onayı",
    description: "Sipariş alındığında gönderilen onay maili",
    hasButton: true,
    hasNote: false,
    defaults: {
      subject: "Siparişiniz alındı",
      title: "Siparişiniz Alındı!",
      body: "Siparişiniz başarıyla oluşturuldu. En kısa sürede hazırlayıp kargoya vereceğiz.",
      buttonText: "Siparişimi Görüntüle",
    },
  },
  {
    key: "order-status-changed",
    name: "Sipariş Durumu Güncellendi",
    description: "Sipariş durumu değiştiğinde (hazırlanıyor, kargoda vb.) bildirim",
    hasButton: true,
    hasNote: false,
    defaults: {
      subject: "Sipariş durumunuz güncellendi",
      title: "Sipariş Durumu Güncellendi",
      body: "Siparişinizin durumu güncellendi. Aşağıdan detayları inceleyebilirsiniz.",
      buttonText: "Siparişimi Görüntüle",
    },
  },
  {
    key: "favorite-discount",
    name: "Favori Ürün İndirimi",
    description: "Favorilenen ürünlerde indirim olduğunda bildirim",
    hasButton: false,
    hasNote: false,
    defaults: {
      subject: "Favori ürününüzde indirim!",
      title: "Favori Ürününüzde İndirim!",
      body: "Favorilerinize eklediğiniz ürünlerde indirim başladı. Fırsatı kaçırmayın!",
    },
  },
  {
    key: "coupon-expiry",
    name: "Kupon Son Kullanım",
    description: "Kupon süresi dolmak üzereyken hatırlatma",
    hasButton: true,
    hasNote: false,
    defaults: {
      subject: "Kuponunuzun süresi dolmak üzere",
      title: "Kuponunuzun Süresi Dolmak Üzere!",
      body: "Kullanmayı unuttuğunuz bir kuponunuz var. Son kullanım tarihinden önce alışverişinizi tamamlayın.",
      buttonText: "Hemen Kullan",
    },
  },
  {
    key: "review-request",
    name: "Yorum İsteği",
    description: "Teslimat sonrası ürün yorumu için davet",
    hasButton: false,
    hasNote: false,
    defaults: {
      subject: "Ürünlerimizi değerlendirin",
      title: "Deneyiminizi Paylaşın",
      body: "Sipariş ettiğiniz ürünlerimizi aldınız. Diğer müşterilere yardımcı olmak için yorum yazmak ister misiniz?",
    },
  },
  {
    key: "review-reply",
    name: "Yorum Yanıtı",
    description: "Adminin bir yoruma yanıt verdiğinde bildirim",
    hasButton: true,
    hasNote: false,
    defaults: {
      subject: "Yorumunuza yanıt geldi",
      title: "Yorumunuza Yanıt Geldi",
      body: "Bıraktığınız yorum için teşekkür ederiz. Ekibimiz yorumunuzu yanıtladı.",
      buttonText: "Yorumu Görüntüle",
    },
  },
  {
    key: "contact-form",
    name: "İletişim Formu",
    description: "Müşteri iletişim formu doldurduğunda adminin aldığı mail",
    hasButton: false,
    hasNote: false,
    defaults: {
      subject: "Yeni iletişim formu mesajı",
      title: "Yeni İletişim Mesajı",
      body: "Web sitesi iletişim formundan yeni bir mesaj aldınız.",
    },
  },
  {
    key: "admin-invite",
    name: "Admin Davet",
    description: "Yeni admin kullanıcı davet edildiğinde gönderilen mail",
    hasButton: true,
    hasNote: true,
    defaults: {
      subject: "Admin paneline davet edildiniz",
      title: "Admin Paneline Davet Edildiniz",
      body: "Binboğa Kooperatif Balı admin paneline erişim daveti aldınız.\nAşağıdaki butona tıklayarak hesabınızı aktifleştirebilirsiniz.",
      buttonText: "Daveti Kabul Et",
      note: "Bu davet bağlantısı 48 saat geçerlidir.",
    },
  },
];

const SETTING_PREFIX = "email_template_";

function keyToSettingKey(key: string): string {
  return SETTING_PREFIX + key.replace(/-/g, "_");
}

export async function getTemplateContent(key: string): Promise<EmailTemplateContent> {
  const definition = EMAIL_TEMPLATE_DEFINITIONS.find((d) => d.key === key);
  const defaults = definition?.defaults ?? { subject: "", title: "", body: "" };

  try {
    const setting = await prisma.siteSetting.findUnique({
      where: { key: keyToSettingKey(key) },
    });
    if (setting?.value) {
      const parsed = JSON.parse(setting.value) as Partial<EmailTemplateContent>;
      return {
        subject: parsed.subject || defaults.subject,
        title: parsed.title || defaults.title,
        body: parsed.body || defaults.body,
        buttonText: parsed.buttonText ?? defaults.buttonText,
        note: parsed.note ?? defaults.note,
      };
    }
  } catch {
    // fall through to defaults
  }

  return defaults;
}

export async function saveTemplateContent(key: string, content: EmailTemplateContent): Promise<void> {
  const settingKey = keyToSettingKey(key);
  await prisma.siteSetting.upsert({
    where: { key: settingKey },
    create: { key: settingKey, value: JSON.stringify(content) },
    update: { value: JSON.stringify(content) },
  });
}

export async function getAllTemplateContents(): Promise<Record<string, EmailTemplateContent>> {
  const keys = EMAIL_TEMPLATE_DEFINITIONS.map((d) => keyToSettingKey(d.key));
  const settings = await prisma.siteSetting.findMany({
    where: { key: { in: keys } },
  });
  const settingsMap = Object.fromEntries(settings.map((s) => [s.key, s.value]));

  const result: Record<string, EmailTemplateContent> = {};
  for (const def of EMAIL_TEMPLATE_DEFINITIONS) {
    const settingKey = keyToSettingKey(def.key);
    const raw = settingsMap[settingKey];
    if (raw) {
      try {
        const parsed = JSON.parse(raw) as Partial<EmailTemplateContent>;
        result[def.key] = {
          subject: parsed.subject || def.defaults.subject,
          title: parsed.title || def.defaults.title,
          body: parsed.body || def.defaults.body,
          buttonText: parsed.buttonText ?? def.defaults.buttonText,
          note: parsed.note ?? def.defaults.note,
        };
        continue;
      } catch {
        // fall through to defaults
      }
    }
    result[def.key] = { ...def.defaults };
  }
  return result;
}
