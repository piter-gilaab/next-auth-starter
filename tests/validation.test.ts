import { describe, expect, it } from "vitest";
import { registerSchema } from "@/lib/auth/validation";

describe("registration validation", () => {
  it("accepts a valid registration", () => {
    const result = registerSchema.safeParse({
      name: "Test User",
      email: "TEST@example.com",
      password: "this is a long password",
      confirmPassword: "this is a long password",
    });

    expect(result.success).toBe(true);
    if (result.success) expect(result.data.email).toBe("test@example.com");
  });

  it("rejects mismatched passwords", () => {
    const result = registerSchema.safeParse({
      name: "Test User",
      email: "test@example.com",
      password: "this is a long password",
      confirmPassword: "this is another password",
    });

    expect(result.success).toBe(false);
  });
});
