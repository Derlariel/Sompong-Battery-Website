import { redirect } from "next/navigation";
import { getAdmin } from "@/lib/auth";
import LoginForm from "@/components/admin/LoginForm";
import { isFirebaseAdminConfigured } from "@/lib/firebase/admin";
export default async function LoginPage() {
  if (await getAdmin()) redirect("/admin");
  const firebaseMode = process.env.DATA_SOURCE === "firebase";
  const clientConfigured = Boolean(process.env.NEXT_PUBLIC_FIREBASE_API_KEY && process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN && process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID);
  const configured = firebaseMode ? clientConfigured && isFirebaseAdminConfigured() : Boolean(process.env.DATABASE_URL && process.env.NEXTAUTH_SECRET && process.env.NEXTAUTH_SECRET.length >= 32);
  return <LoginForm configured={configured} firebaseMode={firebaseMode} />;
}
