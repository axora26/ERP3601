import { test } from "node:test";
import assert from "node:assert/strict";
import { hashPassword, verifyPassword } from "./password";

test("verifyPassword accepts the correct password", async () => {
  const hash = await hashPassword("correct horse battery staple");
  assert.equal(await verifyPassword("correct horse battery staple", hash), true);
});

test("verifyPassword rejects an incorrect password", async () => {
  const hash = await hashPassword("correct horse battery staple");
  assert.equal(await verifyPassword("wrong password", hash), false);
});

test("two hashes of the same password are not identical (random salt)", async () => {
  const a = await hashPassword("same-password");
  const b = await hashPassword("same-password");
  assert.notEqual(a, b);
});
