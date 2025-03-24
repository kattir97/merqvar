import {
  Form,
  Link,
  redirect,
  useActionData,
  useFormAction,
  useNavigation,
  ActionFunctionArgs,
  LoaderFunctionArgs,
} from "react-router";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import {
  getFormProps,
  getInputProps,
  SubmissionResult,
  useForm,
} from "@conform-to/react";
import { z } from "zod";
import { getZodConstraint, parseWithZod } from "@conform-to/zod";
import { ErrorList } from "~/components/error-list";
import { Translations } from "~/components/translations";
import { SpeechPart } from "~/components/speech-part";
import { Button } from "~/components/ui/button";
import { Origin } from "~/components/origin";
import { saveWord } from "~/utils/save-word";
import { Examples } from "~/components/examples";
import { CornerDownLeft } from "lucide-react";
import { StatusButton } from "~/components/ui/status-button";
import { wordSchema } from "~/types/word-schema";
import { requireUserWithRole } from "~/utils/permissions";

export async function loader({ request }: LoaderFunctionArgs) {
  await requireUserWithRole(request, ["admin", "moderator"]);
  return null;
}

export async function action({ request }: ActionFunctionArgs) {
  await requireUserWithRole(request, ["admin", "moderator"]);
  const formData = await request.formData();
  const submission = parseWithZod(formData, { schema: wordSchema });
  const data = Object.fromEntries(formData.entries());

  // Report the submission to client if it is not successful
  if (submission.status !== "success") {
    return submission.reply();
  }

  // throw new Error("Simulated error while saving to Prisma");
  await saveWord(data);

  return redirect("/admin");
}

export default function AddWord() {
  type WordFormFields = z.infer<typeof wordSchema>;
  const lastResult = useActionData<typeof action>();
  const navigation = useNavigation();
  const formAction = useFormAction();
  const isSubmitting =
    navigation.state === "submitting" &&
    navigation.formAction === formAction &&
    navigation.formMethod === "POST";

  const [form, fields] = useForm<WordFormFields>({
    lastResult: lastResult as SubmissionResult,
    constraint: getZodConstraint(wordSchema),
    shouldValidate: "onSubmit",
    defaultValue: {
      headword: "",
      root: "",
      ergative: "",
      speechPart: "",
      translations: [""],
      examples: [
        {
          example: "",
          translation: "",
        },
      ],
    },
  });

  return (
    <div className="flex flex-col md:max-w-5xl p-4 mx-auto min-h-full my-10">
      <div className="flex mb-10 md:hidden">
        <Link to="/admin" className="mt-auto">
          <Button
            variant="secondary"
            type="submit"
            className="flex gap-2 w-full"
          >
            <CornerDownLeft size={18} />
            Вернуться назад
          </Button>
        </Link>
      </div>
      <h1 className="mb-4 text-center text-xl">Добавить слово</h1>
      <Form method="POST" {...getFormProps(form)} className="flex-grow">
        <div className="grid md:grid-cols-2 gap-2 mb-6">
          <div className="flex flex-col gap-2">
            <fieldset>
              <Label htmlFor={fields.headword.id} className="sr-only">
                Слово
              </Label>
              <Input
                {...getInputProps(fields.headword, { type: "text" })}
                placeholder="Слово"
              />
              <ErrorList
                id={fields.headword.errorId}
                errors={fields.headword.errors}
              />
            </fieldset>
            <fieldset>
              <Label htmlFor={fields.root.id} className="sr-only">
                Корень
              </Label>
              <Input
                {...getInputProps(fields.root, { type: "text" })}
                placeholder="Корень"
              />
              <ErrorList id={fields.root.errorId} errors={fields.root.errors} />
            </fieldset>
            <fieldset>
              <Label htmlFor={fields.ergative.id} className="sr-only">
                Эргатив
              </Label>
              <Input
                {...getInputProps(fields.ergative, { type: "text" })}
                placeholder="Эргатив"
              />
              <ErrorList
                id={fields.ergative.errorId}
                errors={fields.ergative.errors}
              />
            </fieldset>
            <fieldset>
              <SpeechPart form={form} fields={fields} />
            </fieldset>
            <fieldset>
              <Origin form={form} fields={fields} />
            </fieldset>
          </div>
          <Translations form={form} fields={fields} />
        </div>
        <h2 className="mb-2">Примеры: </h2>
        <Examples form={form} fields={fields} />
      </Form>
      <div className="flex flex-col md:flex-row justify-center md:justify-end gap-4 my-10">
        <Link to="/admin" className="mt-auto hidden md:block">
          <Button
            variant="secondary"
            type="submit"
            className="flex gap-2 w-full"
          >
            <CornerDownLeft size={18} />
            Вернуться назад
          </Button>
        </Link>

        <StatusButton
          form={form.id}
          type="submit"
          disabled={isSubmitting}
          status={isSubmitting ? "pending" : "idle"}
          name="intent"
          value="add-word"
          className="py-5 md:py-0"
        >
          Добавить слово
        </StatusButton>
      </div>
    </div>
  );
}
