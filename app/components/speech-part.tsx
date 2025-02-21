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
import { SpeechPartEnum } from "~/enums/speech-part-enum";
import { ErrorList } from "./error-list";
import { wordSchema } from "~/types/word-schema";

type WordFormFields = z.infer<typeof wordSchema>;

type UseFormReturnType = ReturnType<typeof useForm<WordFormFields>>;

interface SpeechPartProps {
  form: UseFormReturnType[0];
  fields: UseFormReturnType[1];
}

export function SpeechPart({ form, fields }: SpeechPartProps) {
  return (
    <>
      <Select
        {...getSelectProps(fields.speechPart)}
        key={fields.speechPart.key}
        defaultValue={fields.speechPart.initialValue}
        // onValueChange={(value) => {
        //   form.update({
        //     name: fields.speechPart.name,
        //     value,
        //   });
        // }}
      >
        <SelectTrigger className="w-full">
          <SelectValue placeholder="Выберите часть речи" />
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            <SelectLabel>Часть речи</SelectLabel>
            {Object.values(SpeechPartEnum).map((sp) => (
              <SelectItem value={sp} key={sp}>
                {sp}
              </SelectItem>
            ))}
          </SelectGroup>
        </SelectContent>
      </Select>
      <ErrorList id={form.id} errors={fields.speechPart.errors} />
    </>
  );
}
