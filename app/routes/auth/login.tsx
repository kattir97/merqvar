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
  redirect,
  Form,
  Link,
  useActionData,
  useFormAction,
  useNavigation,
} from "react-router";
import { z } from "zod";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { StatusButton } from "~/components/ui/status-button";
import { cn } from "~/lib/utils";
import { ErrorList } from "~/components/error-list";
import { EmailSchema, PasswordSchema } from "~/utils/user-validation";
import { sessionStorage } from "~/utils/session.server";
import { useState } from "react";
import { Checkbox } from "~/components/ui/checkbox";
import { login, requireAnonymous, sessionKey } from "~/utils/auth.server";
import { HoneypotInputs } from "remix-utils/honeypot/react";

const loginSchema = z.object({
  email: EmailSchema,
  password: PasswordSchema,
  remember: z.preprocess(
    // Transform "on" to true, and undefined to false
    (val) => val === "on",
    z.boolean().optional().default(false)
  ),
});

export async function loader({ request }: LoaderFunctionArgs) {
  await requireAnonymous(request);
  return {};
}

export async function action({ request }: ActionFunctionArgs) {
  await requireAnonymous(request);
  const formData = await request.formData();

  const submission = await parseWithZod(formData, {
    schema: loginSchema.transform(async (data, ctx) => {
      const { email, password } = data;

      const session = await login({ email, password });

      if (!session) {
        ctx.addIssue({
          path: ["global"],
          code: "custom",
          message: "Неверный адрес электронной почты или пароль",
        });
        return z.NEVER;
      }

      return { ...data, session };
    }),
    async: true,
  });

  // get the password off the payload that's sent back
  delete submission.payload.password;

  // If validation fails, return an error response
  if (submission.status !== "success") {
    return { status: "error", submission };
  }

  // If validation fails, return an error response
  if (!submission.value?.session) {
    return { status: "error", submission };
  }

  // If everything is successful, set the userId in the session cookie
  const { session, remember } = submission.value;
  const cookieSession = await sessionStorage.getSession(
    request.headers.get("cookie")
  );
  cookieSession.set(sessionKey, session.id);

  // Redirect to the admin page with the updated session cookie
  return redirect("/admin", {
    headers: {
      "set-cookie": await sessionStorage.commitSession(cookieSession, {
        expires: remember ? session.expirationDate : undefined,
      }),
    },
  });
}

export default function LoginPage() {
  type LoginFormFields = z.infer<typeof loginSchema>;
  const navigation = useNavigation();
  const formAction = useFormAction();
  const lastResult = useActionData<typeof action>();
  const [password, setPassword] = useState("");
  const [email, setEmail] = useState("");

  const isSubmitting =
    navigation.state === "submitting" &&
    navigation.formAction === formAction &&
    navigation.formMethod === "POST";

  const [form, fields] = useForm<LoginFormFields>({
    id: "login-form",
    lastResult: lastResult as SubmissionResult,
    constraint: getZodConstraint(loginSchema),
    shouldValidate: "onSubmit",
    shouldRevalidate: "onBlur",
    defaultValue: lastResult?.submission.payload as LoginFormFields,
  });

  type SubmissionError = {
    email?: string[];
    password?: string[];
    global?: string[];
  };

  const emailError =
    lastResult?.submission.status === "error"
      ? (lastResult.submission.error as SubmissionError)?.email
      : [];
  const passwordError =
    lastResult?.submission.status === "error"
      ? (lastResult.submission.error as SubmissionError)?.password
      : [];
  const globalError =
    lastResult?.submission.status === "error"
      ? (lastResult.submission.error as SubmissionError)?.global
      : [];

  return (
    <div className="flex justify-center items-center p-10">
      <Form
        method="POST"
        {...getFormProps(form)}
        className={cn("flex flex-col gap-6 ")}
      >
        <HoneypotInputs label="lease leave this field blank" />
        <div className="flex flex-col items-center gap-2 text-center">
          <h1 className="text-2xl font-bold">Login to your account</h1>
          <p className="text-balance text-sm text-muted-foreground">
            Enter your email below to login to your account
          </p>
        </div>
        <div className="grid gap-6">
          <div className="grid gap-2">
            <Label htmlFor={fields.email.id}>Email</Label>
            <Input
              {...getInputProps(fields.email, { type: "email" })}
              id="email"
              type="email"
              placeholder="bobby@example.com"
              onChange={(e) => setEmail(e.target.value)}
              value={email}
              required
            />
            <ErrorList id={fields.email.errorId} errors={emailError} />
          </div>
          <div className="grid gap-2">
            <Label htmlFor={fields.password.id}>Password</Label>
            <Input
              {...getInputProps(fields.password, { type: "password" })}
              id="password"
              type="password"
              onChange={(e) => setPassword(e.target.value)}
              value={password}
              required
            />
            <ErrorList id={fields.password.errorId} errors={passwordError} />
          </div>
          <div className="flex justify-between items-center text-sm">
            <div className="flex gap-2">
              <Checkbox id={fields.remember.id} name={fields.remember.name} />
              <label htmlFor={fields.remember.id}>Remember me</label>
            </div>
            {/* <Link
              to="#"
              className="ml-auto text-sm underline-offset-4 hover:underline"
            >
              Forgot your password?
            </Link> */}
          </div>
          <ErrorList id={form.errorId} errors={globalError} />
          <StatusButton
            status={isSubmitting ? "pending" : "idle"}
            type="submit"
            className="w-full"
          >
            Login
          </StatusButton>
          {/* <div className="relative text-center text-sm after:absolute after:inset-0 after:top-1/2 after:z-0 after:flex after:items-center after:border-t after:border-border">
            <span className="relative z-10 bg-background px-2 text-muted-foreground">
              Or continue with
            </span>
          </div>

          <StatusButton status="idle">Login with GitHub</StatusButton> */}
        </div>
        <div className="text-center text-sm">
          Don&apos;t have an account?{" "}
          <Link to="/register" className="underline underline-offset-4">
            Sign up
          </Link>
        </div>
      </Form>
    </div>
  );
}
