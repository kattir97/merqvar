import { MinusCircleIcon, PlusCircleIcon } from "lucide-react";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { ErrorList } from "./error-list";
import { useForm } from "@conform-to/react";
import { wordSchema } from "~/routes/admin_.add-word";
import { z } from "zod";
import { useState } from "react";

type WordFormFields = z.infer<typeof wordSchema>;

type UseFormReturnType = ReturnType<typeof useForm<WordFormFields>>;

interface TranslationsProps {
  form: UseFormReturnType[0];
  fields: UseFormReturnType[1];
}

export const Translations = ({ fields }: TranslationsProps) => {
  // const translations = fields.translations.getFieldList();
  const [translations, setTranslations] = useState(fields.translations.getFieldList());

  const handleAddTranslation = (event: React.MouseEvent) => {
    event.preventDefault(); // Prevent default form submission

    const baseField = fields.translations.getFieldList()[0];
    const newTranslation = {
      ...baseField,
      key: `translation-${translations.length}`, // Unique key for each translation
      name: `${fields.translations.name}[${translations.length}]`,
      id: `${fields.translations.id}-${translations.length}`,
      errorId: `${fields.translations.errorId}-${translations.length}`,
      descriptionId: `${fields.translations.descriptionId}-${translations.length}`,
      initialValue: "",
      errors: [],
    };
    setTranslations([...translations, newTranslation]);
  };

  const handleRemoveTranslation = (idx: number) => {
    setTranslations(translations.filter((_, i) => i !== idx));
  };

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
                type="button"
                onClick={handleAddTranslation}
                // {...form.insert.getButtonProps({
                //   name: fields.translations.name,
                //   index: index + 1,
                // })}
              >
                <PlusCircleIcon
                  className="hover:text-green-500 transition-all duration-200 cursor-pointer"
                  size={24}
                />
              </button>
              {translations.length > 1 && (
                <button
                  // {...form.remove.getButtonProps({ name: fields.translations.name, index })}
                  type="button"
                  onClick={() => handleRemoveTranslation(index)}
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
