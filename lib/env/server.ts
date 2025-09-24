// lib/env/server.ts
import { serverEnvSchema } from "./validation";

const parsed = serverEnvSchema.safeParse({});
if (!parsed.success) {
  console.error("Invalid server env:", parsed.error.flatten().fieldErrors);
  throw new Error("Server ENV invalid.");
}
export const SERVER_ENV = parsed.data;
