import { randomBytes } from "crypto";

// No 0/O/1/I/L to keep codes easy to read over Telegram.
const ALPHABET = "ABCDEFGHJKMNPQRSTUVWXYZ23456789";

export function generateOrderCode() {
  const bytes = randomBytes(6);
  let code = "";
  for (const byte of bytes) code += ALPHABET[byte % ALPHABET.length];
  return `ORD-${code}`;
}
