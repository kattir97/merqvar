import { z } from "zod";

// id: 'cm5fp68ag0008twb4mxqdwstw',
// headword: 'ахв',
// ergative: 'а',
// speechPart: 'существительное',
// origin: 'агульский',
// root: 'ахв',
// tags: [],
// createdAt: '2025-01-02T19:06:35.512Z',
// examples: [Array],
// translations: [Array]

export const wordSchema = z.object({
  id: z.string().optional(),
  headword: z.string({ required_error: "Требуется слово" }).min(1).max(100),
  root: z.string().min(1).max(100).optional(),
  ergative: z
    .string()
    .min(1)
    .max(100)
    .optional()
    .transform((value) => value?.toLowerCase()),
  speechPart: z
    .enum(
      [
        "существительное",
        "прилагательное",
        "глагол",
        "междометие",
        "числительное",
      ],
      {
        required_error: "Требуется часть речи",
      }
    )
    .transform((value) => value?.toLowerCase()),
  origin: z
    .enum(["агульский", "персидский", "арабский", "русский", "тюркский"])
    .optional()
    .transform((value) => value?.toLowerCase()),
  translations: z
    .array(z.string({ required_error: "Требуется перевод" }).min(1))
    .min(1),
  examples: z.array(
    z
      .object({
        example: z.string().min(1),
        translation: z.string().min(1),
      })
      .refine((obj) => obj.example.trim() || obj.translation?.trim())
  ),
  tags: z.array(z.string().min(1, "Tag cannot be empty")).optional(),
  createdAt: z.string().optional(),
});

export type WordType = z.infer<typeof wordSchema>;
