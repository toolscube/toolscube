"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import InputField from "@/components/shared/form-fields/input-field";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { signUpAction } from "@/lib/actions/auth.action";
import logger from "@/lib/logger";

const signUpFormSchema = z
  .object({
    name: z.string().min(2, "Name must be at least 2 characters"),
    email: z.string().email("Please enter a valid email address"),
    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
        "Password must contain at least one uppercase letter, one lowercase letter, and one number",
      ),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

type SignUpFormData = z.infer<typeof signUpFormSchema>;

export default function SignUpForm() {
  const [isLoading, setIsLoading] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const router = useRouter();

  const form = useForm<SignUpFormData>({
    resolver: zodResolver(signUpFormSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  const onSubmit = async (data: SignUpFormData) => {
    setIsLoading(true);

    try {
      const result = await signUpAction({
        name: data.name,
        email: data.email,
        password: data.password,
      });

      if (result.error) {
        toast.error(result.error);
      } else if (result.success) {
        toast.success(result.message || "Account created successfully!");
        router.push(`/verify-email?email=${encodeURIComponent(data.email)}`);
      }
    } catch (error) {
      logger.error({ error }, "Sign up error");
      toast.error("Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <InputField
          name="name"
          label="Full Name"
          type="text"
          placeholder="John Doe"
          disabled={isLoading}
          value={name}
          onChange={(e) => setName(e.target.value)}
        />

        <InputField
          name="email"
          label="Email"
          type="email"
          placeholder="name@example.com"
          disabled={isLoading}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <InputField
          name="password"
          label="Password"
          type="password"
          placeholder="Create a strong password"
          disabled={isLoading}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <InputField
          name="confirmPassword"
          label="Confirm Password"
          type="password"
          placeholder="Confirm your password"
          disabled={isLoading}
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
        />

        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Create Account
        </Button>
      </form>
    </Form>
  );
}
