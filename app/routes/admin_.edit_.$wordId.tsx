import {
  Form,
  Link,
  redirect,
  useActionData,
  useFormAction,
  useLoaderData,
  useNavigation,
} from "@remix-run/react";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { getFormProps, getInputProps, SubmissionResult, useForm } from "@conform-to/react";
import { z } from "zod";
import { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
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

export async function loader({ params }: LoaderFunctionArgs) {
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
  const { wordId } = params;

  const formData = await request.formData();
  const submission = parseWithZod(formData, { schema: wordSchema });
  const data = Object.fromEntries(formData.entries());

  // Report the submission to client if it is not successful
  if (submission.status !== "success") {
    return submission.reply();
  }

  // throw new Error("Simulated error while saving to Prisma");
  const { data: wordData } = await saveWord(data, wordId);
  console.log("wordToSave:", wordData);
  // await prisma.word.update({
  //   where: {
  //     id: wordId,
  //   },
  //   data: wordData,
  // });

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
      translations: [...trs],
      examples: loaderData?.examples.map((ex) => {
        return {
          example: ex.example,
          translation: ex.translation,
        };
      }),
    },
  });

  return (
    <div className="flex flex-col md:max-w-5xl p-4 mx-auto min-h-full my-10">
      <h1 className="mb-4 text-xl">Изменить слово</h1>
      <Form method="POST" {...getFormProps(form)} className="flex-grow">
        <div className="grid md:grid-cols-2 gap-2 mb-6">
          <div className="flex flex-col gap-2">
            <fieldset>
              <Label htmlFor={fields.headword.id} className="sr-only">
                Слово
              </Label>
              <Input {...getInputProps(fields.headword, { type: "text" })} placeholder="Слово" />
              <ErrorList id={fields.headword.errorId} errors={fields.headword.errors} />
            </fieldset>
            <fieldset>
              <Label htmlFor={fields.root.id} className="sr-only">
                Корень
              </Label>
              <Input {...getInputProps(fields.root, { type: "text" })} placeholder="Корень" />
              <ErrorList id={fields.root.errorId} errors={fields.root.errors} />
            </fieldset>
            <fieldset>
              <Label htmlFor={fields.ergative.id} className="sr-only">
                Эргатив
              </Label>
              <Input {...getInputProps(fields.ergative, { type: "text" })} placeholder="Эргатив" />
              <ErrorList id={fields.ergative.errorId} errors={fields.ergative.errors} />
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
      <div className=" flex justify-end gap-4  my-10 ">
        <Link to="/admin">
          <Button variant="outline" type="submit" className="flex gap-2">
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
        >
          Изменить слово
        </StatusButton>
      </div>
    </div>
  );
}
