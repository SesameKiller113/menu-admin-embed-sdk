import { describe, expect, it } from "vitest";
import { validateMenuItemForm } from "./formValidation";

describe("validateMenuItemForm", () => {
  it("trims values and parses dollars", () => {
    expect(
      validateMenuItemForm({
        name: "  Soup  ",
        description: "  Tomato soup  ",
        price: "8.50"
      })
    ).toEqual({
      ok: true,
      value: {
        name: "Soup",
        description: "Tomato soup",
        price: 8.5
      }
    });
  });

  it("requires name and description", () => {
    expect(
      validateMenuItemForm({
        name: "",
        description: " ",
        price: "12"
      })
    ).toEqual({
      ok: false,
      errors: {
        name: "Name is required.",
        description: "Description is required."
      }
    });
  });

  it("requires a price with at most two decimals", () => {
    expect(
      validateMenuItemForm({
        name: "Pasta",
        description: "Tomato cream",
        price: "12.999"
      })
    ).toEqual({
      ok: false,
      errors: {
        price: "Use a dollar amount with up to two decimals."
      }
    });
  });
});
