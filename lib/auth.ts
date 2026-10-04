import "server-only";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { prisma } from "./prisma";
import { verifySession } from "./session";
import { verifyFirebaseAdminSession } from "./firebase/auth";
export const sessionCookie = "sompong-session";
export async function getAdmin() {
  const token = (await cookies()).get(sessionCookie)?.value;
  if (process.env.DATA_SOURCE === "firebase") return token ? verifyFirebaseAdminSession(token) : null;
  if (!process.env.DATABASE_URL || !process.env.NEXTAUTH_SECRET) return null;
  if (!token) return null;
  const id = await verifySession(token);
  return id ? prisma.adminUser.findUnique({ where: { id }, select: { id: true, username: true } }) : null;
}
export async function requireAdmin() {
  const admin = await getAdmin();
  if (!admin) redirect("/admin/login");
  return admin;
}
export { sameOrigin } from "./origin";
