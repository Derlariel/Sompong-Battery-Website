import { redirect } from "next/navigation";
import { getAdmin } from "@/lib/auth";
import LoginForm from "@/components/admin/LoginForm";
export default async function LoginPage() {
  if (await getAdmin()) redirect("/admin");
  return <LoginForm configured={Boolean(process.env.DATABASE_URL && process.env.NEXTAUTH_SECRET && process.env.NEXTAUTH_SECRET.length >= 32)} />;
}
