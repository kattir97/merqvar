import { getFormProps, SubmissionResult, useForm } from "@conform-to/react";
import { parseWithZod } from "@conform-to/zod";
import { ActionFunctionArgs } from "@remix-run/node";
import { json, useFetcher } from "@remix-run/react";
import { Moon, Sun } from "lucide-react";
import { z } from "zod";
import { invariantResponse } from "~/lib/utils";
import { Theme } from "~/types/theme";
import { setTheme } from "~/utils/theme.server";

const ThemeFormSchema = z.object({
  theme: z.enum(["light", "dark"]),
});

export async function action({ request }: ActionFunctionArgs) {
  const formData = await request.formData();

  invariantResponse(formData.get("intent") === "update-theme", "Invalid intent", { status: 404 });

  const submission = parseWithZod(formData, { schema: ThemeFormSchema });

  // Report the submission to client if it is not successful
  if (submission.status !== "success") {
    console.log("Submission failed:", submission.error);
    console.log(true);
    return submission.reply();
  }

  const responseInit = {
    headers: {
      "set-cookie": setTheme(submission.value.theme),
    },
  };

  return json({ success: true, submission }, responseInit);
}

export function ThemeSwitch({ userPreference }: { userPreference?: Theme }) {
  const fetcher = useFetcher<typeof action>();
  const lastResult = fetcher.data as SubmissionResult | undefined;
  const mode = userPreference || "light";
  const nextMode = mode === "light" ? "dark" : "light";

  const [form] = useForm({
    id: "form-switch",
    lastResult,
    onValidate: ({ formData }) => {
      return parseWithZod(formData, { schema: ThemeFormSchema });
    },
  });

  const modeLabel = {
    light: <Sun />,
    dark: <Moon fill="black" />,
  };

  return (
    <fetcher.Form method="POST" action="/theme-switch" {...getFormProps(form)}>
      <input type="hidden" name="theme" value={nextMode} />
      <button type="submit" name="intent" value="update-theme">
        {modeLabel[mode]}
      </button>
    </fetcher.Form>
  );
}
