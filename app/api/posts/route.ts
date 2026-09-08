import { mutateResource, readResource } from "@/lib/admin-api";
export async function GET() { return readResource("posts"); }
export async function POST(request: Request) { return mutateResource(request, "posts"); }
export const PUT = POST;
export const DELETE = POST;
