import { mutateResource, readResource } from "@/lib/admin-api";
export async function GET() { return readResource("service-areas"); }
export async function POST(request: Request) { return mutateResource(request, "service-areas"); }
export const PUT = POST;
export const DELETE = POST;
