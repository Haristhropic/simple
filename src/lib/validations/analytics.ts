import { z } from "zod";

export const pageViewSchema = z.object({
  path: z.string().min(1).max(500),
  referrer: z.string().max(500).optional().nullable(),
});

export type PageViewInput = z.infer<typeof pageViewSchema>;