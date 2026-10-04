import { describe, expect, it } from "vitest";
import { hasAdminClaim } from "../lib/firebase/claims";

describe("Firebase admin authorization", () => {
  it("requires the explicit boolean admin claim", () => {
    expect(hasAdminClaim({ admin: true })).toBe(true);
    expect(hasAdminClaim({ admin: false })).toBe(false);
    expect(hasAdminClaim({ admin: "true" })).toBe(false);
    expect(hasAdminClaim({})).toBe(false);
  });
});
