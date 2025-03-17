import { z } from "zod";
import { wordSchema } from "./word-schema";



export const serverResponseSchema = wordSchema.extend({
  id: z.string(),
  translations: z.array(z.object({
    id: z.string(),
    translation: z.string({ required_error: "Требуется перевод" }).min(1),
  })),
});

export const columnWordSchema = wordSchema.extend({
  id: z.string(),
  translations: z.array(z.object({
    translation: z.string({ required_error: "Требуется перевод" }).min(1),
  })),
});

export type WordServerType = z.infer<typeof serverResponseSchema>;
export type WordColumnType = z.infer<typeof columnWordSchema>;

export type TranslationType = {
  id: string,
  tranlsation: string
}

export type ExampleType = {
  id: string,
  example: string,
  translation: string
}


export type RoleName = 'admin' | 'moderator' | 'user';
