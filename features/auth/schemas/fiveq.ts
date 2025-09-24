import { z } from "zod";

export const fiveQSchema = z
  .object({
    q1: z.union([z.boolean(), z.string()]).transform((val) => {
      if (typeof val === "string") {
        return val === "true";
      }
      return val;
    }),
    q2: z.union([z.boolean(), z.string()]).transform((val) => {
      if (typeof val === "string") {
        return val === "true";
      }
      return val;
    }),
    q3: z.union([z.boolean(), z.string()]).transform((val) => {
      if (typeof val === "string") {
        return val === "true";
      }
      return val;
    }),
    q4: z.union([z.boolean(), z.string()]).transform((val) => {
      if (typeof val === "string") {
        return val === "true";
      }
      return val;
    }),
    q5: z.union([z.boolean(), z.string()]).transform((val) => {
      if (typeof val === "string") {
        return val === "true";
      }
      return val;
    }),
  })
  .refine(
    (data) => {
      // Ensure all questions are answered
      return Object.values(data).every((val) => typeof val === "boolean");
    },
    {
      message: "Semua pertanyaan wajib dijawab",
    }
  );

export type FiveQData = z.infer<typeof fiveQSchema>;
