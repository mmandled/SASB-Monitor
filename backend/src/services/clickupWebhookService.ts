import crypto from "crypto";

export function verifyClickUpWebhookSignature(
  rawBody: Buffer | undefined,
  signature: string | undefined,
): boolean {
  const secret = process.env.CLICKUP_WEBHOOK_SECRET?.trim();

  if (!secret || !rawBody || !signature) {
    return false;
  }

  const expectedSignature = crypto
    .createHmac("sha256", secret)
    .update(rawBody)
    .digest("hex");

  const expected = Buffer.from(expectedSignature, "utf8");
  const received = Buffer.from(signature, "utf8");

  if (expected.length !== received.length) {
    return false;
  }

  return crypto.timingSafeEqual(expected, received);
}