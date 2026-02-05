import { useForm } from "@tanstack/react-form";
import { Link, useNavigate } from "@tanstack/react-router";
import { useTransition } from "react";
import toast from "react-hot-toast";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import {
    Field,
    FieldDescription,
    FieldError,
    FieldGroup,
    FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { authClient } from "@/lib/auth-client";
import { loginSchema } from "@/schemas/auth";

export function LoginForm() {
    const navigate = useNavigate();

    const [isPending, startTransition] = useTransition();

    const form = useForm({
        defaultValues: {
            email: "",
            password: "",
        },
        validators: { onSubmit: loginSchema },
        onSubmit: ({ value }) => {
            startTransition(async () => {
                await authClient.signIn.email(
                    {
                        email: value.email,
                        password: value.password,
                        // callbackURL: "/dashboard",
                    },
                    {
                        onSuccess: () => {
                            toast.success("Logged in successfully");
                            navigate({ to: "/dashboard", replace: true });
                        },
                        onError: ({ error }) => {
                            toast.error(error.message);
                        },
                    }
                );
            });
        },
    });

    return (
        <Card className="w-full max-w-md">
            <CardHeader>
                <CardTitle>Login to your account</CardTitle>
                <CardDescription>
                    Enter your email below to login to your account
                </CardDescription>
            </CardHeader>

            <CardContent>
                <form
                    onSubmit={(e) => {
                        e.preventDefault();
                        form.handleSubmit();
                    }}
                >
                    <FieldGroup>
                        <form.Field name="email">
                            {(field) => {
                                const isInvalid =
                                    field.state.meta.isTouched &&
                                    !field.state.meta.isValid;
                                return (
                                    <Field data-invalid={isInvalid}>
                                        <FieldLabel htmlFor={field.name}>
                                            Email
                                        </FieldLabel>
                                        <Input
                                            aria-invalid={isInvalid}
                                            autoComplete="off"
                                            id={field.name}
                                            name={field.name}
                                            onBlur={field.handleBlur}
                                            onChange={(e) =>
                                                field.handleChange(
                                                    e.target.value
                                                )
                                            }
                                            placeholder="johnfisher@example.com"
                                            type="email"
                                            value={field.state.value}
                                        />
                                        {isInvalid && (
                                            <FieldError
                                                errors={field.state.meta.errors}
                                            />
                                        )}
                                    </Field>
                                );
                            }}
                        </form.Field>

                        <form.Field name="password">
                            {(field) => {
                                const isInvalid =
                                    field.state.meta.isTouched &&
                                    !field.state.meta.isValid;
                                return (
                                    <Field data-invalid={isInvalid}>
                                        <div className="flex items-center">
                                            <FieldLabel htmlFor={field.name}>
                                                Password
                                            </FieldLabel>
                                            <Link
                                                className="ml-auto inline-block text-sm underline-offset-4 hover:underline"
                                                to="#"
                                            >
                                                Forgot your password?
                                            </Link>
                                        </div>

                                        <Input
                                            aria-invalid={isInvalid}
                                            autoComplete="off"
                                            id={field.name}
                                            name={field.name}
                                            onBlur={field.handleBlur}
                                            onChange={(e) =>
                                                field.handleChange(
                                                    e.target.value
                                                )
                                            }
                                            placeholder="********"
                                            type="password"
                                            value={field.state.value}
                                        />
                                        {isInvalid && (
                                            <FieldError
                                                errors={field.state.meta.errors}
                                            />
                                        )}
                                    </Field>
                                );
                            }}
                        </form.Field>

                        <Field>
                            <Button disabled={isPending} type="submit">
                                {isPending ? "Logging in..." : "Login"}
                            </Button>

                            <FieldDescription className="text-center">
                                Don&apos;t have an account?{" "}
                                <Link to="/signup">Sign up</Link>
                            </FieldDescription>
                        </Field>
                    </FieldGroup>
                </form>
            </CardContent>
        </Card>
    );
}
