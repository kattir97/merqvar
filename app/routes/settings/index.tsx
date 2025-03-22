import {
  getFormProps,
  getInputProps,
  SubmissionResult,
  useForm,
} from "@conform-to/react";
import { getZodConstraint, parseWithZod } from "@conform-to/zod";
import {
  ActionFunctionArgs,
  Form,
  LoaderFunctionArgs,
  useActionData,
  useFetcher,
  useLoaderData,
} from "react-router";
import { z } from "zod";
import { ErrorList } from "~/components/error-list";
import { Avatar } from "~/components/ui/avatar";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { StatusButton } from "~/components/ui/status-button";

import {
  EmailSchema,
  NameSchema,
  UsernameSchema,
} from "~/utils/user-validation";
import { invariantResponse } from "~/lib/utils";
import { requireUserId, sessionKey } from "~/utils/auth.server";
import { prisma } from "~/utils/db.server";
import { sessionStorage } from "~/utils/session.server";
import { LogOut, User } from "lucide-react";
import { Button } from "~/components/ui/button";
import { AuthenticityTokenInput } from "remix-utils/csrf/react";
import { csrf } from "~/utils/csrf.server";

export const handle = {
  breadcrumb: "Edit Profile",
};

const profileUpdateActionIntent = "update-profile";
const signOutOfSessionsActionIntent = "sign-out-of-sessions";

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

  switch (intent) {
    case profileUpdateActionIntent: {
      return profileUpdateAction({ request, userId, formData });
    }
    case signOutOfSessionsActionIntent: {
      return signOutOfSessionsAction({ request, userId, formData });
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
        <div className="rounded-full bg-gray-200 flex items-center justify-center h-full w-full">
          <User className="h-32 w-32 text-gray-800" />{" "}
          {/* Adjust size and color */}
        </div>
      </Avatar>
      <ProfileUpdate />
      <div className="col-span-6 my-6 h-1 border-b-[1.5px] border-foreground" />
      <SignOutOfSessions />
      <LougOut />
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
      <AuthenticityTokenInput />
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

      <div className="mt-8 flex">
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

async function profileUpdateAction({
  userId,
  formData,
  request,
}: ProfileActionArgs) {
  csrf.validate(formData, request.headers);

  const submission = await parseWithZod(formData, {
    async: true,
    schema: updateProfileSchema.superRefine(
      async ({ email, username }, ctx) => {
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

  // Report the submission to client if it is not successful
  if (submission.status !== "success") {
    return submission.reply();
  }

  if (!submission.value) {
    return { status: "error", submission };
  }

  const data = submission.value;

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

//=================================================================

async function signOutOfSessionsAction({ request, userId }: ProfileActionArgs) {
  const cookieSession = await sessionStorage.getSession(
    request.headers.get("cookie")
  );
  const sessionId = cookieSession.get(sessionKey);
  invariantResponse("You must be authenticated to sign out of other sessions");
  await prisma.session.deleteMany({
    where: { userId, id: { not: sessionId } },
  });
  return { status: "success" };
}

function SignOutOfSessions() {
  const data = useLoaderData<typeof loader>();
  const fetcher = useFetcher<typeof signOutOfSessionsAction>();
  const otherSessionsCount = data.user._count.sessions - 1;

  return otherSessionsCount ? (
    <fetcher.Form method="POST">
      <StatusButton
        status={fetcher.state !== "idle" ? "pending" : "idle"}
        name="intent"
        value={signOutOfSessionsActionIntent}
      >
        {`Sign out of ${otherSessionsCount} other sessions`}
      </StatusButton>
    </fetcher.Form>
  ) : (
    <div className="flex gap-2 items-center">
      <User />
      <span>This is your only session</span>
    </div>
  );
}

//=================================================================

function LougOut() {
  return (
    <Form method="POST" action="/logout" id="logout-form" className="mt-5">
      <Button
        type="submit"
        variant={"destructive"}
        className="flex items-center space-x-2"
      >
        <LogOut className="h-4 w-4" />
        <span>Logout</span>
      </Button>
    </Form>
  );
}
