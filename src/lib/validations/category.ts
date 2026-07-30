import { z } from "zod";

export const categorySchema = z.object({
  name: z.string().min(1, "Name is required"),
  slug: z.string().min(1, "Slug is required").regex(/^[a-z0-9-]+$/, "Slug must be lowercase alphanumeric with dashes"),
  description: z.string().optional().nullable(),
  imageUrl: z.string().optional().nullable(),
});

export const categoryUpdateSchema = categorySchema.partial();

export type CategoryInput = z.infer<typeof categorySchema>;
