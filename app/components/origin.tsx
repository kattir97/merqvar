import { getSelectProps, useForm } from "@conform-to/react";
import { z } from "zod";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { OriginEnum } from "~/enums/origin-enum";
import { wordSchema } from "~/routes/admin_.add-word";

type WordFormFields = z.infer<typeof wordSchema>;

type UseFormReturnType = ReturnType<typeof useForm<WordFormFields>>;

interface OriginProps {
  form: UseFormReturnType[0];
  fields: UseFormReturnType[1];
}

export function Origin({ fields }: OriginProps) {
  return (
    <Select
      {...getSelectProps(fields.origin)}
      key={fields.origin.key}
      defaultValue={fields.origin.initialValue}
      // onValueChange={(value) => {
      //   form.update({
      //     name: fields.origin.name,
      //     value,
      //   });
      // }}
    >
      <SelectTrigger className="w-full">
        <SelectValue placeholder="Выберите происхождение" />
      </SelectTrigger>
      <SelectContent>
        <SelectGroup>
          <SelectLabel>Происхождение</SelectLabel>
          {Object.values(OriginEnum).map((value) => (
            <SelectItem value={value} key={value}>
              {value}
            </SelectItem>
          ))}
        </SelectGroup>
      </SelectContent>
    </Select>
  );
}
