import "server-only";
import { firebaseAdminAuth, isFirebaseAdminConfigured } from "./admin";
import { hasAdminClaim } from "./claims";

export const firebaseSessionMaxAge = 8 * 60 * 60;

export async function createFirebaseAdminSession(idToken: string) {
  const decoded = await firebaseAdminAuth().verifyIdToken(idToken, true);
  if (!hasAdminClaim(decoded)) return null;
  return firebaseAdminAuth().createSessionCookie(idToken, { expiresIn: firebaseSessionMaxAge * 1000 });
}

export async function verifyFirebaseAdminSession(cookie: string) {
  if (!isFirebaseAdminConfigured()) return null;
  try {
    const decoded = await firebaseAdminAuth().verifySessionCookie(cookie, true);
    return hasAdminClaim(decoded) ? { id: decoded.uid, username: decoded.email ?? decoded.uid } : null;
  } catch {
    return null;
  }
}
