import { z } from "zod";

const envSchema = z.object({
  NEXT_PUBLIC_LARK_API_URL: z.string().url().default("https://lark-http-hype.hypelive.workers.dev"),
  LARK_API_KEY: z.string().optional().default(""),
});

const parsed = envSchema.safeParse({
  NEXT_PUBLIC_LARK_API_URL: process.env.NEXT_PUBLIC_LARK_API_URL,
  LARK_API_KEY: process.env.LARK_API_KEY,
});

if (!parsed.success) {
  // eslint-disable-next-line no-console
  console.error("Invalid environment variables:", parsed.error.flatten().fieldErrors);
  throw new Error("Invalid environment variables");
}

export const env = parsed.data;
