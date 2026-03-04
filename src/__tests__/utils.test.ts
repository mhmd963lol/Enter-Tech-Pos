import { describe, it, expect } from "vitest";
import { cn } from "../lib/utils";

describe("cn util", () => {
  it("merges class names", () => {
    const result = cn("btn", "btn-primary", "btn");
    expect(result).toContain("btn-primary");
    expect(result).toContain("btn");
  });
});
