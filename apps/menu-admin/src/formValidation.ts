import type { MenuItemInput } from "@menu-admin-embed-sdk/core";

export type MenuItemFormValues = {
  name: string;
  description: string;
  price: string;
};

export type MenuItemFormErrors = Partial<
  Record<keyof MenuItemFormValues, string>
>;

export type MenuItemFormResult =
  | {
      ok: true;
      value: MenuItemInput;
    }
  | {
      ok: false;
      errors: MenuItemFormErrors;
    };

const dollarsPattern = /^\d+(\.\d{1,2})?$/;

export function validateMenuItemForm(
  values: MenuItemFormValues
): MenuItemFormResult {
  const errors: MenuItemFormErrors = {};
  const name = values.name.trim();
  const description = values.description.trim();
  const priceText = values.price.trim();

  if (!name) {
    errors.name = "Name is required.";
  }

  if (!description) {
    errors.description = "Description is required.";
  }

  if (!priceText) {
    errors.price = "Price is required.";
  } else if (!dollarsPattern.test(priceText)) {
    errors.price = "Use a dollar amount with up to two decimals.";
  }

  if (Object.keys(errors).length > 0) {
    return { ok: false, errors };
  }

  return {
    ok: true,
    value: {
      name,
      description,
      price: Number(priceText)
    }
  };
}
