export const Z = {
  base: 0,
  dropdown: 10,
  sticky: 20,
  overlay: 70,
  modal: 40,
  toast: 50,
  tooltip: 60,
} as const;

export type ZKey = keyof typeof Z;
