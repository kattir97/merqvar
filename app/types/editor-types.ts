import { FieldMetadata, FormMetadata } from "@conform-to/react";

export type T_Conform = {
  form: FormMetadata<{
    translations: string[];
    headword: string;
    speechPart: "существительное" | "глагол" | "прилагательное" | "междометие" | "числительное";
    root?: string | undefined;
    ergative?: string | undefined;
  }, string[]>
  fields: Required<{
    translations: FieldMetadata<
      string[],
      {
        translations: string[];
        headword: string;
      },
      string[]
    >;
    headword: FieldMetadata<
      string,
      {
        translations: string[];
        headword: string;
      },
      string[]
    >;
  }>;
};