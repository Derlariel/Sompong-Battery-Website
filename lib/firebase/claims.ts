export function hasAdminClaim(claims: object) {
  return "admin" in claims && claims.admin === true;
}
