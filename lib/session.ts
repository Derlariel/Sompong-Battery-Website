import { SignJWT, jwtVerify } from "jose";
function key() {
  const secret = process.env.NEXTAUTH_SECRET;
  if (!secret || secret.length < 32) throw new Error("NEXTAUTH_SECRET must contain at least 32 characters.");
  return new TextEncoder().encode(secret);
}
export async function signSession(userId: string) {
  return new SignJWT({}).setProtectedHeader({ alg: "HS256" }).setSubject(userId).setIssuedAt().setIssuer("sompong-battery").setAudience("admin").setExpirationTime("8h").sign(key());
}
export async function verifySession(token: string) {
  try {
    const { payload } = await jwtVerify(token, key(), { algorithms: ["HS256"], issuer: "sompong-battery", audience: "admin" });
    return payload.sub ?? null;
  } catch { return null; }
}
