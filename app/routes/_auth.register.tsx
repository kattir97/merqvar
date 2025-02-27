import { getFormProps, getInputProps, SubmissionResult, useForm } from "@conform-to/react";
import { getZodConstraint, parseWithZod } from "@conform-to/zod";
import { ActionFunctionArgs, data, redirect } from "@remix-run/node";
import { Form, Link, useActionData, useFormAction, useNavigation } from "@remix-run/react";
import { z } from "zod";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { StatusButton } from "~/components/ui/status-button";
import { cn } from "~/lib/utils";
import { prisma } from "../utils/db.server";
import { ErrorList } from "~/components/error-list";
import { EmailSchema, PasswordSchema, UsernameSchema } from "~/utils/user-validation";
import bcrypt from "bcryptjs";
import { sessionStorage } from "~/utils/session.server";

const registerSchema = z.object({
  email: EmailSchema,
  password: PasswordSchema,
  username: UsernameSchema,
});

export async function action({ request }: ActionFunctionArgs) {
  const formData = await request.formData();
  // const data = Object.fromEntries(formData.entries());

  const submission = await parseWithZod(formData, {
    schema: registerSchema
      .superRefine(async (data, ctx) => {
        const existingUser = await prisma.user.findUnique({
          select: { id: true },
          where: { username: data.username },
        });

        if (existingUser) {
          ctx.addIssue({
            path: ["global"],
            code: "custom",
            message: "Пользователь с таким именем уже существует",
          });
          return;
        }
      })
      .transform(async (data) => {
        const { email, password, username } = data;

        const user = await prisma.user.create({
          select: { id: true },
          data: {
            email: email.toLowerCase(),
            username: username.toLowerCase(),
            password: {
              create: {
                hash: await bcrypt.hash(password, 10),
              },
            },
          },
        });

        return { ...data, user };
      }),
    async: true,
  });

  delete submission.payload.password;

  // If validation fails, return an error response
  if (submission.status !== "success") {
    return data(
      { status: "error", submission },
      {
        status: 400,
      }
    );
  }

  // Handle non-submit intents (e.g., validation-only requests)
  // if (submission.intent !== "submit") {
  //   return json({ status: "idle", submission });
  // }

  // If validation fails, return an error response
  if (!submission.value?.user) {
    return data(
      { status: "error", submission },
      {
        status: 400,
      }
    );
  }

  // If everything is successful, set the userId in the session cookie
  const { user } = submission.value;
  const cookieSession = await sessionStorage.getSession(request.headers.get("cookie"));
  cookieSession.set("userId", user.id);

  // Redirect to the admin page with the updated session cookie
  return redirect("/admin", {
    headers: {
      "Set-Cookie": await sessionStorage.commitSession(cookieSession),
    },
  });
}

export default function RegisterPage() {
  type LoginFormFields = z.infer<typeof registerSchema>;
  const navigation = useNavigation();
  const formAction = useFormAction();
  const lastResult = useActionData<typeof action>();

  const isSubmitting =
    navigation.state === "submitting" &&
    navigation.formAction === formAction &&
    navigation.formMethod === "POST";

  const [form, fields] = useForm<LoginFormFields>({
    id: "login-form",
    lastResult: lastResult as SubmissionResult,
    constraint: getZodConstraint(registerSchema),
    shouldValidate: "onSubmit",
    shouldRevalidate: "onBlur",
  });

  const emailError =
    lastResult?.submission.status === "error" ? lastResult.submission.error?.email : [];
  const passwordError =
    lastResult?.submission.status === "error" ? lastResult.submission.error?.password : [];
  const usernameError =
    lastResult?.submission.status === "error" ? lastResult.submission.error?.username : [];
  const globalError =
    lastResult?.submission.status === "error" ? lastResult.submission.error?.global : [];

  return (
    <div className="flex justify-center items-center p-10">
      <Form method="POST" {...getFormProps(form)} className={cn("flex flex-col gap-6 ")}>
        <div className="flex flex-col items-center gap-2 text-center">
          <h1 className="text-2xl font-bold">Create an account</h1>
          <p className="text-balance text-sm text-muted-foreground">
            Enter your email below to create your account
          </p>
        </div>
        <div className="grid gap-6">
          <div className="grid gap-2">
            <Label htmlFor={fields.email.id}>Email</Label>
            <Input
              {...getInputProps(fields.email, { type: "email" })}
              id="email"
              type="email"
              placeholder="m@example.com"
              required
            />
            <ErrorList id={fields.email.errorId} errors={emailError} />
          </div>
          <div className="grid gap-2">
            <Label htmlFor={fields.username.id}>Username</Label>
            <Input
              {...getInputProps(fields.username, { type: "text" })}
              id="username"
              placeholder="kody75"
              required
            />
            <ErrorList id={fields.username.errorId} errors={usernameError} />
          </div>
          <div className="grid gap-2">
            <div className="flex items-center">
              <Label htmlFor={fields.password.id}>Password</Label>
            </div>
            <Input
              {...getInputProps(fields.password, { type: "password" })}
              id="password"
              type="password"
              placeholder="********"
              required
            />
            <ErrorList id={fields.password.errorId} errors={passwordError} />
          </div>
          <ErrorList id={form.errorId} errors={globalError} />
          <StatusButton status={isSubmitting ? "pending" : "idle"} type="submit" className="w-full">
            Sign Up
          </StatusButton>
          <div className="relative text-center text-sm after:absolute after:inset-0 after:top-1/2 after:z-0 after:flex after:items-center after:border-t after:border-border">
            <span className="relative z-10 bg-background px-2 text-muted-foreground">
              Or continue with
            </span>
          </div>

          <StatusButton
            status={isSubmitting ? "pending" : "idle"}
            variant="outline"
            className="w-full"
          >
            GitHub
          </StatusButton>
        </div>
        <div className="text-center text-sm">
          Already have an account?{" "}
          <Link to="/login" className="underline underline-offset-4">
            Sign In
          </Link>
        </div>
      </Form>
    </div>
  );
}
