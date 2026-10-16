import { describe, expect, it } from "vitest";
import { ApiError, errorMessage, fieldErrors } from "./api";

const validation = new ApiError("Validation failed", 400, {
  title: "Validation failed",
  detail: "One or more fields are invalid.",
  errors: [
    { path: "name", code: "required", message: "Name is required." },
    { path: "status", code: "invalid", message: "Status must be active, paused or failed." },
  ],
});

describe("errorMessage", () => {
  it("prefers the first field error, which says what to fix", () => {
    expect(errorMessage(validation)).toBe("Name is required.");
  });

  it("falls back to the detail, then the title, then the message", () => {
    expect(errorMessage(new ApiError("m", 409, { title: "t", detail: "d" }))).toBe("d");
    expect(errorMessage(new ApiError("m", 409, { title: "t" }))).toBe("t");
    expect(errorMessage(new ApiError("m", 500, {}))).toBe("m");
  });

  it("handles what is not an API error", () => {
    expect(errorMessage(new Error("network down"))).toBe("network down");
    expect(errorMessage("a string")).toBe("Request failed");
    expect(errorMessage(undefined)).toBe("Request failed");
  });
});

describe("fieldErrors", () => {
  it("keys the messages by field path", () => {
    expect(fieldErrors(validation)).toEqual({
      name: "Name is required.",
      status: "Status must be active, paused or failed.",
    });
  });

  it("is empty when there are no field errors", () => {
    expect(fieldErrors(new ApiError("m", 500, {}))).toEqual({});
    expect(fieldErrors(new Error("network down"))).toEqual({});
  });
});
