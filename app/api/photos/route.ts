import { mutateResource, readResource } from "@/lib/admin-api";
export async function GET() { return readResource("photos"); }
export async function POST(request: Request) { return mutateResource(request, "photos"); }
export const PUT = POST;
export const DELETE = POST;
