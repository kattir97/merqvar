import {
  Form,
  Link,
  redirect,
  useActionData,
  useFormAction,
  useLoaderData,
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
// import { MinusCircleIcon, PlusCircleIcon } from "lucide-react";
import { Translations } from "~/components/translations";
import { SpeechPart } from "~/components/speech-part";
import { Button } from "~/components/ui/button";
import { Origin } from "~/components/origin";
import { saveWord } from "~/utils/save-word";
import { Examples } from "~/components/examples";
import { prisma } from "~/utils/db.server";
import { CornerDownLeft } from "lucide-react";
import { StatusButton } from "~/components/ui/status-button";
import { wordSchema } from "~/types/word-schema";
import { requireUserWithRole } from "~/utils/permissions";
import Tags from "~/components/tags";

export async function loader({ params, request }: LoaderFunctionArgs) {
  await requireUserWithRole(request, ["admin", "moderator"]);

  const { wordId } = params;

  if (!wordId) {
    throw new Response("Not Found", { status: 404 });
  }
  const data = await prisma.word.findUnique({
    where: { id: wordId },
    select: {
      id: true,
      headword: true,
      ergative: true,
      speechPart: true,
      origin: true,
      root: true,
      tags: true,
      createdAt: true,
      examples: true,
      translations: {
        select: { translation: true },
      },
    },
  });

  return data;
}

export async function action({ request, params }: ActionFunctionArgs) {
  await requireUserWithRole(request, ["admin", "moderator"]);
  const { wordId } = params;

  const formData = await request.formData();
  const submission = parseWithZod(formData, { schema: wordSchema });
  const data = Object.fromEntries(formData.entries());

  // Report the submission to client if it is not successful
  if (submission.status !== "success") {
    return submission.reply();
  }

  await saveWord(data, wordId);

  return redirect("/admin");
}

export default function EditWord() {
  type WordFormFields = z.infer<typeof wordSchema>;
  const lastResult = useActionData<typeof action>();
  const loaderData = useLoaderData<typeof loader>();
  const trs = loaderData?.translations.map((tr) => tr.translation) ?? [];
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
      headword: loaderData?.headword,
      root: loaderData?.root,
      ergative: loaderData?.ergative,
      speechPart: loaderData?.speechPart,
      origin: loaderData?.origin,
      translations: [...trs],
      examples:
        loaderData?.examples && loaderData.examples.length > 0
          ? loaderData?.examples.map((ex) => {
              return {
                example: ex.example,
                translation: ex.translation,
              };
            })
          : [
              {
                example: "",
                translation: "",
              },
            ],

      tags: loaderData?.tags.map((tag) => tag.name),
    },
  });

  return (
    <div className="flex flex-col md:max-w-5xl p-4 mx-auto min-h-full py-10">
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
      <h1 className="mb-4 text-center text-xl">Изменить слово</h1>
      <Form
        method="POST"
        {...getFormProps(form)}
        className="flex flex-col gap-4"
      >
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
        <Tags form={form} fields={fields} />
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
          Изменить слово
        </StatusButton>
      </div>
    </div>
  );
}
