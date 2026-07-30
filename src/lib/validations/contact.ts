import { z } from "zod";

export const contactMessageSchema = z.object({
  name: z.string().min(1, "Name is required").max(200),
  email: z.string().email("Invalid email address"),
  subject: z.string().max(200).optional().nullable(),
  message: z.string().min(1, "Message is required").max(5000),
});

export type ContactMessageInput = z.infer<typeof contactMessageSchema>;
