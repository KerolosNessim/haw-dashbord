import { Button } from "@/components/ui/button";
import {
  Field,
  FieldContent,
  FieldError,
  FieldLabel
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, LogIn } from "lucide-react";
import { useForm, type FieldError as RHFFieldError } from "react-hook-form";
import { useTranslation } from "react-i18next";
import * as z from "zod";

import { useLogin } from "../hooks/uselogin";

const loginSchema = z.object({
  email: z.string().email({ message: "validation.email_invalid" }).min(1, { message: "validation.email_required" }),
  password: z.string().min(1, { message: "validation.password_required" }),
});

export type LoginValues = z.infer<typeof loginSchema>;

export function LoginForm() {
  const { t } = useTranslation();
  const { loginMutation, isPending } = useLogin();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = (values: LoginValues) => {
    loginMutation(values);
  };

  /**
   * Helper to translate error messages if they are keys
   */
  const translateError = (error: RHFFieldError | undefined) => {
    if (!error) return undefined;
    const message = error.message;
    if (!message) return undefined;
    // If the message is a translation key (e.g. contains 'validation.'), translate it
    return message.includes("validation.") ? t(message) : message;
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 w-full animate-in fade-in duration-500">
      <Field>
        <FieldLabel htmlFor="email">{t("email_label")}</FieldLabel>
        <FieldContent>
          <Input
            {...register("email")}
            id="email"
            type="email"
            placeholder={t("email_placeholder")}
            className="h-12 rounded-xl bg-muted/10 border-border/50 focus:bg-background transition-colors"
            aria-invalid={!!errors.email}
          />
          <FieldError errors={[{ message: translateError(errors.email) }]} />
        </FieldContent>
      </Field>

      <Field>
        <FieldLabel htmlFor="password">{t("password_label")}</FieldLabel>
        <FieldContent>
          <Input
            {...register("password")}
            id="password"
            type="password"
            placeholder={t("password_placeholder")}
            className="h-12 rounded-xl bg-muted/10 border-border/50 focus:bg-background transition-colors"
            aria-invalid={!!errors.password}
          />
          <FieldError errors={[{ message: translateError(errors.password) }]} />
        </FieldContent>
      </Field>

      <Button 
        type="submit" 
        className="w-full h-12 rounded-xl font-bold text-lg gap-2 shadow-lg shadow-primary/20 brightness-110 active:scale-[0.98] transition-all" 
        disabled={isPending}
      >
        {isPending ? (
          <Loader2 className="w-5 h-5 animate-spin" />
        ) : (
          <>
            <LogIn className="w-5 h-5" />
            {t("login_button")}
          </>
        )}
      </Button>
    </form>
  );
}


