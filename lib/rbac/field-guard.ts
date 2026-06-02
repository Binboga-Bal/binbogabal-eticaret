import { canAccessField } from "./permission-checker";

// Alan grupları: hangi alanlar hangi fieldGroup'a ait
const FIELD_GROUP_MAP: Record<string, Record<string, string>> = {
  products: {
    price: "pricing",
    discountedPrice: "pricing",
  },
  customers: {
    phone: "personal_data",
    taxNumber: "personal_data",
    taxOffice: "personal_data",
  },
};

export async function filterFields<T extends Record<string, unknown>>(
  adminId: string,
  data: T,
  module: string
): Promise<Partial<T>> {
  const fieldMap = FIELD_GROUP_MAP[module];
  if (!fieldMap) return data;

  const result = { ...data };
  for (const [field, fieldGroup] of Object.entries(fieldMap)) {
    if (field in result) {
      const allowed = await canAccessField(adminId, module, fieldGroup);
      if (!allowed) {
        delete result[field as keyof T];
      }
    }
  }
  return result;
}
