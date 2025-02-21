import { getFormProps, getInputProps, SubmissionResult, useForm } from "@conform-to/react";
import { getZodConstraint, parseWithZod } from "@conform-to/zod";
import { ActionFunctionArgs, json, redirect } from "@remix-run/node";
import { Form, Link, useActionData, useFormAction, useNavigation } from "@remix-run/react";
import { isValid, z } from "zod";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { StatusButton } from "~/components/ui/status-button";
import { cn } from "~/lib/utils";
import { prisma } from "../utils/db.server";
import { ErrorList } from "~/components/error-list";
import { EmailSchema, PasswordSchema } from "~/utils/user-validation";
import { sessionStorage } from "~/utils/session.server";
import bcrypt from "bcryptjs";
import { useState } from "react";

const loginSchema = z.object({
  email: EmailSchema,
  password: PasswordSchema,
});

export async function action({ request }: ActionFunctionArgs) {
  const formData = await request.formData();
  const data = Object.fromEntries(formData.entries());
  console.log("formData", data);

  const submission = await parseWithZod(formData, {
    schema: loginSchema.transform(async (data, ctx) => {
      const user = await prisma.user.findUnique({
        select: { id: true, password: true },
        where: { email: data.email },
      });

      if (!user || !user.password) {
        ctx.addIssue({
          path: ["global"],
          code: "custom",
          message: "Неверный адрес электронной почты или пароль",
        });
        return z.NEVER;
      }

      const pswd = data.password;
      const hash = user.password?.hash;

      const isValid = await bcrypt.compare(pswd, hash);

      if (!isValid) {
        ctx.addIssue({
          code: "custom",
          message: "Неверный адрес электронной почты или пароль",
          path: ["global"],
        });
        return z.NEVER;
      }

      return { ...data, user: { id: user.id } };
    }),
    async: true,
  });

  // get the password off the payload that's sent back
  console.log("password", submission.payload.password);
  delete submission.payload.password;

  // If validation fails, return an error response
  if (submission.status !== "success") {
    console.log("Submission result:", submission);
    return json({ status: "error", submission }, { status: 400 });
  }

  // Handle non-submit intents (e.g., validation-only requests)
  // if (submission.intent !== "submit") {
  //   return json({ status: "idle", submission });
  // }

  // If validation fails, return an error response
  if (!submission.value?.user) {
    return json({ status: "error", submission }, { status: 400 });
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
    defaultValue: lastResult?.submission.payload,
  });

  const emailError =
    lastResult?.submission.status === "error" ? lastResult.submission.error?.email : [];
  const passwordError =
    lastResult?.submission.status === "error" ? lastResult.submission.error?.password : [];
  const globalError =
    lastResult?.submission.status === "error" ? lastResult.submission.error?.global : [];

  return (
    <div className="flex justify-center items-center p-10">
      <Form method="POST" {...getFormProps(form)} className={cn("flex flex-col gap-6 ")}>
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
            <div className="flex items-center">
              <Label htmlFor={fields.password.id}>Password</Label>
              <Link to="#" className="ml-auto text-sm underline-offset-4 hover:underline">
                Forgot your password?
              </Link>
            </div>
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
          <ErrorList id={form.errorId} errors={globalError} />
          <StatusButton status={isSubmitting ? "pending" : "idle"} type="submit" className="w-full">
            Login
          </StatusButton>
          <div className="relative text-center text-sm after:absolute after:inset-0 after:top-1/2 after:z-0 after:flex after:items-center after:border-t after:border-border">
            <span className="relative z-10 bg-background px-2 text-muted-foreground">
              Or continue with
            </span>
          </div>

          <StatusButton status="idle">Login with GitHub</StatusButton>
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
