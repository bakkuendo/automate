import { describe, it, expect } from "vitest";
import { greet } from "automate";

describe("greet", () => {
  it("returns greeting with name", () => {
    expect(greet("test")).toBe("Hello test");
  });

  it("returns a string", () => {
    expect(typeof greet("world")).toBe("string");
  });
});
