"use client";

import { useState } from "react";
import { useForm } from "@tanstack/react-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { signIn } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Field, FieldError, FieldGroup, FieldLabel } from "../ui/field";
import { Eye, EyeOff } from "lucide-react";
import { loginSchema } from "@/lib/validations/login";
import { Spinner } from "../ui/spinner";

export default function LoginForm() {
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();

  const form = useForm({
    defaultValues: {
      email: "",
      password: "",
    },
    onSubmit: async ({ value }) => {
      try {
        const result = await signIn.email({
          email: value.email,
          password: value.password,
        });

        if (result.error) {
          toast.error(result.error.message || "Login failed");
          return;
        }

        toast.success("Welcome back!");
        router.push("/");
        router.refresh();
      } catch {
        toast.error("An error occurred during login");
      }
    },
  });

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        form.handleSubmit();
      }}
      className="space-y-6"
    >
      {/* Email Field */}
      <FieldGroup>
        <form.Field
          name="email"
          validators={{ onChange: loginSchema.shape.email }}
        >
          {(field) => {
            const isInvalid =
              field.state.meta.isTouched && !field.state.meta.isValid;
            return (
              <Field>
                <FieldLabel htmlFor="email">Email address</FieldLabel>
                <Input
                  id={field.name}
                  name={field.name}
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(e) => field.handleChange(e.target.value)}
                  aria-invalid={isInvalid}
                  placeholder="your@example.com"
                  type="email"
                />
                {isInvalid ? (
                  <FieldError>
                    {field.state.meta.errors?.[0]?.message}
                  </FieldError>
                ) : null}
              </Field>
            );
          }}
        </form.Field>
        {/* Password Field */}
        <form.Field
          name="password"
          validators={{ onChange: loginSchema.shape.password }}
        >
          {(field) => {
            const isInvalid =
              field.state.meta.isTouched && !field.state.meta.isValid;
            return (
              <Field>
                <FieldLabel htmlFor="password">Password</FieldLabel>
                <div className="relative">
                  <Input
                    id={field.name}
                    name={field.name}
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(e) => field.handleChange(e.target.value)}
                    aria-invalid={isInvalid}
                    type={showPassword ? "text" : "password"}
                    placeholder="**********"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size={"icon-sm"}
                    className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-max bg-none"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </Button>
                </div>
                {isInvalid ? (
                  <FieldError>
                    {field.state.meta.errors?.[0]?.message}
                  </FieldError>
                ) : null}
              </Field>
            );
          }}
        </form.Field>
      </FieldGroup>

      <form.Subscribe
        selector={(state) => [state.canSubmit, state.isSubmitting]}
      >
        {([canSubmit, isSubmitting]) => (
          <Button
            type="submit"
            disabled={!canSubmit || isSubmitting}
            className="w-full"
            size="lg"
          >
            {isSubmitting ? (
              <div className="flex items-center gap-2">
                <Spinner />
                Signing in...
              </div>
            ) : (
              "Enter Realm"
            )}
          </Button>
        )}
      </form.Subscribe>
    </form>
  );
}
