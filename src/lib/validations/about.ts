import { z } from "zod";

export const aboutSectionSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().min(1, "Description is required"),
  imageUrl: z.string().optional().nullable(),
  imagePublicId: z.string().optional().nullable(),
  active: z.boolean().default(true),
});

export type AboutSectionInput = z.infer<typeof aboutSectionSchema>;
