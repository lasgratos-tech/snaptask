import crypto from "crypto";

/**
 * Génère une API key SnapTask
 *
 * Formats :
 * - test : sk_test_<random>
 * - live : sk_live_<random>
 */
export function generateApiKey(
  mode: "test" | "live" = "test"
): string {
  const prefix = mode === "live" ? "sk_live_" : "sk_test_";
  const random = crypto.randomBytes(16).toString("hex"); // 32 chars
  return `${prefix}${random}`;
}
