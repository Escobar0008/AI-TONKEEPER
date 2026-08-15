import { Resend } from "resend";

export const resend = new Resend(
  process.env.RESEND_API_KEY || ""
);

export function getResend(): Resend {
  return resend;
}