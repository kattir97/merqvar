import {
  getFormProps,
  getInputProps,
  SubmissionResult,
  useForm,
} from "@conform-to/react";
import { getZodConstraint, parseWithZod } from "@conform-to/zod";
import {
  ActionFunctionArgs,
  LoaderFunctionArgs,
  useActionData,
  useFetcher,
  useLoaderData,
} from "react-router";
import { z } from "zod";
import { ErrorList } from "~/components/error-list";
import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { StatusButton } from "~/components/ui/status-button";

import {
  EmailSchema,
  NameSchema,
  UsernameSchema,
} from "~/utils/user-validation";
import { invariantResponse } from "~/lib/utils";
import { requireUserId } from "~/utils/auth.server";
import { prisma } from "~/utils/db.server";

export const handle = {
  breadcrumb: "Edit Profile",
};

const profileUpdateActionIntent = "update-profile";

const updateProfileSchema = z.object({
  email: EmailSchema,
  username: UsernameSchema,
  name: NameSchema.optional(),
});

export type ProfileActionArgs = {
  request: Request;
  userId: string;
  formData: FormData;
};

export async function loader({ request }: LoaderFunctionArgs) {
  const userId = await requireUserId(request);

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      name: true,
      email: true,
      username: true,
      _count: {
        select: { sessions: { where: { expirationDate: { gt: new Date() } } } },
      },
    },
  });

  invariantResponse(user, "User not found", { status: 404 });

  return { user };
}

export async function action({ request }: ActionFunctionArgs) {
  const userId = await requireUserId(request);
  const formData = await request.formData();
  const intent = formData.get("intent");
  const formObject = Object.fromEntries(formData.entries());

  console.log("formObject", formObject);

  switch (intent) {
    case profileUpdateActionIntent: {
      console.log("firing action");
      return profileUpdateAction({ request, userId, formData });
    }

    default: {
      throw new Response(`Invalid intent "${intent}"`, { status: 400 });
    }
  }
}

export default function EditUserProfile() {
  return (
    <div>
      <Avatar className="h-40 w-40 mb-10">
        <AvatarImage src="https://github.com/shadcn.png" alt="@shadcn" />
        <AvatarFallback>AV</AvatarFallback>
      </Avatar>
      <ProfileUpdate />
    </div>
  );
}

// ========================================================================

function ProfileUpdate() {
  type FormFields = z.infer<typeof updateProfileSchema>;
  const fetcher = useFetcher<typeof profileUpdateAction>();
  const lastResult = useActionData<typeof action>();
  const data = useLoaderData<typeof loader>();
  const [form, fields] = useForm<FormFields>({
    constraint: getZodConstraint(updateProfileSchema),
    lastResult: lastResult as SubmissionResult,
    onValidate({ formData }) {
      return parseWithZod(formData, { schema: updateProfileSchema });
    },
    defaultValue: {
      username: data.user.username,
      name: data.user.name ?? "",
      email: data.user.email,
    },
  });

  return (
    <fetcher.Form method="POST" {...getFormProps(form)}>
      <div className="grid grid-cols-2 w-full max-w-lg gap-8 mb-5">
        <fieldset>
          <Label htmlFor="username">Username</Label>
          <Input {...getInputProps(fields.username, { type: "text" })} />
        </fieldset>
        <fieldset>
          <Label htmlFor="name">Name</Label>

          <Input {...getInputProps(fields.name, { type: "text" })} />
        </fieldset>
        <fieldset>
          <Label htmlFor="email">Email</Label>
          <Input {...getInputProps(fields.email, { type: "email" })} />
        </fieldset>
      </div>
      <ErrorList errors={form.errors} id={form.errorId} />

      <div className="mt-8 flex justify-center">
        <StatusButton
          type="submit"
          name="intent"
          value={profileUpdateActionIntent}
          status={fetcher.state === "submitting" ? "pending" : "idle"}
        >
          Save changes
        </StatusButton>
      </div>
    </fetcher.Form>
  );
}

async function profileUpdateAction({ userId, formData }: ProfileActionArgs) {
  const submission = await parseWithZod(formData, {
    async: true,
    schema: updateProfileSchema.superRefine(
      async ({ email, username, name }, ctx) => {
        const existingUsername = await prisma.user.findUnique({
          where: { username },
          select: { id: true },
        });

        if (existingUsername && existingUsername.id !== userId) {
          ctx.addIssue({
            path: ["username"],
            code: "custom",
            message: "A user already exists with this username",
          });
        }
        const existingEmail = await prisma.user.findUnique({
          where: { email },
          select: { id: true },
        });
        if (existingEmail && existingEmail.id !== userId) {
          ctx.addIssue({
            path: ["email"],
            code: "custom",
            message: "A user already exists with this email",
          });
        }
      }
    ),
  });

  const intent = formData.get("intent") as string;
  console.log("intent", intent);

  // Report the submission to client if it is not successful
  if (submission.status !== "success") {
    console.log("no success", submission.reply());
    return submission.reply();
  }

  if (!submission.value) {
    return { status: "error", submission };
  }

  const data = submission.value;
  console.log("data", { ...data });

  await prisma.user.update({
    select: { username: true },
    where: { id: userId },
    data: {
      name: data.name,
      username: data.username,
      email: data.email,
    },
  });

  return { status: "success", submission };
}
