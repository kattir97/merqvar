import { MinusCircleIcon, PlusCircleIcon } from "lucide-react";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { ErrorList } from "./error-list";
import { useForm } from "@conform-to/react";
import { z } from "zod";
import { useState } from "react";
import { wordSchema } from "~/types/word-schema";

type WordFormFields = z.infer<typeof wordSchema>;

type UseFormReturnType = ReturnType<typeof useForm<WordFormFields>>;

interface ExamplesProps {
  form: UseFormReturnType[0];
  fields: UseFormReturnType[1];
}

export const Examples = ({ fields }: ExamplesProps) => {
  const [examples, setExamples] = useState(fields.examples.getFieldList());

  const handleAddExample = (event: React.MouseEvent) => {
    event.preventDefault();

    const baseField = fields.examples.getFieldList()[0];

    const newExample = {
      ...baseField,
      key: `example-${examples.length}`, // Unique key for each example
      name: `${fields.examples.name}[${examples.length}]`,
      id: `${fields.examples.id}-${examples.length}`,
      errorId: `${fields.examples.errorId}-${examples.length}`,
      descriptionId: `${fields.examples.descriptionId}-${examples.length}`,
      initialValue: { example: "", translation: "" },
      errors: [],
    };

    setExamples([...examples, newExample]);
  };

  const handleRemoveExample = (idx: number) => {
    setExamples(examples.filter((_, i) => i !== idx));
  };

  return (
    <div>
      <Label htmlFor={fields.examples.id} className="sr-only">
        Перевод
      </Label>
      <div className="flex flex-col gap-2">
        {examples.map((ex, index) => (
          <div className="" key={ex.key}>
            <div className="grid grid-cols-[1fr_auto] grid-rows-2 md:grid-cols-[1fr_1fr_auto] md:grid-rows-1 gap-2 items-center">
              <Input
                name={`examples${index}.example`}
                placeholder={`Пример ${index + 1}`}
                defaultValue={ex.initialValue?.example}
                className="row-start-1 row-end-2 "
              />
              <Input
                name={`examples${index}.translation`}
                placeholder={`Перевод ${index + 1}`}
                defaultValue={ex.initialValue?.translation}
                className="row-start-2 row-end-3 md:row-start-1 md:row-end-2"
              />
              <div className="flex gap-2">
                <button onClick={handleAddExample}>
                  <PlusCircleIcon
                    className="hover:text-green-500 transition-all duration-200 cursor-pointer"
                    size={24}
                  />
                </button>
                {examples.length > 1 && (
                  <button
                    // {...form.remove.getButtonProps({ name: fields.examples.name, index })}
                    onClick={() => handleRemoveExample(index)}
                    disabled={examples.length === 1}
                  >
                    <MinusCircleIcon
                      className="hover:text-red-500 transition-all duration-200 cursor-pointer"
                      size={24}
                    />
                  </button>
                )}
              </div>
            </div>
            <ErrorList id={ex.id} errors={ex.errors} />
          </div>
        ))}
      </div>
    </div>
  );
};
