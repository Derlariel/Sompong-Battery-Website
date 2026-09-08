export function sameOrigin(request: Request) {
  // Next may rewrite request.url to an internal host. Never trust Host or forwarded
  // headers as the allowed origin; use the configured public origin instead.
  const expected = process.env.SITE_URL || process.env.NEXTAUTH_URL || "http://127.0.0.1:3000";
  return request.headers.get("origin") === new URL(expected).origin;
}
