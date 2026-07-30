import { z } from "zod";

export const heroBannerSchema = z.object({
  title: z.string().min(1, "Title is required"),
  subtitle: z.string().optional().nullable(),
  description: z.string().optional().nullable(),
  cta: z.string().optional().nullable(),
  ctaLink: z.string().optional().nullable(),
  imageUrl: z.string().min(1, "Image URL is required"),
  imagePublicId: z.string().optional().nullable(),
  active: z.boolean().default(true),
  order: z.number().int().default(0),
});

export type HeroBannerInput = z.infer<typeof heroBannerSchema>;
