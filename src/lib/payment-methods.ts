import type { PaymentMethod } from "@/generated/prisma/enums";

/**
 * TODO(owner): replace with your real wallet numbers and QR codes.
 * Drop your QR images into public/payments/ using the same file names
 * (PNG or JPG also fine — update qrSrc accordingly).
 */
export const paymentMethods: {
  id: PaymentMethod;
  label: string;
  account: string;
  holder: string;
  qrSrc: string;
  note: string;
}[] = [
  {
    id: "KBZPAY",
    label: "KBZPay",
    account: "09 777 000 111",
    holder: "GG Mart",
    qrSrc: "/payments/kbzpay-qr.svg",
    note: "Pay in Myanmar kyat (MMK)",
  },
  {
    id: "WAVE_MONEY",
    label: "Wave Money",
    account: "09 777 000 111",
    holder: "GG Mart",
    qrSrc: "/payments/wave-qr.svg",
    note: "Pay in Myanmar kyat (MMK)",
  },
  {
    id: "PROMPTPAY",
    label: "PromptPay",
    account: "+66 90 000 0000",
    holder: "GG Mart",
    qrSrc: "/payments/promptpay-qr.svg",
    note: "Pay in Thai baht; confirm the rate on Telegram first",
  },
];

export const paymentMethodLabels: Record<string, string> = Object.fromEntries(
  paymentMethods.map((method) => [method.id, method.label])
);
