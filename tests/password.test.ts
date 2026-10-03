import { describe, expect, it } from "vitest";
import { hashPassword, verifyPassword } from "@/lib/auth/password";

const PASSWORD = "correct horse battery staple";

describe("password hashing", () => {
  it("verifies the correct password", async () => {
    const hash = await hashPassword(PASSWORD);
    await expect(verifyPassword(PASSWORD, hash)).resolves.toBe(true);
  });

  it("rejects a wrong password", async () => {
    const hash = await hashPassword(PASSWORD);
    await expect(verifyPassword("wrong password", hash)).resolves.toBe(false);
  });

  it("uses a fresh salt for each password", async () => {
    const first = await hashPassword(PASSWORD);
    const second = await hashPassword(PASSWORD);
    expect(first).not.toBe(second);
  });
});
