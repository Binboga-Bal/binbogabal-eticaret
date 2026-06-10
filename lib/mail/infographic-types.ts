export type InfographicIconKey =
  | "honey"
  | "leaf"
  | "shield"
  | "truck"
  | "star"
  | "heart"
  | "check"
  | "gift";

export interface InfographicItem {
  icon: InfographicIconKey;
  text: string;
}

export interface EmailInfographic {
  show: boolean;
  items: InfographicItem[];
}

export const DEFAULT_INFOGRAPHIC: EmailInfographic = {
  show: true,
  items: [
    { icon: "honey", text: "100% Doğal Bal" },
    { icon: "shield", text: "Sertifikalı Üretim" },
    { icon: "truck", text: "Hızlı Teslimat" },
  ],
};

export const INFOGRAPHIC_ICON_OPTIONS: Array<{ value: InfographicIconKey; label: string }> = [
  { value: "honey", label: "Bal / Doğal" },
  { value: "leaf", label: "Yaprak / Organik" },
  { value: "shield", label: "Kalkan / Güvenlik" },
  { value: "truck", label: "Kamyon / Kargo" },
  { value: "star", label: "Yıldız / Kalite" },
  { value: "heart", label: "Kalp / Sevgi" },
  { value: "check", label: "Tik / Onay" },
  { value: "gift", label: "Hediye / Kampanya" },
];
