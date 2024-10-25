import { Form, useActionData } from "@remix-run/react";
import { Container } from "~/components/container";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { getFormProps, getInputProps, useForm } from "@conform-to/react";
import { z } from "zod";
import { ActionFunctionArgs } from "@remix-run/node";
import { getZodConstraint, parseWithZod } from "@conform-to/zod";
import { ErrorList } from "~/components/error-list";
// import { MinusCircleIcon, PlusCircleIcon } from "lucide-react";
import { Translations } from "~/components/translations";
const wordSchema = z.object({
  headword: z.string({ required_error: "Требуется слово" }).min(1).max(100),
  translations: z.array(z.string({ required_error: "Требуется перевод" }).min(1)).min(1),
});

export async function action({ request }: ActionFunctionArgs) {
  const formData = await request.formData();
  const submission = parseWithZod(formData, { schema: wordSchema });

  // Report the submission to client if it is not successful
  if (submission.status !== "success") {
    return submission.reply();
  }
}

export default function AddWord() {
  type WordFormFields = z.infer<typeof wordSchema>;
  const lastResult = useActionData<typeof action>();
  const [form, fields] = useForm<WordFormFields>({
    lastResult,
    constraint: getZodConstraint(wordSchema),
    shouldValidate: "onInput",
    defaultValue: {
      translations: [""],
    },
  });

  // const translations = fields.translations.getFieldList();

  return (
    <Container>
      <Form method="POST" {...getFormProps(form)}>
        <div className="grid grid-cols-2 gap-2">
          <div>
            <fieldset>
              <Label htmlFor={fields.headword.id}>Слово</Label>
              <Input {...getInputProps(fields.headword, { type: "text" })} />
              <ErrorList id={fields.headword.errorId} errors={fields.headword.errors} />
            </fieldset>
          </div>
          <Translations form={form} fields={fields} />
        </div>
      </Form>
    </Container>
  );
}
