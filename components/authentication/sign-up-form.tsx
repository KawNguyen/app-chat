"use client";

import { useState } from "react";
import { useForm } from "@tanstack/react-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Field, FieldError, FieldGroup, FieldLabel } from "../ui/field";
import { Eye, EyeOff } from "lucide-react";
import { Spinner } from "../ui/spinner";
import { registerSchema } from "@/lib/validations/register";
import { signUp } from "@/lib/auth-client";

export default function SignUpForm() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const router = useRouter();

  const form = useForm({
    defaultValues: {
      email: "",
      username: "",
      password: "",
      confirmPassword: "",
    },
    onSubmit: async ({ value }) => {
      if (value.password !== value.confirmPassword) {
        toast.error("Passwords do not match");
        return;
      }

      if (!value.username || value.username.trim() === "") {
        toast.error("Username is required");
        return;
      }

      try {
        const result = await signUp.email({
          email: value.email,
          password: value.password,
          name: value.username,
        });

        if (result.error) {
          toast.error(result.error.message || "Sign up failed");
          return;
        }

        toast.success("Account created successfully!");
        router.push("/");
        router.refresh();
      } catch (error) {
        console.error("Sign up error:", error);
        toast.error("An error occurred during sign up");
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
      <FieldGroup>
        <form.Field
          name="email"
          validators={{ onChange: registerSchema.shape.email }}
        >
          {(field) => {
            const isInvalid =
              field.state.meta.isTouched && !field.state.meta.isValid;
            return (
              <Field>
                <FieldLabel htmlFor="email">Email</FieldLabel>
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

        <form.Field
          name="username"
          validators={{ onChange: registerSchema.shape.name }}
        >
          {(field) => {
            const isInvalid =
              field.state.meta.isTouched && !field.state.meta.isValid;
            return (
              <Field>
                <FieldLabel htmlFor="username">Username</FieldLabel>
                <Input
                  id={field.name}
                  name={field.name}
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(e) => field.handleChange(e.target.value)}
                  aria-invalid={isInvalid}
                  placeholder="Choose a username"
                  type="text"
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

        <form.Field
          name="password"
          validators={{ onChange: registerSchema.shape.password }}
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
                    size="icon-sm"
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

        <form.Field
          name="confirmPassword"
          validators={{
            onChange: registerSchema.shape.password,
          }}
        >
          {(field) => {
            const isInvalid =
              field.state.meta.isTouched && !field.state.meta.isValid;
            return (
              <Field>
                <FieldLabel htmlFor="confirm-password">
                  Confirm Password
                </FieldLabel>
                <div className="relative">
                  <Input
                    id={field.name}
                    name={field.name}
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(e) => field.handleChange(e.target.value)}
                    aria-invalid={isInvalid}
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="**********"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon-sm"
                    className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-max bg-none"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? (
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
                Creating account...
              </div>
            ) : (
              "Create Account"
            )}
          </Button>
        )}
      </form.Subscribe>
    </form>
  );
}
