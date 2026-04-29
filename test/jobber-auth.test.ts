import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { isJobberOAuthRenewRequired } from "../src/adapters/jobber.js";

describe("isJobberOAuthRenewRequired", () => {
  it("flags expired Jobber refresh-token errors", () => {
    assert.equal(
      isJobberOAuthRenewRequired(
        "Jobber refresh token expired — re-authorize at https://api.getjobber.com/api/oauth/authorize",
      ),
      true,
    );
  });

  it("does not flag normal sync failures", () => {
    assert.equal(isJobberOAuthRenewRequired("Tab \"May\" not found"), false);
  });
});
