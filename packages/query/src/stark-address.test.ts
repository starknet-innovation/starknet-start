import { describe, expect, it } from "vitest";

import { encodeDomain } from "./stark-address";

describe("encodeDomain", () => {
  it("strips only the .stark suffix", () => {
    // "foo.starkware.stark" must encode as ["foo", "starkware"]; a naive
    // replace(".stark", "") would corrupt it to ["fooware"].
    const encoded = encodeDomain("foo.starkware.stark");
    expect(encoded).toHaveLength(2);
    expect(encoded).toEqual([...encodeDomain("foo.stark"), ...encodeDomain("starkware.stark")]);
  });

  it("encodes a simple domain", () => {
    expect(encodeDomain("vitalik.stark")).toHaveLength(1);
  });

  it("returns the zero domain for an empty string", () => {
    expect(encodeDomain("")).toEqual(["0"]);
  });
});
