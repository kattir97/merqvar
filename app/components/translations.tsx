import { MinusCircleIcon, PlusCircleIcon } from "lucide-react";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { FieldMetadata, FormMetadata } from "@conform-to/react";
import { ErrorList } from "./error-list";

type TranslationProps = {
  form: FormMetadata<
    {
      translations: string[];
      headword: string;
    },
    string[]
  >;
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

export const Translations = ({ form, fields }: TranslationProps) => {
  const translations = fields.translations.getFieldList();
  return (
    <div>
      <Label htmlFor={fields.translations.id}>Перевод</Label>
      <div className="flex flex-col gap-1">
        {translations.map((ts, index) => (
          <div className="" key={ts.key}>
            <div className="flex gap-2 items-center">
              <Input name={ts.name} />
              <button
                {...form.insert.getButtonProps({
                  name: fields.translations.name,
                  index: index + 1,
                })}
              >
                <PlusCircleIcon
                  className="hover:text-green-500 transition-all duration-200 cursor-pointer"
                  size={24}
                />
              </button>
              {translations.length > 1 && (
                <button
                  {...form.remove.getButtonProps({ name: fields.translations.name, index })}
                  disabled={translations.length === 1}
                >
                  <MinusCircleIcon
                    className="hover:text-red-500 transition-all duration-200 cursor-pointer"
                    size={24}
                  />
                </button>
              )}
            </div>
            <ErrorList id={ts.id} errors={ts.errors} />
          </div>
        ))}
      </div>
    </div>
  );
};
