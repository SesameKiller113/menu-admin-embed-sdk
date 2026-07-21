import { z } from "zod";
import { badRequest } from "./errors.js";

const textSchema = z.string().transform((value) => value.trim()).pipe(z.string().min(1));

const priceSchema = z
  .number()
  .finite()
  .nonnegative()
  .refine(hasAtMostTwoDecimals, "Price must be a dollar amount with at most two decimals");

export const createMenuItemSchema = z
  .object({
    name: textSchema,
    description: textSchema,
    price: priceSchema
  })
  .strict();

export const updateMenuItemSchema = z
  .object({
    name: textSchema.optional(),
    description: textSchema.optional(),
    price: priceSchema.optional()
  })
  .strict()
  .refine((value) => Object.keys(value).length > 0, {
    message: "At least one of name, description, or price is required"
  });

export function parseRestaurantId(value: unknown) {
  const result = textSchema.safeParse(value);

  if (!result.success) {
    throw badRequest("Validation failed", {
      restaurantId: "restaurantId is required"
    });
  }

  return result.data;
}

export function parseItemId(value: unknown) {
  const result = textSchema.safeParse(value);

  if (!result.success) {
    throw badRequest("Validation failed", {
      itemId: "itemId is required"
    });
  }

  return result.data;
}

export function parseRequestBody<T>(schema: z.ZodType<T>, body: unknown): T {
  const result = schema.safeParse(body);

  if (!result.success) {
    throw badRequest("Validation failed", formatZodDetails(result.error));
  }

  return result.data;
}

function formatZodDetails(error: z.ZodError): Record<string, string> {
  return error.issues.reduce<Record<string, string>>((details, issue) => {
    const key = issue.path.join(".") || "body";
    details[key] = friendlyMessage(key, issue.message);
    return details;
  }, {});
}

function friendlyMessage(key: string, message: string) {
  if (message === "Required" || message === "Invalid input") {
    return `${key} is required`;
  }

  if (message === "Expected number, received string") {
    return `${key} must be a number`;
  }

  if (message === "Number must be greater than or equal to 0") {
    return `${key} must be greater than or equal to 0`;
  }

  return message;
}

function hasAtMostTwoDecimals(value: number) {
  const decimalPart = value.toString().split(".")[1];
  return !decimalPart || decimalPart.length <= 2;
}
