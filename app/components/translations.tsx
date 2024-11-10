import { MinusCircleIcon, PlusCircleIcon } from "lucide-react";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { ErrorList } from "./error-list";
import { useForm } from "@conform-to/react";
import { wordSchema } from "~/routes/admin_.add-word";
import { z } from "zod";

type WordFormFields = z.infer<typeof wordSchema>;

type UseFormReturnType = ReturnType<typeof useForm<WordFormFields>>;

interface TranslationsProps {
  form: UseFormReturnType[0];
  fields: UseFormReturnType[1];
}

export const Translations = ({ form, fields }: TranslationsProps) => {
  const translations = fields.translations.getFieldList();
  return (
    <div>
      <Label htmlFor={fields.translations.id} className="sr-only">
        Перевод
      </Label>
      <div className="flex flex-col gap-2">
        {translations.map((ts, index) => (
          <div className="" key={ts.key}>
            <div className="flex gap-2 items-center">
              <Input
                name={ts.name}
                placeholder={`Перевод ${index + 1}`}
                defaultValue={ts.initialValue}
              />
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
