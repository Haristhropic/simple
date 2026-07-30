import { z } from "zod";

export const settingSchema = z.object({
  key: z.string().min(1, "Key is required"),
  value: z.string().min(1, "Value is required"),
});

export type SettingInput = z.infer<typeof settingSchema>;
