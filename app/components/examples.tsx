import { MinusCircleIcon, PlusCircleIcon } from "lucide-react";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { ErrorList } from "./error-list";
import { useForm } from "@conform-to/react";
import { wordSchema } from "~/routes/admin_.add-word";
import { z } from "zod";

type WordFormFields = z.infer<typeof wordSchema>;

type UseFormReturnType = ReturnType<typeof useForm<WordFormFields>>;

interface ExamplesProps {
  form: UseFormReturnType[0];
  fields: UseFormReturnType[1];
}

export const Examples = ({ form, fields }: ExamplesProps) => {
  const examples = fields.examples.getFieldList();
  return (
    <div>
      <Label htmlFor={fields.examples.id} className="sr-only">
        Перевод
      </Label>
      <div className="flex flex-col gap-2">
        {examples.map((ex, index) => (
          <div className="" key={ex.key}>
            <div className="flex gap-2 items-center">
              <Input
                name={`examples${index}.example`}
                placeholder={`Пример ${index + 1}`}
                defaultValue={ex.initialValue?.example}
              />
              <Input
                name={`examples${index}.translation`}
                placeholder={`Перевод ${index + 1}`}
                defaultValue={ex.initialValue?.translation}
              />
              <button
                {...form.insert.getButtonProps({
                  name: fields.examples.name,
                  index: index + 1,
                })}
              >
                <PlusCircleIcon
                  className="hover:text-green-500 transition-all duration-200 cursor-pointer"
                  size={24}
                />
              </button>
              {examples.length > 1 && (
                <button
                  {...form.remove.getButtonProps({ name: fields.examples.name, index })}
                  disabled={examples.length === 1}
                >
                  <MinusCircleIcon
                    className="hover:text-red-500 transition-all duration-200 cursor-pointer"
                    size={24}
                  />
                </button>
              )}
            </div>
            <ErrorList id={ex.id} errors={ex.errors} />
          </div>
        ))}
      </div>
    </div>
  );
};
