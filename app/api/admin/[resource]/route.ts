import { mutateResource, readResource } from "@/lib/admin-api";
type Context = { params: Promise<{ resource: string }> };
async function mutate(request: Request, { params }: Context) { return mutateResource(request, (await params).resource); }
export async function GET(_request: Request, { params }: Context) { return readResource((await params).resource); }
export const POST = mutate;
export const PUT = mutate;
export const DELETE = mutate;
