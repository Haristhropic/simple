import { z } from "zod";

export const productSchema = z.object({
  name: z.string().min(1, "Name is required"),
  slug: z.string().min(1, "Slug is required").regex(/^[a-z0-9-]+$/, "Slug must be lowercase alphanumeric with dashes"),
  description: z.string().optional().nullable(),
  price: z.coerce.number().positive().optional().nullable(),
  categoryId: z.string().min(1, "Category is required"),
  featured: z.boolean().default(false),
  status: z.enum(["draft", "published"]).default("draft"),
});

export const productUpdateSchema = productSchema.partial();

export type ProductInput = z.infer<typeof productSchema>;
